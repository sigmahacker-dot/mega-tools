/* REST API Quick Tester — fetch with timing, status, headers, body. CORS-limited, stated honestly. */
(function () {
  'use strict';
  var SLUG = 'rest-api-quick-tester';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function send() {
    clear();
    var url = el(SLUG + '-url').value.trim();
    var method = el(SLUG + '-method').value;
    if (!url) { fail('Enter a URL.'); return; }
    if (!/^https?:\/\//i.test(url)) { fail('URL must start with http:// or https://'); return; }
    var headers = {};
    el(SLUG + '-headers').value.split('\n').forEach(function (l) {
      var i = l.indexOf(':');
      if (i > 0) headers[l.slice(0, i).trim()] = l.slice(i + 1).trim();
    });
    var body = el(SLUG + '-body').value;
    var opts = { method: method, headers: headers };
    if (body && method !== 'GET' && method !== 'HEAD') opts.body = body;
    var btn = el(SLUG + '-send');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    TN.hide(SLUG + '-result');
    var t0 = performance.now();
    fetch(url, opts).then(function (res) {
      var ms = Math.round(performance.now() - t0);
      var hdrs = [];
      res.headers.forEach(function (v, k) { hdrs.push(k + ': ' + v); });
      return res.text().then(function (text) {
        el(SLUG + '-status').textContent = res.status + ' ' + res.statusText;
        el(SLUG + '-status').style.color = res.ok ? '#4ade80' : '#f87171';
        el(SLUG + '-time').textContent = ms + ' ms';
        el(SLUG + '-size').textContent = TN.fmtBytes(new Blob([text]).size);
        el(SLUG + '-respheaders').value = hdrs.join('\n') || '(no headers exposed)';
        var pretty = text;
        try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch (e) { /* keep raw */ }
        el(SLUG + '-respbody').value = pretty.slice(0, 50000);
        TN.show(SLUG + '-result');
      });
    }).catch(function (err) {
      fail('Request failed: ' + (err && err.message ? err.message : err) +
        ' — this usually means the endpoint blocks CORS or is unreachable from your browser.');
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Send request';
    });
  }

  try {
    if (!el(SLUG + '-send')) return;
    TN.on(SLUG + '-send', 'click', send);
    TN.on(SLUG + '-clear', 'click', function () { TN.hide(SLUG + '-result'); clear(); });
  } catch (e) { /* never throw on load */ }
})();
