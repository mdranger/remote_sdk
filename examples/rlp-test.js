const assert = require('assert')
const RLP = require('../lib/moacrlp.js')

// describe('invalid rlps', function () {
//   it('should not crash on an invalid rlp', function () {
//     var a = new Buffer([239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 239, 191, 189, 29, 239, 191, 189, 77, 239, 191, 189, 239, 191, 189, 239, 191, 189, 93, 122, 239, 191, 189, 239, 191, 189, 239, 191, 189, 103, 239, 191, 189, 239, 191, 189, 239, 191, 189, 26, 239, 191, 189, 18, 69, 27, 239, 191, 189, 239, 191, 189, 116, 19, 239, 191, 189, 239, 191, 189, 66, 239, 191, 189, 64, 212, 147, 71, 239, 191, 189, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 239, 191, 189, 11, 222, 155, 122, 54, 42, 194, 169, 239, 191, 189, 70, 239, 191, 189, 72, 239, 191, 189, 239, 191, 189, 54, 53, 239, 191, 189, 100, 73, 239, 191, 189, 55, 239, 191, 189, 239, 191, 189, 59, 1, 239, 191, 189, 109, 239, 191, 189, 239, 191, 189, 93, 239, 191, 189, 208, 128, 239, 191, 189, 239, 191, 189, 0, 239, 191, 189, 239, 191, 189, 239, 191, 189, 15, 66, 64, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 4, 239, 191, 189, 79, 103, 239, 191, 189, 85, 239, 191, 189, 239, 191, 189, 239, 191, 189, 74, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 54, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 239, 191, 189, 83, 239, 191, 189, 14, 239, 191, 189, 239, 191, 189, 239, 191, 189, 4, 63, 239, 191, 189, 63, 239, 191, 189, 41, 239, 191, 189, 239, 191, 189, 239, 191, 189, 67, 28, 239, 191, 189, 239, 191, 189, 11, 239, 191, 189, 31, 239, 191, 189, 239, 191, 189, 104, 96, 100, 239, 191, 189, 239, 191, 189, 12, 239, 191, 189, 239, 191, 189, 206, 152, 239, 191, 189, 239, 191, 189, 31, 112, 111, 239, 191, 189, 239, 191, 189, 65, 239, 191, 189, 41, 239, 191, 189, 239, 191, 189, 53, 84, 11, 239, 191, 189, 239, 191, 189, 12, 102, 24, 12, 42, 105, 109, 239, 191, 189, 58, 239, 191, 189, 4, 239, 191, 189, 104, 82, 9, 239, 191, 189, 6, 66, 91, 43, 38, 102, 117, 239, 191, 189, 105, 239, 191, 189, 239, 191, 189, 239, 191, 189, 89, 127, 239, 191, 189, 114])
//     try {
//       rlp.decode(a)
//     } catch (e) {
//       assert(true)
//     }
//   })
// })
    var encodedSelf = RLP.encode('a')
    assert.equal(encodedSelf.toString(), 'a')
    console.log("Decode....")
// var in_cmd = new Buffer('0xf86c168509502f9000825208947312f4b8a4457a36827f185325fd6b66a3f8bb8b88016345785d8a0000001ba0c515be40cdaed29997219eb5fb1002ac03e35b8666ce84c3b9e181ad13760ea4a01eb2ded06283fb4663652120f031b5b0cef06b9cf0a831d3c2b5a158460790c1');
var in_cmd = "f86c168509502f9000825208947312f4b8a4457a36827f185325fd6b66a3f8bb8b88016345785d8a0000001ba0c515be40cdaed29997219eb5fb1002ac03e35b8666ce84c3b9e181ad13760ea4a01eb2ded06283fb4663652120f031b5b0cef06b9cf0a831d3c2b5a158460790c1";

    var a = RLP.encode(in_cmd)
    var b = RLP.encode('0x'+in_cmd)
    assert.notEqual(a.toString('hex'), b.toString('hex'))
var decode_cmd = RLP.decode(a);
console.log(decode_cmd);

return;

