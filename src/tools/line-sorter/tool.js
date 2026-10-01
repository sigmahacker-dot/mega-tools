/* Line Sorter — A-Z, Z-A, numeric, by length, reverse, Fisher-Yates shuffle. */
(function () {
  'use strict';

  var SLUG = 'line-sorter';

  function errId() { return SLUG + '-error'; }

  function firstNumber(line) {
    var m = line.match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function run() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-input');
    var text = ta ? ta.value : '';
    if (!text || !text.trim()) {
      TN.setErr(errId(), 'Please paste some lines first.');
      return;
    }
    var modeEl = TN.el(SLUG + '-mode');
    var mode = modeEl ? modeEl.value : 'az';
    var lines = text.split(/\r\n|\r|\n/);
    var out = lines.slice();

    if (mode === 'az') {
      out.sort(function (a, b) { var x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; });
    } else if (mode === 'za') {
      out.sort(function (a, b) { var x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? 1 : x > y ? -1 : 0; });
    } else if (mode === 'numeric') {
      out.sort(function (a, b) {
        var na = firstNumber(a), nb = firstNumber(b);
        if (na === null && nb === null) return 0;
        if (na === null) return -1;
        if (nb === null) return 1;
        return na - nb;
      });
    } else if (mode === 'length') {
      out.sort(function (a, b) { return a.length - b.length; });
    } else if (mode === 'reverse') {
      out.reverse();
    } else if (mode === 'shuffle') {
      shuffle(out);
    }

    var outEl = TN.el(SLUG + '-output');
    if (outEl) outEl.value = out.join('\n');
  }

  function copy() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Nothing to copy yet — sort first.'); return; }
    TN.clearErr(errId());
    TN.copy(out.value).then(function (ok) {
      if (!ok) TN.setErr(errId(), 'Copy failed — select the text manually and press Ctrl+C.');
    });
  }

  function download() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Nothing to download yet — sort first.'); return; }
    TN.clearErr(errId());
    TN.downloadText(out.value, 'sorted-lines.txt');
  }

  function clear() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-input'), out = TN.el(SLUG + '-output');
    if (ta) ta.value = '';
    if (out) out.value = '';
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var r = TN.el(SLUG + '-run');
      if (r) TN.on(r, 'click', run);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
      var cp = TN.el(SLUG + '-copy');
      if (cp) TN.on(cp, 'click', copy);
      var d = TN.el(SLUG + '-download');
      if (d) TN.on(d, 'click', download);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();