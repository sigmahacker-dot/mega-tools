/* EditorConfig Generator — options → .editorconfig file. */
(function () {
  'use strict';
  var SLUG = 'editorconfig-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function generate() {
    clear();
    var L = [];
    if (el(SLUG + '-root').checked) L.push('root = true', '');
    L.push('[*]');
    L.push('charset = ' + el(SLUG + '-charset').value);
    L.push('end_of_line = ' + el(SLUG + '-eol').value);
    L.push('indent_style = ' + el(SLUG + '-indent').value);
    L.push('indent_size = ' + Math.max(1, Math.min(8, parseInt(el(SLUG + '-size').value, 10) || 2)));
    var maxlen = parseInt(el(SLUG + '-maxlen').value, 10) || 0;
    if (maxlen > 0) L.push('max_line_length = ' + maxlen);
    L.push('trim_trailing_whitespace = ' + el(SLUG + '-trim').checked);
    L.push('insert_final_newline = ' + el(SLUG + '-final').checked);
    var extra = el(SLUG + '-section').value.trim();
    if (extra) L.push('', extra);
    el(SLUG + '-output').value = L.join('\n') + '\n';
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    ['root', 'trim', 'final'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', generate); });
    ['charset', 'eol', 'indent'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', generate); });
    ['size', 'maxlen', 'section'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', generate); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the config first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the config first.'); return; }
      TN.downloadText(v, '.editorconfig', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
