/* Duplicate Line Remover — unique lines, optional trim / case-insensitive / sort. */
(function () {
  'use strict';

  var SLUG = 'duplicate-line-remover';

  function errId() { return SLUG + '-error'; }
  function set(id, v) { var e = TN.el(id); if (e) e.textContent = v; }

  function run() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-input');
    var text = ta ? ta.value : '';
    if (!text || !text.trim()) {
      TN.setErr(errId(), 'Please paste some lines first.');
      return;
    }
    var noCase = TN.el(SLUG + '-nocase') ? !!TN.el(SLUG + '-nocase').checked : false;
    var trim = TN.el(SLUG + '-trim') ? !!TN.el(SLUG + '-trim').checked : true;
    var sort = TN.el(SLUG + '-sort') ? !!TN.el(SLUG + '-sort').checked : false;

    var lines = text.split(/\r\n|\r|\n/);
    var seen = {};
    var unique = [];
    for (var i = 0; i < lines.length; i++) {
      var line = trim ? lines[i].trim() : lines[i];
      var key = noCase ? line.toLowerCase() : line;
      if (!Object.prototype.hasOwnProperty.call(seen, key)) {
        seen[key] = true;
        unique.push(line);
      }
    }
    if (sort) {
      unique.sort(function (a, b) {
        var x = noCase ? a.toLowerCase() : a, y = noCase ? b.toLowerCase() : b;
        return x < y ? -1 : x > y ? 1 : 0;
      });
    }
    var removed = lines.length - unique.length;
    var out = TN.el(SLUG + '-output');
    if (out) out.value = unique.join('\n');
    set(SLUG + '-in', lines.length.toLocaleString('en-US'));
    set(SLUG + '-out', unique.length.toLocaleString('en-US'));
    set(SLUG + '-removed', removed.toLocaleString('en-US'));
  }

  function copy() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Nothing to copy yet — run the remover first.'); return; }
    TN.clearErr(errId());
    TN.copy(out.value).then(function (ok) {
      if (!ok) TN.setErr(errId(), 'Copy failed — select the text manually and press Ctrl+C.');
    });
  }

  function download() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Nothing to download yet — run the remover first.'); return; }
    TN.clearErr(errId());
    TN.downloadText(out.value, 'unique-lines.txt');
  }

  function clear() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-input'), out = TN.el(SLUG + '-output');
    if (ta) ta.value = '';
    if (out) out.value = '';
    ['in', 'out', 'removed'].forEach(function (k) { set(SLUG + '-' + k, '–'); });
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