/* Prettier Config Generator — formatting options → .prettierrc JSON. */
(function () {
  'use strict';
  var SLUG = 'prettier-config-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function update() {
    clear();
    var cfg = {
      printWidth: Math.max(40, Math.min(200, parseInt(el(SLUG + '-printwidth').value, 10) || 100)),
      tabWidth: Math.max(1, Math.min(8, parseInt(el(SLUG + '-tabwidth').value, 10) || 2)),
      useTabs: el(SLUG + '-usestabs').checked,
      semi: el(SLUG + '-semi').checked,
      singleQuote: el(SLUG + '-single').checked,
      quoteProps: el(SLUG + '-quoteprops').value,
      jsxSingleQuote: el(SLUG + '-jsxsingle').checked,
      trailingComma: el(SLUG + '-trailing').value,
      bracketSpacing: el(SLUG + '-bracketspace').checked,
      arrowParens: el(SLUG + '-arrow').value,
      endOfLine: el(SLUG + '-eol').value
    };
    if (el(SLUG + '-jsxbracket').checked) cfg.jsxBracketSameLine = true;
    el(SLUG + '-output').value = JSON.stringify(cfg, null, 2) + '\n';
  }

  try {
    if (!el(SLUG + '-printwidth')) return;
    ['printwidth', 'tabwidth'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['trailing', 'arrow', 'quoteprops', 'eol'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    ['semi', 'single', 'usestabs', 'bracketspace', 'jsxsingle', 'jsxbracket'].forEach(function (k) {
      TN.on(SLUG + '-' + k, 'change', update);
    });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, '.prettierrc', 'application/json');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
