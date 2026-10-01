/* Dockerfile Generator — base image, workdir, copy, env, run, expose, cmd → Dockerfile. */
(function () {
  'use strict';
  var SLUG = 'dockerfile-generator';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function toCmdArray(cmd) {
    // split on whitespace/commas, respecting single/double quotes
    var parts = [], cur = '', q = null;
    for (var i = 0; i < cmd.length; i++) {
      var c = cmd[i];
      if (q) {
        if (c === q) q = null;
        else cur += c;
      } else if (c === '"' || c === "'") {
        q = c;
      } else if (/\s/.test(c) || c === ',') {
        if (cur) { parts.push(cur); cur = ''; }
      } else {
        cur += c;
      }
    }
    if (cur) parts.push(cur);
    return parts;
  }

  function generate() {
    clear();
    var base = el(SLUG + '-base').value.trim();
    if (!base) { fail('Enter a base image.'); return; }
    var lines = ['FROM ' + base];
    var workdir = el(SLUG + '-workdir').value.trim();
    if (workdir) lines.push('WORKDIR ' + workdir);
    el(SLUG + '-env').value.split('\n').forEach(function (l) {
      l = l.trim();
      if (!l) return;
      var eq = l.indexOf('=');
      if (eq < 0) { lines.push('ENV ' + l); }
      else lines.push('ENV ' + l.slice(0, eq).trim() + '=' + l.slice(eq + 1).trim());
    });
    var copy = el(SLUG + '-copy').value.trim();
    if (copy) lines.push('COPY ' + copy);
    el(SLUG + '-run').value.split('\n').forEach(function (l) {
      l = l.trim();
      if (l) lines.push('RUN ' + l);
    });
    var expose = el(SLUG + '-expose').value.split(',').map(function (p) { return p.trim(); }).filter(Boolean);
    if (expose.length) lines.push('EXPOSE ' + expose.join(' '));
    var cmd = el(SLUG + '-cmd').value.trim();
    if (cmd) lines.push('CMD ' + JSON.stringify(toCmdArray(cmd)));
    el(SLUG + '-output').value = lines.join('\n') + '\n';
  }

  try {
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a Dockerfile first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a Dockerfile first.'); return; }
      TN.downloadText(v, 'Dockerfile', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
