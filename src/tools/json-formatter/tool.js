(function () {
  'use strict';
  var P = 'json-formatter-';
  var lastOutput = '';

  function tryParse() {
    var t = TN.el(P + 'input').value;
    TN.hide(P + 'success');
    if (!t.trim()) { TN.setErr(P + 'error', 'Paste some JSON first.'); return null; }
    try {
      var v = JSON.parse(t);
      TN.clearErr(P + 'error');
      return { ok: true, v: v };
    } catch (e) {
      TN.setErr(P + 'error', 'Invalid JSON: ' + (e && e.message ? e.message : e));
      TN.hide(P + 'result');
      return null;
    }
  }

  function show(text) {
    lastOutput = text;
    TN.el(P + 'output').textContent = text;
    TN.show(P + 'result');
  }

  TN.on(P + 'format2', 'click', function () {
    var r = tryParse(); if (!r) return;
    show(JSON.stringify(r.v, null, 2));
  });
  TN.on(P + 'format4', 'click', function () {
    var r = tryParse(); if (!r) return;
    show(JSON.stringify(r.v, null, 4));
  });
  TN.on(P + 'minify', 'click', function () {
    var r = tryParse(); if (!r) return;
    show(JSON.stringify(r.v));
  });
  TN.on(P + 'validate', 'click', function () {
    var r = tryParse(); if (!r) return;
    TN.hide(P + 'result');
    var s = TN.el(P + 'success');
    s.textContent = 'Valid JSON.';
    TN.show(P + 'success');
  });
  TN.on(P + 'sample', 'click', function () {
    TN.el(P + 'input').value = JSON.stringify({
      name: 'Ada Lovelace',
      role: 'developer',
      active: true,
      score: 99.5,
      tags: ['json', 'tools', 'web'],
      address: { city: 'London', zip: null }
    }, null, 2);
    TN.clearErr(P + 'error');
    TN.hide(P + 'result');
    TN.hide(P + 'success');
  });
  TN.on(P + 'copy', 'click', function () {
    if (!lastOutput) { TN.setErr(P + 'error', 'Nothing to copy yet — format or minify first.'); return; }
    TN.clearErr(P + 'error');
    TN.copy(lastOutput).then(function () {
      TN.setErr(P + 'error', '');
    }, function () {
      TN.setErr(P + 'error', 'Copy failed — select the text manually.');
    });
  });
  TN.on(P + 'download', 'click', function () {
    if (!lastOutput) { TN.setErr(P + 'error', 'Nothing to download yet — format or minify first.'); return; }
    TN.clearErr(P + 'error');
    TN.downloadText(lastOutput, 'formatted.json', 'application/json');
  });
})();
