/* tsconfig Generator — compiler options → tsconfig.json. */
(function () {
  'use strict';
  var SLUG = 'tsconfig-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function csv(id) {
    return el(SLUG + '-' + id).value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function update() {
    clear();
    var co = {
      target: el(SLUG + '-target').value,
      module: el(SLUG + '-module').value,
      strict: el(SLUG + '-strict').checked,
      esModuleInterop: el(SLUG + '-esinterop').checked,
      skipLibCheck: el(SLUG + '-skiplib').checked,
      forceConsistentCasingInFileNames: el(SLUG + '-casing').checked,
      isolatedModules: el(SLUG + '-isolated').checked,
      resolveJsonModule: el(SLUG + '-resolvejson').checked,
      allowJs: el(SLUG + '-allowjs').checked,
      declaration: el(SLUG + '-decl').checked,
      sourceMap: el(SLUG + '-sourcemap').checked
    };
    var lib = csv('lib');
    if (lib.length) co.lib = lib;
    var outDir = el(SLUG + '-outdir').value.trim();
    var rootDir = el(SLUG + '-rootdir').value.trim();
    if (outDir) co.outDir = outDir;
    if (rootDir) co.rootDir = rootDir;
    var cfg = { compilerOptions: co };
    var inc = csv('include'), exc = csv('exclude');
    if (inc.length) cfg.include = inc;
    if (exc.length) cfg.exclude = exc;
    el(SLUG + '-output').value = JSON.stringify(cfg, null, 2) + '\n';
  }

  try {
    if (!el(SLUG + '-target')) return;
    ['target', 'module'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    ['strict', 'esinterop', 'skiplib', 'casing', 'decl', 'sourcemap', 'resolvejson', 'allowjs', 'isolated'].forEach(function (k) {
      TN.on(SLUG + '-' + k, 'change', update);
    });
    ['lib', 'outdir', 'rootdir', 'include', 'exclude'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'tsconfig.json', 'application/json');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
