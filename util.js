var CMUDict = require('cmudict').CMUDict;
var pos = require('pos');

var cmudict = new CMUDict()

module.exports = {
  isWord: isWord,
  partOfSpeach: partOfSpeach
};

function isWord(word) {
  return !!cmudict.get(word);
}

function partOfSpeach (word) {
  var words = new pos.Lexer().lex(word);
  var tagger = new pos.Tagger();
  var tagged = tagger.tag(words);

  tagged = tagged
    .filter(function (tag) {
      return tag[0] === word;
    })
    .map(function (tag) {
      return tag[1];
    });

  return tagged.length ? tagged[0] : null;
}