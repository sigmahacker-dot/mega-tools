(function () {
  'use strict';
  var P = 'html-minifier-';
  var lastOutput = '';
  var TOKEN = '__HTMLMIN_BLOCK_';

  function bytes(s) {
    try { return new TextEncoder().encode(s).length; }
    catch (e) { return s.length; }
  }

  function minifyHTML(html) {
    var blocks = [];
    // Protect pre / textarea / script / style contents so their whitespace survives.
    html = html.replace(/<(pre|textarea|script|style)(\s[^>]*)?>[\s\S]*?<\/\1\s*>/gi, function (m) {
      blocks.push(m);
      return TOKEN + (blocks.length - 1) + '__';
    });
    // Strip comments (keep IE conditional comments).
    html = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
    // Collapse whitespace runs and drop whitespace between tags.
    html = html.replace(/\s+/g, ' ');
    html = html.replace(/>\s+</g, '><');
    // Restore protected blocks.
    html = html.replace(new RegExp(TOKEN + '(\\d+)__', 'g'), function (m, i) {
      return blocks[parseInt(i, 10)] || '';
    });
    return html.trim();
  }

  TN.on(P + 'minify', 'click', function () {
    var input = TN.el(P + 'input').value;
    if (!input.trim()) { TN.setErr(P + 'error', 'Paste some HTML first.'); return; }
    TN.clearErr(P + 'error');
    try {
      var out = minifyHTML(input);
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
    TN.downloadText(lastOutput, 'minified.html', 'text/html');
  });
})();
