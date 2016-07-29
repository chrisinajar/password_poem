var createHash = require('create-hash');
var randomBytes = require('randombytes');

var checksumBits = require('./helper').checksumBits;
var bytesToBinary = require('./helper').bytesToBinary;

var DEFAULT_WORDLIST = require('./poem-words');

function generatePoem (strength, rng, wordlist) {
  strength = strength || 256;
  rng = rng || randomBytes;

  var hex = rng(strength / 8).toString('hex');

  return entropyToMnemonic(hex, wordlist);
}

function entropyToMnemonic (entropy, wordlist) {
  wordlist = wordlist || DEFAULT_WORDLIST;

  var entropyBuffer = new Buffer(entropy, 'hex');
  var entropyBits = bytesToBinary([].slice.call(entropyBuffer));
  var checksum = checksumBits(entropyBuffer);

  var bits = entropyBits + checksum;
  console.log(bits.match(/(.{1,11})/g));

  var lines = bits.match(/(.{1,33})/g);

  lines = lines.map(function (lineBits) {
    var structureBits = lineBits.substr(0, 3);
    var chunks = lineBits.substr(3).match(/(.{1,10})/g);
    console.log(structureBits, chunks);

    var structure = getStructure(structureBits);
    console.log(structure);

    var syllables = 0;
    var lineData = chunks.map(function (binary, i) {
      var pos = structure[i];
      if (wordlist[pos].length < 1024) {
        console.log('Loss of entropy in', pos, '1024 %', wordlist[pos].length);
      }
      var index = parseInt(binary, 2) % wordlist[pos].length;
      var entry = wordlist[pos][index];
      syllables += entry.syllables;
      return entry;
    });

    console.log(syllables);

    
    // for printing
    var words = lineData.map(function (data) {
      return data.word;
    });

    return words.join(' ');
  });

  return lines.join('\n');
}

// deduce sentence structure
var STRUCTURES = [
  ['JJ', 'NN0', 'VB'],
  ['JJ', 'NN1', 'VB'],
  ['NN0', 'VB', 'NN0'],
  ['NN0', 'VB', 'NN1'],
  ['NN1', 'VB', 'NN0'],
  ['NN1', 'VB', 'NN1'],
  ['NN0', 'NN0', 'VB'],
  ['NN0', 'NN1', 'VB'],
  ['NN1', 'NN0', 'VB'],
  ['NN1', 'NN1', 'VB']
];

function getStructure (bits) {
  if (typeof bits === 'string') {
    bits = parseInt(bits, 2);
  }

  if (bits > STRUCTURES.length) {
    console.log('Loss of entropy in sentence structure 16 % ', STRUCTURES.length);
  }

  return STRUCTURES[bits % STRUCTURES.length];
}
// select words
// map stress fillers
// fill gaps

console.log(generatePoem());
