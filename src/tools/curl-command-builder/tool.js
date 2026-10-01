/* cURL Command Builder — method/URL/headers/body → safely quoted curl command. */
(function () {
  'use strict';
  var SLUG = 'curl-command-builder';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function shQuote(s) {
    if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(s)) return s;
    return "'" + s.replace(/'/g, "'\\''") + "'";
  }

  function addRow(n, v) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:8px;margin-bottom:8px';
    var ni = document.createElement('input');
    ni.className = 'input'; ni.placeholder = 'Header name'; ni.value = n || '';
    ni.setAttribute('aria-label', 'Header name');
    var vi = document.createElement('input');
    vi.className = 'input'; vi.placeholder = 'Header value'; vi.value = v || '';
    vi.style.flex = '2';
    vi.setAttribute('aria-label', 'Header value');
    var rm = document.createElement('button');
    rm.className = 'btn btn-outline'; rm.textContent = '✕';
    rm.setAttribute('aria-label', 'Remove header');
    rm.addEventListener('click', function () { wrap.remove(); });
    wrap.appendChild(ni); wrap.appendChild(vi); wrap.appendChild(rm);
    el(SLUG + '-headers').appendChild(wrap);
  }

  function build() {
    clear();
    var url = el(SLUG + '-url').value.trim();
    if (!url) { fail('Enter a URL.'); return; }
    var method = el(SLUG + '-method').value;
    var parts = ['curl'];
    if (method !== 'GET') parts.push('-X', method);
    if (el(SLUG + '-follow').checked) parts.push('-L');
    if (el(SLUG + '-include').checked) parts.push('-i');
    if (el(SLUG + '-insecure').checked) parts.push('-k');
    var rows = el(SLUG + '-headers').children;
    for (var i = 0; i < rows.length; i++) {
      var ins = rows[i].querySelectorAll('input');
      var n = ins[0].value.trim(), v = ins[1].value;
      if (!n) continue;
      parts.push('-H', shQuote(n + ': ' + v));
    }
    var body = el(SLUG + '-body').value;
    if (body) parts.push('--data', shQuote(body));
    parts.push(shQuote(url));
    el(SLUG + '-output').textContent = parts.join(' ');
  }

  try {
    TN.on(SLUG + '-add', 'click', function () { addRow('', ''); });
    TN.on(SLUG + '-build', 'click', build);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').textContent;
      if (!v) { fail('Build a command first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    addRow('Content-Type', 'application/json');
    addRow('Authorization', 'Bearer TOKEN');
  } catch (e) { /* never throw on load */ }
})();
