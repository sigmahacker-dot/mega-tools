/* NATO Phonetic Converter — text to phonetic words and back. */
(function () {
  'use strict';
  var SLUG = 'nato-phonetic-converter';
  var NATO = {
    A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot',
    G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima',
    M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo',
    S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey',
    X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
    '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Tree', '4': 'Fower',
    '5': 'Fife', '6': 'Six', '7': 'Seven', '8': 'Ait', '9': 'Niner'
  };
  var REVERSE = {};
  for (var k in NATO) { if (NATO.hasOwnProperty(k)) REVERSE[NATO[k].toLowerCase()] = k; }

  function encode(text) {
    return text.split('\n').map(function (line) {
      return line.split('').map(function (ch) {
        var up = ch.toUpperCase();
        if (NATO[up]) return NATO[up];
        return ch;
      }).join(' ');
    }).join('\n');
  }

  function decode(text) {
    return text.split('\n').map(function (line) {
      return line.split(/\s+/).filter(function (w) { return w.length; }).map(function (w) {
        var hit = REVERSE[w.toLowerCase()];
        return hit !== undefined ? hit : '[' + w + ']';
      }).join('');
    }).join('\n');
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var mode = TN.el(SLUG + '-mode').value;
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    TN.el(SLUG + '-output').textContent = (mode === 'encode') ? encode(input) : decode(input);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
