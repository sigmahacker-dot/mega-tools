(function () {
  'use strict';
  var P = 'acronym-generator-', ERR = P + 'error';
  var SMALL = { a:1, an:1, the:1, of:1, and:1, or:1, nor:1, in:1, on:1, at:1, to:1, for:1, with:1, by:1, from:1, as:1, is:1, are:1, de:1, la:1, el:1 };
  function g(id) { return TN.el(P + id); }
  function makeAcronym(phrase, upper, periods, skip) {
    var words = phrase.split(/[\s\-–—_\/]+/).filter(function (w) { return /[A-Za-z0-9]/.test(w); });
    if (skip) words = words.filter(function (w) { return !SMALL[w.toLowerCase()]; });
    if (!words.length) return '';
    var letters = words.map(function (w) {
      var m = w.match(/[A-Za-z0-9]/);
      return m ? m[0] : '';
    }).join('');
    if (upper) letters = letters.toUpperCase();
    return periods ? letters.split('').join('.') + '.' : letters;
  }
  function render() {
    try {
      TN.clearErr(ERR);
      var upper = g('upper').checked, periods = g('periods').checked, skip = g('skip').checked;
      var lines = g('input').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      var body = g('body');
      if (!lines.length) {
        body.innerHTML = '<tr><td colspan="3" class="muted">Type a phrase above to generate its acronym.</td></tr>';
        return;
      }
      var rows = lines.slice(0, 200).map(function (line, i) {
        var ac = makeAcronym(line, upper, periods, skip);
        return '<tr><td>' + TN.esc(line) + '</td><td><b>' + TN.esc(ac || '–') + '</b></td>' +
          '<td><button type="button" class="btn btn-outline btn-sm" data-ac="' + i + '"' + (ac ? '' : ' disabled') + '>Copy</button></td></tr>';
      });
      body.innerHTML = rows.join('');
      var btns = body.querySelectorAll('button[data-ac]');
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          TN.on(b, 'click', function () {
            var line = lines[parseInt(b.getAttribute('data-ac'), 10)];
            var ac = makeAcronym(line, upper, periods, skip);
            TN.copy(ac);
            b.textContent = 'Copied';
            setTimeout(function () { b.textContent = 'Copy'; }, 1200);
          });
        })(btns[i]);
      }
    } catch (e) { TN.setErr(ERR, 'Could not generate acronyms. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(render, 120));
    ['upper', 'periods', 'skip'].forEach(function (k) { TN.on(P + k, 'change', render); });
    render();
  } catch (e) { /* never throw on load */ }
})();
