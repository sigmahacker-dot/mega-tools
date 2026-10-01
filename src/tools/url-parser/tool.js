(function () {
  'use strict';
  var P = 'url-parser-';
  var ERR = P + 'error';
  var SAMPLE = 'https://user:s3cret@example.com:8080/shop/search?q=red%20shoes&sort=price#results';
  function g(id) { return document.getElementById(P + id); }
  function parse() {
    var inEl = g('in'), tb = g('parts');
    if (!inEl || !tb) return;
    TN.clearErr(ERR);
    tb.innerHTML = '';
    var val = inEl.value.trim();
    if (!val) return;
    var u;
    try { u = new URL(val); }
    catch (e) { TN.setErr(ERR, 'Not a valid absolute URL. Include the scheme, e.g. https://example.com/path'); return; }
    function row(k, v) { return '<tr><th scope="row">' + TN.esc(k) + '</th><td>' + TN.esc(v) + '</td></tr>'; }
    var html = '';
    html += row('Protocol', u.protocol);
    html += row('Username', u.username || '—');
    html += row('Password', u.password ? '•••••••• (present, masked)' : '—');
    html += row('Hostname', u.hostname);
    html += row('Port', u.port || '— (default)');
    html += row('Host', u.host);
    html += row('Pathname', u.pathname);
    html += row('Query string', u.search || '—');
    html += row('Hash', u.hash || '—');
    html += row('Origin', u.origin === 'null' ? '—' : u.origin);
    var params = [];
    u.searchParams.forEach(function (v, k) { params.push(k + ' = ' + v); });
    html += row('Query parameters', params.length ? params.join('\n') : '—');
    tb.innerHTML = html;
  }
  try {
    TN.on(P + 'in', 'input', parse);
    TN.on(P + 'sample', 'click', function () { var el = g('in'); if (el) { el.value = SAMPLE; parse(); } });
  } catch (e) { /* never throw on load */ }
})();
