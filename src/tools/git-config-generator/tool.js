/* Git Config Generator — identity/aliases/core settings → .gitconfig. */
(function () {
  'use strict';
  var SLUG = 'git-config-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function update() {
    clear();
    var name = el(SLUG + '-name').value.trim();
    var email = el(SLUG + '-email').value.trim();
    if (!name) { fail('Enter your name.'); return; }
    if (!email || email.indexOf('@') < 0) { fail('Enter a valid email.'); return; }
    var L = [];
    L.push('[user]', '\tname = ' + name, '\temail = ' + email, '');
    L.push('[init]', '\tdefaultBranch = ' + (el(SLUG + '-branch').value.trim() || 'main'), '');
    var editor = el(SLUG + '-editor').value.trim();
    L.push('[core]');
    if (editor) L.push('\teditor = ' + editor);
    L.push('\tautocrlf = ' + el(SLUG + '-autocrlf').value, '');
    if (el(SLUG + '-rebase').checked) L.push('[pull]', '\trebase = true', '');
    if (el(SLUG + '-color').checked) L.push('[color]', '\tui = auto', '');
    var aliases = [];
    el(SLUG + '-aliases').value.split('\n').forEach(function (l) {
      l = l.trim();
      if (!l) return;
      var i = l.indexOf('=');
      if (i > 0) aliases.push('\t' + l.slice(0, i).trim() + ' = ' + l.slice(i + 1).trim());
    });
    if (aliases.length) L.push('[alias]', aliases.join('\n'), '');
    el(SLUG + '-output').value = L.join('\n');
  }

  try {
    if (!el(SLUG + '-name')) return;
    ['name', 'email', 'branch', 'editor', 'aliases'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['autocrlf', 'rebase', 'color'].forEach(function (k) {
      TN.on(SLUG + '-' + k, (k === 'autocrlf') ? 'change' : 'change', update);
    });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, '.gitconfig', 'text/plain');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
