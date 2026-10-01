/* Git Commit Message Generator — Conventional Commits builder + validator. */
(function () {
  'use strict';
  var SLUG = 'git-commit-message-generator';
  var TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function generate() {
    clear();
    var type = el(SLUG + '-type').value;
    var scope = el(SLUG + '-scope').value.trim().replace(/\s+/g, '-').toLowerCase();
    var subject = el(SLUG + '-subject').value.trim();
    if (!subject) { fail('Enter a subject line.'); return; }
    var msg = type + (scope ? '(' + scope + ')' : '') + ': ' + subject;
    var body = el(SLUG + '-body').value.trim();
    if (body) msg += '\n\n' + body;
    if (el(SLUG + '-breaking').checked) {
      var bt = el(SLUG + '-breaking-text').value.trim() || 'breaking change';
      msg += '\n\nBREAKING CHANGE: ' + bt;
    }
    el(SLUG + '-output').value = msg;
  }

  function validate() {
    clear();
    var host = el(SLUG + '-verdict');
    host.innerHTML = '';
    var msg = el(SLUG + '-check').value;
    if (!msg.trim()) { fail('Paste a commit message to validate.'); return; }
    var first = msg.split('\n')[0];
    var checks = [];
    function check(ok, label) { checks.push({ ok: ok, label: label }); }

    var m = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(([^()]*)\))?(!)?: (.*)$/.exec(first);
    check(!!m, 'Matches type[(scope)][!]: subject pattern');
    if (m) {
      check(TYPES.indexOf(m[1]) >= 0, 'Type "' + m[1] + '" is a known Conventional Commits type');
      var subject = m[5];
      check(subject.length > 0, 'Subject is not empty');
      check(subject.length <= 72, 'Subject is ' + subject.length + ' chars (≤ 72 recommended)');
      check(!/^[A-Z]/.test(subject), 'Subject starts lowercase');
      check(!/\.$/.test(subject), 'Subject has no trailing period');
      check(!/^\s|\s$/.test(subject), 'No leading/trailing whitespace');
    } else {
      check(false, 'Type is one of: ' + TYPES.join(', '));
    }
    check(msg.split('\n').length === 1 || /^\n/.test(msg.slice(first.length)), 'Blank line between subject and body');
    if (/BREAKING[ -]CHANGE:/i.test(msg)) check(true, 'BREAKING CHANGE footer present');

    var okAll = checks.every(function (c) { return c.ok; });
    var title = document.createElement('p');
    title.innerHTML = okAll ? '<strong>✓ Valid Conventional Commit</strong>' : '<strong>✗ Needs fixes</strong>';
    host.appendChild(title);
    var ul = document.createElement('ul');
    checks.forEach(function (c) {
      var li = document.createElement('li');
      li.textContent = (c.ok ? '✓ ' : '✗ ') + c.label;
      li.style.color = c.ok ? 'inherit' : '#c62828';
      ul.appendChild(li);
    });
    host.appendChild(ul);
    TN.show(SLUG + '-verdict');
  }

  try {
    TN.on(SLUG + '-breaking', 'change', function () {
      el(SLUG + '-breaking-wrap').classList.toggle('hidden', !el(SLUG + '-breaking').checked);
    });
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-validate', 'click', validate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a message first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
  } catch (e) { /* never throw on load */ }
})();
