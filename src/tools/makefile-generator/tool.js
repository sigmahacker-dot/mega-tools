/* Makefile Generator — variables/targets/commands → Makefile with real tabs. */
(function () {
  'use strict';
  var SLUG = 'makefile-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function generate() {
    clear();
    var L = [];
    el(SLUG + '-vars').value.split('\n').forEach(function (l) {
      l = l.trim();
      if (!l || l.charAt(0) === '#') return;
      var i = l.indexOf('=');
      if (i < 0) { fail('Variable lines must be NAME=value: ' + l); return; }
      L.push(l.slice(0, i).trim() + ' = ' + l.slice(i + 1).trim());
    });
    if (L.length) L.push('');
    var targets = [];
    var current = null;
    var lines = el(SLUG + '-targets').value.split('\n');
    for (var n = 0; n < lines.length; n++) {
      var raw = lines[n];
      var l = raw.trim();
      if (!l) continue;
      if (/^[\s>]/.test(raw) || raw.charAt(0) === '>') {
        if (!current) { fail('Command without a target on line ' + (n + 1) + '.'); return; }
        var cmd = l.replace(/^>\s*/, '');
        if (cmd) current.cmds.push(cmd);
      } else if (/^[A-Za-z0-9_.\-%][^:]*:/.test(l)) {
        current = { head: l, cmds: [] };
        targets.push(current);
      } else {
        fail('Cannot parse line ' + (n + 1) + ': "' + l + '" — use "target: deps" or "> command".');
        return;
      }
    }
    if (!targets.length) { fail('Define at least one target.'); return; }
    var phony = [];
    targets.forEach(function (t) {
      L.push(t.head);
      t.cmds.forEach(function (c) { L.push('\t' + c); });
      L.push('');
      var tname = t.head.split(':')[0].trim();
      if (el(SLUG + '-phony').checked && t.cmds.length && !/\.(o|c|h|cpp|a|so)$/.test(tname)) phony.push(tname);
    });
    if (phony.length) L.unshift('.PHONY: ' + phony.join(' '), '');
    el(SLUG + '-output').value = L.join('\n');
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-phony', 'change', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the Makefile first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the Makefile first.'); return; }
      TN.downloadText(v, 'Makefile', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
