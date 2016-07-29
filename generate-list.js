var wordList = require('./freq-words').map(function (entry) {
  return entry.word;
});
var wordStats = require('./word-stats');
var flatten = require('array-flatten');

var firstCharacters = 'ZZZZ';
var NNt = 0;

function processWordList (wordList) {
  return wordList
    .map(wordStats)
    .filter(function (stats) {
      return stats;
    })
    .map(function (stats) {
      stats.pos = stats.pos;
      if (stats.pos === 'VBN') {
        stats.pos = 'VB';
      }
      if (stats.pos === 'NN') {
        stats.pos += NNt++ % 2;
      }
      return stats;
    })
    .filter(function (stats) {
      if (stats.word.length >= 4) {
        return true;
      }
    })
    .filter(function (stats) {
      if (stats.syllables >= 1) {
        return true;
      }
    })
    .filter(function (stats) {
      var myFirstCharacters = stats.word.substr(0, 5);
      if (myFirstCharacters === firstCharacters) {
        return false;
      }
      firstCharacters = myFirstCharacters;
      return true;
    })
    .filter(function (stats) {
      return !stats.stress.match(/(uuu|ss|uu.)/);
    })
}

var myList = processWordList(wordList);

var rhymes = {};
var poss = {};
var wordSounds = {};

myList.forEach(function (entry) {
  if (!rhymes[entry.rhyme]) {
    rhymes[entry.rhyme] = 1;
  } else {
    rhymes[entry.rhyme]++;
  }
  if (!poss[entry.pos]) {
    poss[entry.pos] = 1;
  } else {
    poss[entry.pos]++;
  }
  entry.cmu.split(' ').forEach(function (sound) {
    sound = sound.replace(/[0-9]/, '');
    wordSounds[sound] = true;
  });
});

wordSounds = Object.keys(wordSounds);

var blackList = [];

Object.keys(rhymes).forEach(function (rhyme) {
  if (rhymes[rhyme] < 10) {
    blackList.push(rhyme);
  }
});

myList = myList
  .filter(function (entry) {
    return blackList.indexOf(entry.rhyme) === -1;
  });

var parts = ['JJ', 'VB', 'NN0', 'NN1'];
var result = {};
parts.forEach(function (pos) {
    result[pos] = myList
      .filter(function (entry) {
        return entry.pos === pos;
      })
      .slice(0, 1024);
  });

console.log(JSON.stringify(result, true, 2));
