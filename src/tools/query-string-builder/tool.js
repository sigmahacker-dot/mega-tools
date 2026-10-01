/* Query String Builder — key/value rows → percent-encoded query string. */
(function () {
  'use strict';
  var SLUG = 'query-string-builder';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function addRow(k, v) {
    var wrap = document.createElement('div');
    wrap.className = 'grid2';
    wrap.style.cssText = 'grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center';
    var ki = document.createElement('input');
    ki.className = 'input'; ki.placeholder = 'key'; ki.value = k || '';
    ki.setAttribute('aria-label', 'Parameter key');
    var vi = document.createElement('input');
    vi.className = 'input'; vi.placeholder = 'value'; vi.value = v || '';
    vi.setAttribute('aria-label', 'Parameter value');
    var rm = document.createElement('button');
    rm.className = 'btn btn-outline'; rm.textContent = '✕';
    rm.setAttribute('aria-label', 'Remove row');
    rm.addEventListener('click', function () { wrap.remove(); });
    wrap.appendChild(ki); wrap.appendChild(vi); wrap.appendChild(rm);
    el(SLUG + '-rows').appendChild(wrap);
  }

  function build() {
    clear();
    var rows = el(SLUG + '-rows').children;
    var parts = [];
    for (var i = 0; i < rows.length; i++) {
      var ins = rows[i].querySelectorAll('input');
      var k = ins[0].value, v = ins[1].value;
      if (k === '') continue; // skip empty keys
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
    if (!parts.length) { fail('Add at least one parameter with a key.'); return; }
    var qs = '?' + parts.join('&');
    var base = el(SLUG + '-base').value.trim().replace(/[?&#]+$/, '');
    var out = base ? base + qs : qs;
    el(SLUG + '-output').textContent = out;
    TN.show(SLUG + '-result');
  }

  try {
    TN.on(SLUG + '-add', 'click', function () { addRow('', ''); });
    TN.on(SLUG + '-build', 'click', build);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').textContent;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    addRow('q', 'wireless headphones');
    addRow('page', '2');
    addRow('sort', 'price-asc');
  } catch (e) { /* never throw on load */ }
})();
