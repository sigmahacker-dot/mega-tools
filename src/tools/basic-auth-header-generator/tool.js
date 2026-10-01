/* Basic Auth Header Generator — username:password → Base64 Authorization header (Unicode-safe). */
(function () {
  'use strict';
  var SLUG = 'basic-auth-header-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function b64encodeUnicode(s) {
    var bytes = new TextEncoder().encode(s);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function update() {
    clear();
    var u = el(SLUG + '-user').value;
    var p = el(SLUG + '-pass').value;
    if (!u && !p) {
      el(SLUG + '-output').value = '';
      el(SLUG + '-value').value = '';
      return;
    }
    var encoded = b64encodeUnicode(u + ':' + p);
    el(SLUG + '-value').value = encoded;
    el(SLUG + '-output').value = 'Authorization: Basic ' + encoded;
  }

  try {
    if (!el(SLUG + '-user')) return;
    TN.on(SLUG + '-user', 'input', update);
    TN.on(SLUG + '-pass', 'input', update);
    function copyOf(id, emptyMsg) {
      var v = el(id).value;
      if (!v) { fail(emptyMsg); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    }
    TN.on(SLUG + '-copy', 'click', function () { copyOf(SLUG + '-output', 'Enter credentials first.'); });
    TN.on(SLUG + '-copyval', 'click', function () { copyOf(SLUG + '-value', 'Enter credentials first.'); });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Enter credentials first.'); return; }
      TN.downloadText(v + '\n', 'basic-auth.txt', 'text/plain');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
