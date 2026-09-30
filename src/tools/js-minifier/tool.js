(function () {
  'use strict';
  var P = 'js-minifier-';
  var lastOutput = '';

  function bytes(s) {
    try { return new TextEncoder().encode(s).length; }
    catch (e) { return s.length; }
  }

  TN.on(P + 'minify', 'click', function () {
    var code = TN.el(P + 'input').value;
    if (!code.trim()) { TN.setErr(P + 'error', 'Paste some JavaScript first.'); return; }
    TN.clearErr(P + 'error');
    TN.hide(P + 'result');
    TN.hide(P + 'stats');
    var btn = TN.el(P + 'minify');
    var oldLabel = btn.textContent;
    btn.textContent = 'Minifying…';
    btn.disabled = true;

    function done() {
      btn.textContent = oldLabel;
      btn.disabled = false;
    }

    Promise.resolve().then(function () {
      if (typeof Terser === 'undefined') {
        throw new Error('Terser library failed to load. Check your connection and try again.');
      }
      return Terser.minify(code, { compress: {}, mangle: {} });
    }).then(function (res) {
      done();
      if (!res) { throw new Error('Terser returned no result.'); }
      if (res.error) { throw res.error; }
      var out = res.code || '';
      lastOutput = out;
      TN.el(P + 'output').textContent = out;
      var o = bytes(code), n = bytes(out);
      var pct = o > 0 ? Math.round((1 - n / o) * 100) : 0;
      TN.el(P + 'orig').textContent = TN.fmtBytes(o);
      TN.el(P + 'min').textContent = TN.fmtBytes(n);
      TN.el(P + 'saved').textContent = pct + '%';
      TN.show(P + 'stats');
      TN.show(P + 'result');
    }).catch(function (e) {
      done();
      var msg = e && e.message ? e.message : String(e);
      TN.setErr(P + 'error', 'Minify failed: ' + msg);
    });
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
    TN.downloadText(lastOutput, 'minified.min.js', 'text/javascript');
  });
})();
