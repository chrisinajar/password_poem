var createHash = require('create-hash');
var randomBytes = require('randombytes');

module.exports = {
  checksumBits: checksumBits,
  bytesToBinary: bytesToBinary,
  lpad: lpad
};

function checksumBits (entropyBuffer) {
  var hash = createHash('sha256').update(entropyBuffer).digest();

  // Calculated constants from BIP39
  var ENT = entropyBuffer.length * 8;
  var CS = ENT / 32;

  return bytesToBinary([].slice.call(hash)).slice(0, CS);
}

// =========== helper methods from bitcoinjs-lib ========

function bytesToBinary (bytes) {
  return bytes.map(function (x) {
    return lpad(x.toString(2), '0', 8)
  }).join('')
}

function lpad (str, padString, length) {
  while (str.length < length) str = padString + str
  return str
}
