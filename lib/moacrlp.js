/**
 * MOAC RLP Encoding following ETHEREUM RLP rules
 * based on: https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-RLP
 * This function takes in a data, convert it to buffer if not, and a length for recursion
 * 
 * RLP encoding is defined as follows:
 * a single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.
 * 
 * a string is 0-55 bytes long, the RLP encoding consists of a single byte with value 0x80 plus 
 *   the length of the string followed by the string. The range of the first byte is thus [0x80, 0xb7].
 * a string is more than 55 bytes long, the RLP encoding consists of a single byte with 
 *   value 0xb7 plus the length in bytes of the length of the string in binary form, 
 *   followed by the length of the string, followed by the string. 
 *   e.g.: a length-1024 string would be encoded as \xb9\x04\x00 followed by the string. 
 *   The range of the first byte is thus [0xb8, 0xbf].
 * 
 * a list (i.e. the combined length of all its items being RLP encoded) is 0-55 bytes long, 
 *   the RLP encoding consists of a single byte with value 0xc0 plus the length of the list followed 
 *   by the concatenation of the RLP encodings of the items. The range of the first byte is thus [0xc0, 0xf7].
 * a list is more than 55 bytes long, the RLP encoding consists of a single byte with value 0xf7 
 *   plus the length in bytes of the length of the payload in binary form, followed by the length of the payload, 
 *   followed by the concatenation of the RLP encodings of the items. The range of the first byte is thus [0xf8, 0xff].
 *
 * @param {Buffer,String,Integer,Array} data - will be converted to buffer
 * @returns {Buffer} - returns buffer of encoded data
 **/
const assert = require('assert')

exports.encode = function (input) {
  // console.log("RLP encoding ...", input);
  
  if (input instanceof Array) {
    // console.log("Array")
    var output = []
    for (var i = 0; i < input.length; i++) {
      output.push(exports.encode(input[i]))
    }
    var buf = Buffer.concat(output)
    return Buffer.concat([encodeLength(buf.length, 192), buf])
  } else {
     // console.log("Not Array")
    input = toBuffer(input)
    if (input.length === 1 && input[0] < 128) {
      return input
    } else {
      return Buffer.concat([encodeLength(input.length, 128), input])
    }
  }
}

function safeParseInt (v, base) {
  if (v.slice(0, 2) === '00') {
    throw (new Error('invalid RLP: extra zeros'))
  }

  return parseInt(v, base)
}

function encodeLength (len, offset) {
  if (len < 56) {
    return new Buffer([len + offset])
  } else {
    var hexLength = intToHex(len)
    var lLength = hexLength.length / 2
    var firstByte = intToHex(offset + 55 + lLength)
    return new Buffer(firstByte + hexLength, 'hex')
  }
}

/**
 * RLP Decoding based on: {@link https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-RLP|RLP}
 * @param {Buffer,String,Integer,Array} data - will be converted to buffer
 * @returns {Array} - returns decode Array of Buffers containg the original message
 **/
exports.decode = function (input, stream) {
  if (!input || input.length === 0) {
    return new Buffer([])
  }

  input = toBuffer(input)
  var decoded = _decode(input)

  if (stream) {
    return decoded
  }

  assert.equal(decoded.remainder.length, 0, 'invalid remainder')
  return decoded.data
}

exports.getLength = function (input) {
  if (!input || input.length === 0) {
    return new Buffer([])
  }

  input = toBuffer(input)
  var firstByte = input[0]
  if (firstByte <= 0x7f) {
    return input.length
  } else if (firstByte <= 0xb7) {
    return firstByte - 0x7f
  } else if (firstByte <= 0xbf) {
    return firstByte - 0xb6
  } else if (firstByte <= 0xf7) {
    // a list between  0-55 bytes long
    return firstByte - 0xbf
  } else {
    // a list  over 55 bytes long
    var llength = firstByte - 0xf6
    var length = safeParseInt(input.slice(1, llength).toString('hex'), 16)
    return llength + length
  }
}

function _decode (input) {
  var length, llength, data, innerRemainder, d
  var decoded = []
  var firstByte = input[0]

  if (firstByte <= 0x7f) {
    // a single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.
    return {
      data: input.slice(0, 1),
      remainder: input.slice(1)
    }
  } else if (firstByte <= 0xb7) {
    // string is 0-55 bytes long. A single byte with value 0x80 plus the length of the string followed by the string
    // The range of the first byte is [0x80, 0xb7]
    length = firstByte - 0x7f

    // set 0x80 null to 0
    if (firstByte === 0x80) {
      data = new Buffer([])
    } else {
      data = input.slice(1, length)
    }

    if (length === 2 && data[0] < 0x80) {
      throw new Error('invalid rlp encoding: byte must be less 0x80')
    }

    return {
      data: data,
      remainder: input.slice(length)
    }
  } else if (firstByte <= 0xbf) {
    llength = firstByte - 0xb6
    length = safeParseInt(input.slice(1, llength).toString('hex'), 16)
    data = input.slice(llength, length + llength)
    if (data.length < length) {
      throw (new Error('invalid RLP'))
    }

    return {
      data: data,
      remainder: input.slice(length + llength)
    }
  } else if (firstByte <= 0xf7) {
    // a list between  0-55 bytes long
    length = firstByte - 0xbf
    innerRemainder = input.slice(1, length)
    while (innerRemainder.length) {
      d = _decode(innerRemainder)
      decoded.push(d.data)
      innerRemainder = d.remainder
    }

    return {
      data: decoded,
      remainder: input.slice(length)
    }
  } else {
    // a list  over 55 bytes long
    llength = firstByte - 0xf6
    length = safeParseInt(input.slice(1, llength).toString('hex'), 16)
    var totalLength = llength + length
    if (totalLength > input.length) {
      throw new Error('invalid rlp: total length is larger than the data')
    }

    innerRemainder = input.slice(llength, totalLength)
    if (innerRemainder.length === 0) {
      throw new Error('invalid rlp, List has a invalid length')
    }

    while (innerRemainder.length) {
      d = _decode(innerRemainder)
      decoded.push(d.data)
      innerRemainder = d.remainder
    }
    return {
      data: decoded,
      remainder: input.slice(totalLength)
    }
  }
}

function isHexPrefixed (str) {
  return str.slice(0, 2) === '0x'
}

// Removes 0x from a given String
function stripHexPrefix (str) {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str.slice(2) : str
}

function intToHex (i) {
  var hex = i.toString(16)
  if (hex.length % 2) {
    hex = '0' + hex
  }

  return hex
}

function padToEven (a) {
  if (a.length % 2) a = '0' + a
  return a
}

function intToBuffer (i) {
  var hex = intToHex(i)
  return new Buffer(hex, 'hex')
}

/*
 * Convert the input variable to Buffer
 *
*/
function toBuffer (v) {
  if (!Buffer.isBuffer(v)) {
    if (typeof v === 'string') {
      if (isHexPrefixed(v)) {
        v = new Buffer(padToEven(stripHexPrefix(v)), 'hex')
      } else {
        v = new Buffer(v)
      }
    } else if (typeof v === 'number') {
      if (!v) {
        v = new Buffer([])
      } else {
        v = intToBuffer(v)
      }
    } else if (v === null || v === undefined) {
      v = new Buffer([])
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = new Buffer(v.toArray())
    } else {
      throw new Error('invalid type')
    }
  }
  return v
}
