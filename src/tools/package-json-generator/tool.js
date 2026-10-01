/* package.json Generator — form → valid package.json with scripts and deps. */
(function () {
  'use strict';
  var SLUG = 'package-json-generator';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function kvRow(hostId, ph1, ph2, extra) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center';
    var a = document.createElement('input');
    a.className = 'input'; a.placeholder = ph1;
    var b = document.createElement('input');
    b.className = 'input'; b.placeholder = ph2; b.style.flex = '2';
    wrap.appendChild(a); wrap.appendChild(b);
    if (extra === 'dev') {
      var lab = document.createElement('label');
      lab.style.cssText = 'display:inline-flex;align-items:center;gap:4px;white-space:nowrap;font-size:13px';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      lab.appendChild(cb); lab.appendChild(document.createTextNode('dev'));
      wrap.appendChild(lab);
    }
    var rm = document.createElement('button');
    rm.className = 'btn btn-outline'; rm.textContent = '✕';
    rm.setAttribute('aria-label', 'Remove row');
    rm.addEventListener('click', function () { wrap.remove(); });
    wrap.appendChild(rm);
    el(hostId).appendChild(wrap);
  }

  function generate() {
    clear();
    var name = el(SLUG + '-name').value.trim();
    if (!name) { fail('Enter a package name.'); return; }
    if (!/^[a-z0-9][a-z0-9._~-]*(\/[a-z0-9][a-z0-9._~-]*)?$/.test(name)) {
      fail('Package name must be lowercase, URL-safe (letters, numbers, - _ . ~).');
      return;
    }
    var version = el(SLUG + '-version').value.trim() || '1.0.0';
    if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/.test(version)) {
      fail('Version should look like 1.0.0 (semver).');
      return;
    }
    var pkg = {
      name: name,
      version: version,
      description: el(SLUG + '-desc').value.trim(),
      main: el(SLUG + '-main').value.trim() || 'index.js',
      license: el(SLUG + '-license').value
    };
    if (el(SLUG + '-type').value === 'module') pkg.type = 'module';
    var scripts = {};
    var srows = el(SLUG + '-scripts').children;
    for (var i = 0; i < srows.length; i++) {
      var si = srows[i].querySelectorAll('input');
      if (si[0].value.trim()) scripts[si[0].value.trim()] = si[1].value.trim();
    }
    if (Object.keys(scripts).length) pkg.scripts = scripts;
    var deps = {}, devDeps = {};
    var drows = el(SLUG + '-deps').children;
    for (var j = 0; j < drows.length; j++) {
      var di = drows[j].querySelectorAll('input');
      var dn = di[0].value.trim();
      if (!dn) continue;
      var dv = di[1].value.trim() || 'latest';
      var isDev = drows[j].querySelector('input[type=checkbox]').checked;
      (isDev ? devDeps : deps)[dn] = dv;
    }
    if (Object.keys(deps).length) pkg.dependencies = deps;
    if (Object.keys(devDeps).length) pkg.devDependencies = devDeps;
    el(SLUG + '-output').value = JSON.stringify(pkg, null, 2) + '\n';
  }

  try {
    TN.on(SLUG + '-add-script', 'click', function () { kvRow(SLUG + '-scripts', 'test', 'jest'); });
    TN.on(SLUG + '-add-dep', 'click', function () { kvRow(SLUG + '-deps', 'express', '^4.18.0', 'dev'); });
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate package.json first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate package.json first.'); return; }
      TN.downloadText(v, 'package.json', 'application/json');
    });
    kvRow(SLUG + '-scripts', 'start', 'node index.js');
    kvRow(SLUG + '-scripts', 'test', 'jest');
    kvRow(SLUG + '-deps', 'express', '^4.18.0', 'dev');
  } catch (e) { /* never throw on load */ }
})();
