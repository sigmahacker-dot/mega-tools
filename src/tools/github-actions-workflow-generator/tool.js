/* GitHub Actions Workflow Generator — language presets → CI workflow YAML. */
(function () {
  'use strict';
  var SLUG = 'github-actions-workflow-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  var PRESETS = {
    node: function (v, test) {
      return [
        '      - uses: actions/checkout@v4',
        '      - uses: actions/setup-node@v4',
        '        with:',
        '          node-version: ' + JSON.stringify(v || '20'),
        '          cache: npm',
        '      - run: npm ci',
        '      - run: npm run build --if-present'
      ].concat(test ? ['      - run: npm test'] : []);
    },
    python: function (v, test) {
      return [
        '      - uses: actions/checkout@v4',
        '      - uses: actions/setup-python@v5',
        '        with:',
        "          python-version: " + JSON.stringify(v || '3.12'),
        '      - run: pip install -r requirements.txt'
      ].concat(test ? ['      - run: pytest'] : []);
    },
    go: function (v, test) {
      return [
        '      - uses: actions/checkout@v4',
        '      - uses: actions/setup-go@v5',
        '        with:',
        "          go-version: " + JSON.stringify(v || '1.22'),
        '      - run: go build ./...'
      ].concat(test ? ['      - run: go test ./...'] : []);
    },
    java: function (v, test) {
      return [
        '      - uses: actions/checkout@v4',
        '      - uses: actions/setup-java@v4',
        '        with:',
        "          distribution: 'temurin'",
        "          java-version: " + JSON.stringify(v || '21'),
        '          cache: maven'
      ].concat(test ? ['      - run: mvn -B verify'] : ['      - run: mvn -B -DskipTests package']);
    },
    dotnet: function (v, test) {
      return [
        '      - uses: actions/checkout@v4',
        '      - uses: actions/setup-dotnet@v4',
        '        with:',
        "          dotnet-version: " + JSON.stringify(v || '8.0.x'),
        '      - run: dotnet build'
      ].concat(test ? ['      - run: dotnet test'] : []);
    },
    rust: function (v, test) {
      return [
        '      - uses: actions/checkout@v4',
        '      - uses: dtolnay/rust-toolchain@stable' + (v && v !== 'stable' ? '' : ''),
        '      - run: cargo build --verbose'
      ].concat(test ? ['      - run: cargo test --verbose'] : []);
    }
  };

  function generate() {
    clear();
    var name = el(SLUG + '-name').value.trim() || 'CI';
    var lang = el(SLUG + '-lang').value;
    var os = el(SLUG + '-os').value;
    var onPush = el(SLUG + '-push').checked;
    var onPr = el(SLUG + '-pr').checked;
    if (!onPush && !onPr) { fail('Enable at least one trigger.'); return; }
    var branches = el(SLUG + '-branches').value.split(',').map(function (b) { return b.trim(); }).filter(Boolean);
    var version = el(SLUG + '-version').value.trim();
    var test = el(SLUG + '-test').checked;
    var steps = PRESETS[lang](version, test);
    el(SLUG + '-extra').value.split('\n').forEach(function (l) {
      l = l.trim();
      if (!l) return;
      var i = l.indexOf(':');
      if (i < 0) steps.push('      - run: ' + l);
      else steps.push('      - name: ' + l.slice(0, i).trim() + '\n        run: ' + l.slice(i + 1).trim());
    });
    var triggers = [];
    if (onPush) triggers.push('  push:\n    branches: [' + branches.map(function (b) { return JSON.stringify(b); }).join(', ') + ']');
    if (onPr) triggers.push('  pull_request:\n    branches: [' + branches.map(function (b) { return JSON.stringify(b); }).join(', ') + ']');
    var yaml =
      'name: ' + name + '\n\n' +
      'on:\n' + triggers.join('\n') + '\n\n' +
      'jobs:\n  build:\n    runs-on: ' + os + '\n    steps:\n' + steps.join('\n') + '\n';
    el(SLUG + '-output').value = yaml;
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    ['lang', 'os'].forEach(function (k) {
      TN.on(SLUG + '-' + k, 'change', function () {
        var defaults = { node: '20', python: '3.12', go: '1.22', java: '21', dotnet: '8.0.x', rust: 'stable' };
        el(SLUG + '-version').value = defaults[el(SLUG + '-lang').value];
        generate();
      });
    });
    ['name', 'branches', 'version', 'extra'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', generate); });
    ['push', 'pr', 'test'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', generate); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the workflow first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the workflow first.'); return; }
      TN.downloadText(v, 'ci.yml', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
