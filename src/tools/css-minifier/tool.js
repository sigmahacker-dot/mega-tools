(function () {
  'use strict';
  var P = 'css-minifier-';
  var lastOutput = '';
  var TOKEN = '__CSSMIN_STR_';

  function bytes(s) {
    try { return new TextEncoder().encode(s).length; }
    catch (e) { return s.length; }
  }

  function minifyCSS(css) {
    // Protect quoted strings so comment/whitespace rules don't touch them.
    var strings = [];
    css = css.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, function (m) {
      strings.push(m);
      return TOKEN + (strings.length - 1) + '__';
    });
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');      // remove comments
    css = css.replace(/\s+/g, ' ');                  // collapse whitespace
    css = css.replace(/\s*([{}:;,>+~])\s*/g, '$1');  // strip space around punctuation
    css = css.replace(/;}/g, '}');                   // drop trailing semicolons
    css = css.trim();
    css = css.replace(new RegExp(TOKEN + '(\\d+)__', 'g'), function (m, i) {
      return strings[parseInt(i, 10)] || '';
    });
    return css;
  }

  TN.on(P + 'minify', 'click', function () {
    var input = TN.el(P + 'input').value;
    if (!input.trim()) { TN.setErr(P + 'error', 'Paste some CSS first.'); return; }
    TN.clearErr(P + 'error');
    try {
      var out = minifyCSS(input);
      lastOutput = out;
      TN.el(P + 'output').textContent = out;
      var o = bytes(input), n = bytes(out);
      var pct = o > 0 ? Math.round((1 - n / o) * 100) : 0;
      TN.el(P + 'orig').textContent = TN.fmtBytes(o);
      TN.el(P + 'min').textContent = TN.fmtBytes(n);
      TN.el(P + 'saved').textContent = pct + '%';
      TN.show(P + 'stats');
      TN.show(P + 'result');
    } catch (e) {
      TN.setErr(P + 'error', 'Minify failed: ' + (e && e.message ? e.message : e));
    }
  });

  TN.on(P + 'clear', 'click', function () {
    TN.el(P + 'input').value = '';
    TN.clearErr(P + 'error');
    TN.hide(P + 'result');
    TN.hide(P + 'stats');
    lastOutput = '';
  });

  TN.on(P + 'copy', 'click', function () {
    if (!lastOutput) { TN.setErr(P + 'error', 'Nothing to copy yet — minify first.'); return; }
    TN.clearErr(P + 'error');
    TN.copy(lastOutput).then(null, function () {
      TN.setErr(P + 'error', 'Copy failed — select the text manually.');
    });
  });

  TN.on(P + 'download', 'click', function () {
    if (!lastOutput) { TN.setErr(P + 'error', 'Nothing to download yet — minify first.'); return; }
    TN.clearErr(P + 'error');
    TN.downloadText(lastOutput, 'minified.css', 'text/css');
  });
})();
