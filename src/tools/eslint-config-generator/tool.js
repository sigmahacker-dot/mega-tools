/* ESLint Config Generator — presets + envs + custom rules → flat eslint.config.js. */
(function () {
  'use strict';
  var SLUG = 'eslint-config-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  var PRESET_RULES = {
    minimal: {},
    plus: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'eqeqeq': 'error',
      'curly': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    },
    strict: {
      'no-unused-vars': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'eqeqeq': 'error',
      'curly': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'object-shorthand': 'error'
    }
  };

  function generate() {
    clear();
    var preset = el(SLUG + '-preset').value;
    var browser = el(SLUG + '-browser').checked;
    var node = el(SLUG + '-node').checked;
    var rules = {};
    Object.keys(PRESET_RULES[preset]).forEach(function (k) { rules[k] = PRESET_RULES[preset][k]; });
    var bad = [];
    el(SLUG + '-rules').value.split('\n').forEach(function (l, n) {
      l = l.trim();
      if (!l) return;
      var i = l.indexOf(':');
      if (i < 0) { bad.push(n + 1); return; }
      var name = l.slice(0, i).trim(), sev = l.slice(i + 1).trim();
      if (!/^[a-z0-9/-]+$/.test(name) || ['error', 'warn', 'off'].indexOf(sev) < 0) { bad.push(n + 1); return; }
      rules[name] = sev;
    });
    if (bad.length) { fail('Bad rule format on line(s): ' + bad.join(', ') + ' — use "name: error|warn|off".'); return; }
    var L = [];
    L.push('// npm i -D eslint @eslint/js' + ((browser || node) ? ' globals' : ''));
    L.push('import js from "@eslint/js";');
    if (browser || node) L.push('import globals from "globals";');
    L.push('');
    L.push('export default [');
    L.push('  js.configs.recommended,');
    L.push('  {');
    L.push('    files: ["**/*.js"],');
    var lo = [];
    lo.push('      ecmaVersion: "latest",');
    lo.push('      sourceType: "module",');
    if (browser || node) {
      var gs = [];
      if (browser) gs.push('...globals.browser');
      if (node) gs.push('...globals.node');
      lo.push('      globals: { ' + gs.join(', ') + ' },');
    }
    L.push('    languageOptions: {');
    L = L.concat(lo);
    L.push('    },');
    var rkeys = Object.keys(rules);
    if (rkeys.length) {
      L.push('    rules: {');
      rkeys.forEach(function (k, i) {
        L.push('      "' + k + '": "' + rules[k] + '"' + (i < rkeys.length - 1 ? ',' : ''));
      });
      L.push('    },');
    }
    L.push('  },');
    L.push('];');
    el(SLUG + '-output').value = L.join('\n') + '\n';
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-preset', 'change', generate);
    ['browser', 'node'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', generate); });
    TN.on(SLUG + '-rules', 'input', TN.debounce(generate, 400));
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the config first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the config first.'); return; }
      TN.downloadText(v, 'eslint.config.js', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
