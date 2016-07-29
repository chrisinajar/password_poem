var wordList = require('./small-words');
var wordStats = require('./word-stats');
var flatten = require('array-flatten');

var firstCharacters = 'ZZZZ';

var allowedPos = [
  'PRP$',
  'PRP',
  'RB',
  'VBD',
  'VBP',
  'VB',
  'IN',
  'WP',
  'DT',
  'CC',
  'RB'
];

var myList = wordList
  .map(wordStats)
  .map(function (entry) {
    return entry ? entry.singular : null;
  });

myList = flatten(myList);
myList = myList
  .filter(function (stats) {
    return stats;
  })
  .filter(function (stats) {
    if (stats.syllables < 3) {
      return true;
    }
  })
  .filter(function (stats) {
    return !stats.stress.match(/(uu|ss)/);
  })
  .filter(function (stats) {
    return allowedPos.indexOf(stats.pos) !== -1;
  })

var rhymes = {};
var wordSounds = {};

myList.forEach(function (entry) {
  if (!rhymes[entry.rhyme]) {
    rhymes[entry.rhyme] = 1;
  } else {
    rhymes[entry.rhyme]++;
  }
  entry.cmu.split(' ').forEach(function (sound) {
    sound = sound.replace(/[0-9]/, '');
    wordSounds[sound] = true;
  });
});

wordSounds = Object.keys(wordSounds);

var buckets = {};

myList.forEach(function (entry) {
  if (!buckets[entry.stress]) {
    buckets[entry.stress] = [];
  }
  buckets[entry.stress].push(entry);
})
// var blackList = [];

// Object.keys(rhymes).forEach(function (rhyme) {
//   if (rhymes[rhyme] < 10) {
//     blackList.push(rhyme);
//   }
// });

// myList = myList
//   .filter(function (entry) {
//     return blackList.indexOf(entry.rhyme) === -1;
//   });

console.log(JSON.stringify(buckets, true, 2));

