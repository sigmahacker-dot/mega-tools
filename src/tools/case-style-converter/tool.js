/* Case Style Converter — split on spaces/_/-/case boundaries, emit 6 styles. */
(function () {
  'use strict';

  var SLUG = 'case-style-converter';

  function errId() { return SLUG + '-error'; }

  function splitWords(text) {
    return text
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase boundary
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // ACRONYMWord boundary
      .replace(/[_\-\s]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(function (w) { return w.length; });
  }

  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }

  function styles(words) {
    var lower = words.map(function (w) { return w.toLowerCase(); });
    return [
      { name: 'camelCase', value: lower.map(function (w, i) { return i === 0 ? w : cap(w); }).join('') },
      { name: 'PascalCase', value: lower.map(cap).join('') },
      { name: 'snake_case', value: lower.join('_') },
      { name: 'kebab-case', value: lower.join('-') },
      { name: 'CONSTANT_CASE', value: lower.join('_').toUpperCase() },
      { name: 'Title Case', value: lower.map(cap).join(' ') }
    ];
  }

  function update() {
    TN.clearErr(errId());
    var inEl = TN.el(SLUG + '-input');
    var text = inEl ? inEl.value : '';
    var tb = TN.el(SLUG + '-tbody');
    if (!tb) return;
    var words = splitWords(text);
    if (!words.length) {
      tb.innerHTML = '<tr><td colspan="3" class="muted">Type something above to see all styles.</td></tr>';
      return;
    }
    var rows = styles(words);
    var html = '';
    rows.forEach(function (r, i) {
      html += '<tr><th scope="row">' + TN.esc(r.name) + '</th>'
        + '<td><code id="' + SLUG + '-out-' + i + '" style="word-break:break-all;">' + TN.esc(r.value) + '</code></td>'
        + '<td><button type="button" class="btn btn-sm btn-outline" data-i="' + i + '">Copy</button></td></tr>';
    });
    tb.innerHTML = html;
    var btns = tb.querySelectorAll('button[data-i]');
    Array.prototype.forEach.call(btns, function (btn) {
      TN.on(btn, 'click', function () {
        var i = parseInt(btn.getAttribute('data-i'), 10);
        var val = rows[i] ? rows[i].value : '';
        if (!val) return;
        TN.clearErr(errId());
        TN.copy(val).then(function (ok) {
          if (ok) { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy'; }, 1200); }
          else TN.setErr(errId(), 'Copy failed — select the text manually and press Ctrl+C.');
        });
      });
    });
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var deb = TN.debounce(update, 120);
      var inEl = TN.el(SLUG + '-input');
      if (inEl) { TN.on(inEl, 'input', deb); }
      update();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();