/* Text Reverser — characters / words / lines / each-line, Unicode-safe. */
(function () {
  'use strict';

  var SLUG = 'text-reverser';

  function errId() { return SLUG + '-error'; }

  function revStr(s) { return Array.from(s).reverse().join(''); }

  function run() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-input');
    var text = ta ? ta.value : '';
    if (!text) {
      TN.setErr(errId(), 'Please enter some text to reverse.');
      return;
    }
    var modeEl = TN.el(SLUG + '-mode');
    var mode = modeEl ? modeEl.value : 'chars';
    var out;
    if (mode === 'chars') {
      out = revStr(text);
    } else if (mode === 'words') {
      // Reverse word order, keep whitespace separators in place.
      var parts = text.split(/(\s+)/);
      var words = parts.filter(function (t) { return /\S/.test(t); }).reverse();
      var wi = 0;
      out = parts.map(function (t) { return /\S/.test(t) ? words[wi++] : t; }).join('');
    } else if (mode === 'lines') {
      out = text.split(/\r\n|\r|\n/).reverse().join('\n');
    } else { // eachline
      out = text.split(/\r\n|\r|\n/).map(revStr).join('\n');
    }
    var outEl = TN.el(SLUG + '-output');
    if (outEl) outEl.value = out;
  }

  function copy() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Nothing to copy yet — reverse first.'); return; }
    TN.clearErr(errId());
    TN.copy(out.value).then(function (ok) {
      if (!ok) TN.setErr(errId(), 'Copy failed — select the text manually and press Ctrl+C.');
    });
  }

  function download() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Nothing to download yet — reverse first.'); return; }
    TN.clearErr(errId());
    TN.downloadText(out.value, 'reversed.txt');
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