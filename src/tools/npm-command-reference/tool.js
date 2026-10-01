/* npm Command Reference — 40+ commands, searchable, click-to-copy. */
(function () {
  'use strict';
  var SLUG = 'npm-command-reference';
  var GROUPS = [
    ['Install & manage', [
      ['npm install', 'Install all dependencies'],
      ['npm ci', 'Clean install from package-lock.json'],
      ['npm install <pkg>', 'Install and save a package'],
      ['npm install -D <pkg>', 'Install as a dev dependency'],
      ['npm install -g <pkg>', 'Install globally'],
      ['npm install <pkg>@<ver>', 'Install a specific version'],
      ['npm update', 'Update packages to allowed ranges'],
      ['npm update <pkg>', 'Update one package'],
      ['npm uninstall <pkg>', 'Remove a package'],
      ['npm prune', 'Remove extraneous packages'],
      ['npm dedupe', 'Reduce duplicate packages'],
      ['npm rebuild', 'Rebuild native modules']
    ]],
    ['Scripts', [
      ['npm run <script>', 'Run a package.json script'],
      ['npm start', 'Run the start script'],
      ['npm test', 'Run the test script'],
      ['npm run build', 'Run the build script'],
      ['npm run <script> -- <args>', 'Pass args to a script'],
      ['npx <pkg>', 'Run a package without installing'],
      ['npx create-react-app myapp', 'Scaffold an app with a create-* package']
    ]],
    ['Info & audit', [
      ['npm list', 'Show installed dependency tree'],
      ['npm list <pkg>', 'Show where a package is used'],
      ['npm view <pkg> versions', 'List published versions'],
      ['npm view <pkg> dist-tags', 'Show dist tags like latest'],
      ['npm outdated', 'Packages with newer versions available'],
      ['npm audit', 'Report vulnerabilities'],
      ['npm audit fix', 'Auto-fix vulnerabilities'],
      ['npm doctor', 'Check your npm setup'],
      ['npm ls -g --depth=0', 'List global packages']
    ]],
    ['Publishing', [
      ['npm init', 'Create a package.json interactively'],
      ['npm init -y', 'Create package.json with defaults'],
      ['npm login', 'Authenticate with the registry'],
      ['npm publish', 'Publish the package'],
      ['npm publish --dry-run', 'Preview what would publish'],
      ['npm version patch', 'Bump version and tag'],
      ['npm dist-tag add pkg@1.0.0 beta', 'Tag a published version'],
      ['npm deprecate pkg@"<2" "msg"', 'Deprecate old versions'],
      ['npm unpublish pkg@1.0.0', 'Remove a version (within 72h)']
    ]],
    ['Config & cache', [
      ['npm config list', 'Show effective config'],
      ['npm config get registry', 'Show the registry URL'],
      ['npm config set registry <url>', 'Use a custom registry'],
      ['npm cache clean --force', 'Clear the npm cache'],
      ['npm cache verify', 'Verify cache integrity']
    ]]
  ];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }

  function render(filter) {
    var host = el(SLUG + '-list');
    host.innerHTML = '';
    var q = (filter || '').toLowerCase().trim();
    var shown = 0;
    GROUPS.forEach(function (g) {
      var items = g[1].filter(function (it) {
        return !q || it[0].toLowerCase().indexOf(q) >= 0 || it[1].toLowerCase().indexOf(q) >= 0;
      });
      if (!items.length) return;
      shown += items.length;
      var h = document.createElement('h3');
      h.textContent = g[0];
      h.style.margin = '18px 0 8px';
      host.appendChild(h);
      items.forEach(function (it) {
        var row = document.createElement('div');
        row.className = 'copy-row';
        row.style.cssText = 'margin-bottom:8px;cursor:pointer';
        row.title = 'Click to copy';
        var code = document.createElement('code');
        code.className = 'code';
        code.style.flex = '1';
        code.textContent = it[0];
        var desc = document.createElement('span');
        desc.className = 'muted';
        desc.style.cssText = 'flex:1.4;font-size:13px';
        desc.textContent = it[1];
        row.appendChild(code);
        row.appendChild(desc);
        row.addEventListener('click', function () {
          TN.copy(it[0]).then(function (ok) {
            if (!ok) fail('Copy failed — select the text manually.');
          });
        });
        host.appendChild(row);
      });
    });
    el(SLUG + '-none').classList.toggle('hidden', shown > 0);
  }

  try {
    TN.on(SLUG + '-search', 'input', TN.debounce(function () {
      render(el(SLUG + '-search').value);
    }, 150));
    render('');
  } catch (e) { /* never throw on load */ }
})();
