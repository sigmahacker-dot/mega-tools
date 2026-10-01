/* Leetspeak Converter — three intensity levels of letter-to-symbol substitution. */
(function () {
  'use strict';
  var SLUG = 'leetspeak-converter';
  var BASIC = { A: '4', E: '3', I: '1', O: '0', S: '5', T: '7' };
  var MEDIUM = { A: '4', B: '8', E: '3', G: '6', I: '1', L: '1', O: '0', S: '5', T: '7', Z: '2' };
  var FULL = {
    A: '4', B: '8', C: '(', D: '|)', E: '3', F: 'ph', G: '6', H: '#',
    I: '1', J: '_|', K: '|<', L: '1', M: '|\\/|', N: '|\\|', O: '0',
    P: '|*', Q: '0,', R: '|2', S: '5', T: '7', U: '|_|', V: '\\/',
    W: '\\/\\/', X: '><', Y: '`/', Z: '2'
  };

  function convert(text, level) {
    var map = level === 'basic' ? BASIC : (level === 'medium' ? MEDIUM : FULL);
    return text.split('').map(function (ch) {
      var up = ch.toUpperCase();
      if (map[up]) return map[up];
      return ch;
    }).join('');
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    var level = TN.el(SLUG + '-level').value;
    TN.el(SLUG + '-output').textContent = convert(input, level);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
