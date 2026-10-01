/* OAuth URL Builder — provider presets → authorization URL with proper encoding. */
(function () {
  'use strict';
  var SLUG = 'oauth-url-builder';
  var PROVIDERS = {
    google: { endpoint: 'https://accounts.google.com/o/oauth2/v2/auth', scope: 'openid email profile',
      note: 'Google: use response_type=code and exchange the code at https://oauth2.googleapis.com/token.' },
    github: { endpoint: 'https://github.com/login/oauth/authorize', scope: 'read:user user:email',
      note: 'GitHub: response_type is not used — select "none" to omit it. Exchange the code at https://github.com/login/oauth/access_token.' },
    microsoft: { endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', scope: 'openid profile email',
      note: 'Microsoft: replace "common" with your tenant ID for single-tenant apps.' },
    discord: { endpoint: 'https://discord.com/api/oauth2/authorize', scope: 'identify email',
      note: 'Discord: exchange the code at https://discord.com/api/oauth2/token.' },
    custom: { endpoint: '', scope: '', note: 'Custom: paste your provider\u2019s authorization endpoint above.' }
  };
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function applyProvider() {
    var p = PROVIDERS[el(SLUG + '-provider').value];
    var isCustom = el(SLUG + '-provider').value === 'custom';
    TN.show(SLUG + '-customwrap');
    if (!isCustom) TN.hide(SLUG + '-customwrap');
    el(SLUG + '-endpoint').value = isCustom ? (el(SLUG + '-custom').value.trim() || '(enter custom endpoint)') : p.endpoint;
    if (!el(SLUG + '-scope').dataset.touched) el(SLUG + '-scope').value = p.scope;
    if (el(SLUG + '-provider').value === 'github') el(SLUG + '-response').value = 'none';
    el(SLUG + '-note').textContent = p.note;
  }

  function build() {
    clear();
    var pkey = el(SLUG + '-provider').value;
    var endpoint = pkey === 'custom' ? el(SLUG + '-custom').value.trim() : PROVIDERS[pkey].endpoint;
    var client = el(SLUG + '-client').value.trim();
    var redirect = el(SLUG + '-redirect').value.trim();
    if (!endpoint || endpoint.charAt(0) !== 'h') { fail('Enter a valid authorization endpoint.'); return; }
    if (!client) { fail('Enter your client ID.'); return; }
    if (!redirect) { fail('Enter the redirect URI.'); return; }
    var params = [['client_id', client]];
    var rt = el(SLUG + '-response').value;
    if (rt !== 'none') params.push(['response_type', rt]);
    params.push(['redirect_uri', redirect]);
    var scope = el(SLUG + '-scope').value.trim();
    if (scope) params.push(['scope', scope]);
    var state = el(SLUG + '-state').value.trim();
    if (state) params.push(['state', state]);
    el(SLUG + '-extra').value.split('\n').forEach(function (l) {
      l = l.trim();
      if (!l) return;
      var i = l.indexOf('=');
      if (i > 0) params.push([l.slice(0, i).trim(), l.slice(i + 1).trim()]);
    });
    var qs = params.map(function (kv) {
      return encodeURIComponent(kv[0]) + '=' + encodeURIComponent(kv[1]);
    }).join('&');
    el(SLUG + '-output').value = endpoint + (endpoint.indexOf('?') >= 0 ? '&' : '?') + qs;
  }

  try {
    if (!el(SLUG + '-provider')) return;
    TN.on(SLUG + '-provider', 'change', function () { delete el(SLUG + '-scope').dataset.touched; applyProvider(); });
    TN.on(SLUG + '-custom', 'input', applyProvider);
    TN.on(SLUG + '-scope', 'input', function () { el(SLUG + '-scope').dataset.touched = '1'; });
    TN.on(SLUG + '-genstate', 'click', function () {
      var b = new Uint8Array(16);
      crypto.getRandomValues(b);
      var s = '';
      for (var i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2);
      el(SLUG + '-state').value = s;
    });
    TN.on(SLUG + '-build', 'click', build);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Build the URL first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Build the URL first.'); return; }
      TN.downloadText(v + '\n', 'oauth-url.txt', 'text/plain');
    });
    applyProvider();
  } catch (e) { /* never throw on load */ }
})();
