var s1 = require('./sample5000');
var s2 = require('./sample6000');
var top = require('./top5000');
var flatten = require('array-flatten');

var isWord = require('./util').isWord;
var partOfSpeach = require('./util').partOfSpeach;

var endings = [
  'ing', 'ed', 's', 'es', 'ly', 'd', 'er'
];

s1 = s1.map(function (data) {
  var rootWord = data.lemme;
  var alternative = data.word;

  var alternatives = endings
    .map(function (ending) {
      var newWord = rootWord + ending;
      if (newWord === alternative) {
        return 'zzzzzzz';
      }
      return newWord;
    })
    .filter(isWord);

  if (alternative !== rootWord) {
    alternatives.push(alternative);
  }

  // fix up data object
  delete data.lemme
  data.word = rootWord;
  data.alternatives = alternatives;

  return data;
});

s2 = s2.map(function (data) {

  data.alternatives = endings
    .map(function (ending) {
      var newWord = data.word + ending;
      return newWord;
    })
    .filter(isWord);

  return data;
});

top = top.map(function (data) {
  // console.log(data);

  data.alternatives = endings
    .map(function (ending) {
      var newWord = data.word + ending;
      return newWord;
    })
    .filter(isWord);

  return data;
});

var wordsFound = [];

var lists = []
  .concat(s1)
  .concat(s2)
  .concat(top)
  .sort(function (a, b) {
    return a.freq < b.freq;
  })
  .map(function (data) {
    var result = [];

    // result.concat(data.alternatives.map(function (alt) {
    //   return {
    //     word: alt,
    //     freq: data.freq,
    //     pos: partOfSpeach(alt)
    //   }
    // }));

    result.push({ 
      word: data.word,
      freq: data.freq,
      pos: data.pos
    });

    return result;
  });

lists = flatten(lists)
  .filter(function (data) {
    if (wordsFound.indexOf(data.word) !== -1) {
      return false;
    }
    wordsFound.push(data.word);
    return true;
  });

// console.log(lists.length);

console.log(JSON.stringify(lists, null, '  '));
