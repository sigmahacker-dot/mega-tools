/* .gitignore Generator — stack checkboxes merged from embedded templates. */
(function () {
  'use strict';
  var SLUG = 'gitignore-generator';

  var TEMPLATES = {
    node: { label: 'Node.js', body:
'# Node\nnode_modules/\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\npackage-lock.json\n.pnpm-store/\n.env\n.env.local\n.env.*.local\ndist/\nbuild/\ncoverage/\n.nyc_output/\n*.tsbuildinfo\n.next/\n.nuxt/\n.cache/' },
    python: { label: 'Python', body:
'# Python\n__pycache__/\n*.py[cod]\n*$py.class\n*.so\n.venv/\nvenv/\nenv/\n.env\npip-log.txt\n.eggs/\n*.egg-info/\ndist/\nbuild/\n.pytest_cache/\n.coverage\nhtmlcov/\n*.ipynb_checkpoints' },
    java: { label: 'Java', body:
'# Java\n*.class\n*.jar\n*.war\n*.ear\ntarget/\n.gradle/\nbuild/\n!gradle-wrapper.jar\n*.iml\n.idea/' },
    go: { label: 'Go', body:
'# Go\n/bin/\n*.exe\n*.test\n*.out\nvendor/\ngo.work' },
    rust: { label: 'Rust', body:
'# Rust\n/target/\n**/*.rs.bk\nCargo.lock' },
    php: { label: 'PHP', body:
'# PHP\n/vendor/\n.env\n.env.local\ncomposer.phar\n*.log' },
    ruby: { label: 'Ruby', body:
'# Ruby\n.bundle/\nlog/*.log\ntmp/\n*.gem\n.ruby-version' },
    dotnet: { label: '.NET', body:
'# .NET\nbin/\nobj/\n*.user\n*.suo\n.vs/\nTestResults/\n*.nupkg' },
    macos: { label: 'macOS', body:
'# macOS\n.DS_Store\n.AppleDouble\n.LSOverride\n._*\n.Spotlight-V100\n.Trashes' },
    windows: { label: 'Windows', body:
'# Windows\nThumbs.db\nehthumbs.db\nDesktop.ini\n$RECYCLE.BIN/' },
    linux: { label: 'Linux', body:
'# Linux\n*~\n.fuse_hidden*\n.directory\n.Trash-*\n.nfs*' },
    vscode: { label: 'VS Code', body:
'# VS Code\n.vscode/\n*.code-workspace' },
    intellij: { label: 'IntelliJ', body:
'# IntelliJ\n.idea/\n*.iml\n*.iws\nout/' }
  };
  var ORDER = ['node', 'python', 'java', 'go', 'rust', 'php', 'ruby', 'dotnet', 'macos', 'windows', 'linux', 'vscode', 'intellij'];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function buildStacks() {
    var host = el(SLUG + '-stacks');
    ORDER.forEach(function (key) {
      var lab = document.createElement('label');
      lab.className = 'checkbox-row';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = SLUG + '-stack-' + key;
      cb.checked = (key === 'node');
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(' ' + TEMPLATES[key].label));
      host.appendChild(lab);
    });
  }

  function generate() {
    clear();
    var chosen = ORDER.filter(function (key) {
      var cb = el(SLUG + '-stack-' + key);
      return cb && cb.checked;
    });
    if (!chosen.length) { fail('Tick at least one stack.'); return; }
    var seen = {}, sections = [];
    chosen.forEach(function (key) {
      var lines = TEMPLATES[key].body.split('\n').filter(function (l) {
        var t = l.trim();
        if (!t || t[0] === '#') return true;
        if (seen[t]) return false;
        seen[t] = true;
        return true;
      });
      sections.push(lines.join('\n'));
    });
    el(SLUG + '-output').value = sections.join('\n\n') + '\n';
  }

  try {
    buildStacks();
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a .gitignore first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a .gitignore first.'); return; }
      TN.downloadText(v, '.gitignore', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
