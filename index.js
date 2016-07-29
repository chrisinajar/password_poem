var bip39 = require('./bip39');
var flatten = require('array-flatten');
var wordStats = require('./word-stats');
var partial = require('ap').partial;

var passphrase = bip39.generateMnemonic(256);

var list = passphrase.split(' ');
var wordData = list.map(function (word) {
  console.log(word);
  return require('./words').find(function (entry) {
    return entry.word.toLowerCase() === word.toLowerCase();
  });
});

console.log(wordData);

var lastStress = false;
var totalSyllables = 0;
var consecutiveWords = 0;

var stressLevel = wordData
  .map(function (entry) {
    var stress = entry.stress;
    var myLastStress = lastStress;
    lastStress = stress[stress.length - 1];

    if (myLastStress && myLastStress === stress[0]) {
      consecutiveWords = 1;
      return [otherStress(myLastStress), entry];

    } else if (myLastStress && consecutiveWords > 2) {
      consecutiveWords = 1;
      return [otherStress(myLastStress) + myLastStress, entry];

    }
    consecutiveWords++;
    return entry;
  });

stressLevel = flatten(stressLevel);

stressLevel = stressLevel.map(function (entry) {
  if (entry.word) {
    return entry;
  }
  return fillerForStress(entry);
})

var newWords = stressLevel.map(function (entry) {
  return entry.word;
})

console.log(newWords.join(' '));


function generatePoem (wordData, lineLength) {
  var lines = [[]];
  var currentSylable = 0;
  var lastStress = false;

  wordData.forEach(function (entry) {
    var currentLine = lines[lines.length - 1];

    if (entry.stress[0] === lastStress && currentSylable < lineLength) {
      lastStress = otherStress(lastStress);
      currentLine.push(fillerForStress(lastStress));
      currentSylable++;
    }

    if (currentSylable + entry.syllables > lineLength) {
      var remaining = lineLength - currentSylable;
      // complete lines with not enough syllables!
      if (remaining === 1) {
        var innerEntry = currentLine[currentLine.length - 1];
        var worked = [
          'ing',
          'ed',
          'ly',
          'est',
          'er'
        ].find(partial(tryWordEnding, innerEntry));
        if (worked) {
          lastStress = otherStress(lastStress);
          remaining = 0;
        }
      }
      if (remaining > 0) {
        // needs more fluff at the end!
        var stressNeeded = '';
        while (remaining > 0) {
          lastStress = otherStress(lastStress);
          remaining--;
          if (fillerForStress(stressNeeded + lastStress)) {
            stressNeeded += lastStress;
          } else {
            currentLine.push(fillerForStress(stressNeeded));
            stressNeeded = lastStress;
          }
        }
        currentLine.push(fillerForStress(stressNeeded));
        console.log(currentSylable, entry, lastStress, stressNeeded, remaining, lineLength - currentSylable);
      }
      currentSylable = 0;
      lines.push([]);
      currentLine = lines[lines.length - 1];
    }

    if (currentLine.length === 0 && entry.stress[0] === 'u') {
      currentLine.push(fillerForStress('s'));
      currentSylable++;
    }

    lastStress = entry.stress[entry.stress.length - 1];
    currentSylable += entry.syllables;
    currentLine.push(entry);

    function tryWordEnding (innerEntry, ending) {
      var stats = wordStats(innerEntry.word + ending);
      if (!stats) {
        return;
      }
      console.log(ending, stats);
      innerEntry.word += ending;
      innerEntry.syllables++;
      currentSylable++;
      return true;
    }
  });

  return lines;
}

var lines = null;
var lines8 = generatePoem(wordData, 10);
var lines10 = [[]]

console.log(syllablesInLastLine(lines8), syllablesInLastLine(lines10));

if (8 - syllablesInLastLine(lines8) >= 10 - syllablesInLastLine(lines10)) {
  lines = lines10;
} else {
  lines = lines8;
}

function syllablesInLastLine (lines) {
  var line = lines[lines.length - 1];
  return line.reduce(function (memo, entry) {
    return memo + entry.syllables;
  }, 0);
}

stresses = lines.map(function (line) {
  return line.map(function (entry) {
    return entry.stress;
  }).join(' ');
});

lines = lines.map(function (line) {
  var syls = line.reduce(function(memo, entry) {
    return memo + entry.syllables;
  }, 0);
  console.log(syls);

  return line.map(function (entry) {
    return entry.word;
  }).join(' ');
});

console.log(lines);
console.log(stresses);

function otherStress (stress) {
  if (stress === 'u') {
    return 's';
  }
  return 'u';
}

function fillerForStress (stress) {
  var fillers = require('./filler-words');
  var possibilities = fillers[stress];

  if (!possibilities) {
    return null;
  }
  return possibilities[~~(possibilities.length * Math.random())];
}