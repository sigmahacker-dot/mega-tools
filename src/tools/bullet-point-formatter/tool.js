/* Bullet Point Formatter — lines to a bulleted list with style choice. */
(function () {
  'use strict';
  var SLUG = 'bullet-point-formatter';

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some items first.'); return; }
    var bullet = TN.el(SLUG + '-style').value;
    var lines = input.split('\n')
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 0; });
    if (!lines.length) { TN.setErr(SLUG + '-error', 'No non-empty lines found.'); return; }
    TN.el(SLUG + '-output').textContent = lines.map(function (l) {
      return bullet + ' ' + l;
    }).join('\n');
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
