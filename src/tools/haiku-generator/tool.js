/* Haiku Generator — 5-7-5 lines assembled from syllable-counted word banks. */
(function () {
  'use strict';
  var SLUG = 'haiku-generator';
  // [word, syllables]
  var W1 = [['soft', 1], ['still', 1], ['moon', 1], ['wind', 1], ['snow', 1], ['rain', 1],
            ['leaf', 1], ['brook', 1], ['mist', 1], ['dusk', 1], ['dawn', 1], ['pond', 1],
            ['stone', 1], ['pine', 1], ['crane', 1], ['frog', 1], ['night', 1], ['light', 1]];
  var W2 = [['silent', 2], ['morning', 2], ['river', 2], ['meadow', 2], ['petal', 2],
            ['whisper', 2], ['shadow', 2], ['autumn', 2], ['winter', 2], ['summer', 2],
            ['golden', 2], ['gentle', 2], ['distant', 2], ['hollow', 2], ['willow', 2], ['heron', 2]];
  var W3 = [['butterfly', 3], ['evening', 3], ['mountain', 2], ['waterfall', 3],
            ['memories', 3], ['harmony', 3], ['firefly', 3], ['cherry tree', 3],
            ['wandering', 3], ['lullaby', 3], ['sunset glow', 3], ['quietly', 3]];
  var ALL = W1.concat(W2, W3);

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Build a line totaling exactly `target` syllables via random composition.
  function makeLine(target) {
    var words = [], total = 0, guard = 0;
    while (total < target && guard < 200) {
      guard++;
      var w = pick(ALL);
      if (total + w[1] > target) continue;
      // avoid repeating the same word in one line
      var dup = words.some(function (x) { return x[0] === w[0]; });
      if (dup && ALL.length > 4) continue;
      words.push(w);
      total += w[1];
    }
    return words.map(function (w) { return w[0]; }).join(' ');
  }

  function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var haiku = capitalize(makeLine(5)) + '\n' + capitalize(makeLine(7)) + '\n' + capitalize(makeLine(5));
    TN.el(SLUG + '-output').textContent = haiku;
  }

  try {
    TN.on(SLUG + '-run', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
