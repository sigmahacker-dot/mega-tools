/* systemd Service Generator — options → systemd unit file. */
(function () {
  'use strict';
  var SLUG = 'systemd-service-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function generate() {
    clear();
    var desc = el(SLUG + '-desc').value.trim() || 'Application service';
    var exec = el(SLUG + '-exec').value.trim();
    if (!exec) { fail('Enter the ExecStart command.'); return; }
    var user = el(SLUG + '-user').value.trim();
    var group = el(SLUG + '-group').value.trim();
    var workdir = el(SLUG + '-workdir').value.trim();
    var L = [];
    L.push('[Unit]');
    L.push('Description=' + desc);
    L.push('After=network.target');
    L.push('');
    L.push('[Service]');
    L.push('Type=simple');
    if (user) L.push('User=' + user);
    if (group) L.push('Group=' + group);
    if (workdir) L.push('WorkingDirectory=' + workdir);
    L.push('ExecStart=' + exec);
    L.push('Restart=' + el(SLUG + '-restart').value);
    var rs = el(SLUG + '-restartsec').value.trim();
    if (rs) L.push('RestartSec=' + rs);
    el(SLUG + '-env').value.split('\n').forEach(function (l) {
      l = l.trim();
      if (!l) return;
      var i = l.indexOf('=');
      if (i < 0) { L.push('Environment="' + l + '"'); return; }
      var k = l.slice(0, i).trim(), v = l.slice(i + 1).trim();
      L.push('Environment="' + k + '=' + v.replace(/"/g, '\\"') + '"');
    });
    L.push('');
    L.push('[Install]');
    L.push('WantedBy=' + (el(SLUG + '-wantedby').value.trim() || 'multi-user.target'));
    el(SLUG + '-output').value = L.join('\n') + '\n';
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the unit file first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the unit file first.'); return; }
      TN.downloadText(v, 'myapp.service', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
