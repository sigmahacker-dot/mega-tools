(function () {
  'use strict';
  var P = 'jwt-decoder-';
  var ERR = P + 'error';
  var SAMPLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlbW8ta2V5LTEifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function b64url(seg) {
    var s = String(seg).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4 !== 0) s += '=';
    var bin;
    try { bin = atob(s); } catch (e) { throw new Error('A part is not valid base64url.'); }
    var bytes = new Uint8Array(bin.length), i;
    for (i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch (e) { throw new Error('A part is not valid UTF-8 JSON.'); }
  }
  function fmtDate(sec) {
    var d = new Date(Number(sec) * 1000);
    return isNaN(d.getTime()) ? 'invalid date' : d.toUTCString();
  }
  function decode() {
    var tokEl = g('token');
    if (!tokEl) return;
    TN.clearErr(ERR);
    TN.hide(P + 'result');
    var token = tokEl.value.trim();
    if (!token) return;
    var parts = token.split('.');
    if (parts.length !== 3) { TN.setErr(ERR, 'A JWT has exactly 3 dot-separated parts (header.payload.signature) — found ' + parts.length + '.'); return; }
    var header, payload;
    try {
      header = JSON.parse(b64url(parts[0]));
      payload = JSON.parse(b64url(parts[1]));
    } catch (e) { TN.setErr(ERR, 'Could not decode the token: ' + (e && e.message ? e.message : e)); return; }
    if (!header || typeof header !== 'object' || !payload || typeof payload !== 'object') {
      TN.setErr(ERR, 'Header and payload must be JSON objects.'); return;
    }
    set('header', JSON.stringify(header, null, 2));
    set('payload', JSON.stringify(payload, null, 2));
    set('alg', header.alg ? String(header.alg) : 'none');
    var claims = '';
    function row(k, v) { claims += '<tr><th scope="row">' + TN.esc(k) + '</th><td>' + TN.esc(v) + '</td></tr>'; }
    if (header.kid !== undefined) row('Key ID (kid)', String(header.kid));
    if (payload.iss !== undefined) row('Issuer (iss)', String(payload.iss));
    if (payload.sub !== undefined) row('Subject (sub)', String(payload.sub));
    if (payload.aud !== undefined) row('Audience (aud)', String(payload.aud));
    if (payload.iat !== undefined) row('Issued at (iat)', fmtDate(payload.iat));
    if (payload.nbf !== undefined) row('Not before (nbf)', fmtDate(payload.nbf));
    if (payload.exp !== undefined) {
      row('Expires (exp)', fmtDate(payload.exp));
      set('verdict', Number(payload.exp) * 1000 < Date.now() ? 'Expired' : 'Valid');
    } else set('verdict', 'No exp');
    var cEl = g('claims');
    if (cEl) cEl.innerHTML = claims || '<tr><td class="muted">No standard claims found.</td></tr>';
    var sig = parts[2];
    set('signote', 'Signature part (' + sig.length + ' chars' + (sig.length > 24 ? ', shown truncated' : '') + '): ' + (sig.length > 24 ? sig.slice(0, 24) + '…' : sig) + ' — not verified.');
    TN.show(P + 'result');
  }
  try {
    TN.on(P + 'token', 'input', decode);
    TN.on(P + 'sample', 'click', function () { var el = g('token'); if (el) { el.value = SAMPLE; decode(); } });
    TN.on(P + 'clear', 'click', function () {
      var el = g('token'); if (el) el.value = '';
      TN.clearErr(ERR); TN.hide(P + 'result');
    });
  } catch (e) { /* never throw on load */ }
})();
