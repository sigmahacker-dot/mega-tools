/* SSH Config Generator — host entries → ~/.ssh/config text. */
(function () {
  'use strict';
  var SLUG = 'ssh-config-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function update() {
    clear();
    var lines = [];
    if (el(SLUG + '-keepalive').checked) {
      lines.push('Host *', '    ServerAliveInterval 60', '    ServerAliveCountMax 3', '');
    }
    var count = 0;
    el(SLUG + '-hosts').value.split('\n').forEach(function (raw) {
      var l = raw.trim();
      if (!l) return;
      var p = l.split('|').map(function (x) { return x.trim(); });
      var alias = p[0], host = p[1] || p[0], user = p[2], port = p[3], idf = p[4];
      if (!alias) { fail('Each host needs an alias.'); return; }
      lines.push('Host ' + alias);
      lines.push('    HostName ' + host);
      if (user) lines.push('    User ' + user);
      if (port) lines.push('    Port ' + port);
      if (idf) lines.push('    IdentityFile ' + idf);
      if (el(SLUG + '-compression').checked) lines.push('    Compression yes');
      lines.push('');
      count++;
    });
    if (!count) { fail('Add at least one host.'); el(SLUG + '-output').value = ''; return; }
    el(SLUG + '-output').value = lines.join('\n');
  }

  try {
    if (!el(SLUG + '-hosts')) return;
    TN.on(SLUG + '-hosts', 'input', TN.debounce(update, 300));
    TN.on(SLUG + '-keepalive', 'change', update);
    TN.on(SLUG + '-compression', 'change', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'config', 'text/plain');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
