(function () {
  'use strict';
  var S = 'box-shadow-generator';
  function css() {
    var x = TN.el(S + '-x').value;
    var y = TN.el(S + '-y').value;
    var blur = TN.el(S + '-blur').value;
    var spread = TN.el(S + '-spread').value;
    var color = TN.el(S + '-color').value;
    var inset = TN.el(S + '-inset').checked ? 'inset ' : '';
    return 'box-shadow: ' + inset + x + 'px ' + y + 'px ' + blur + 'px ' + spread + 'px ' + color + ';';
  }
  function update() {
    try {
      TN.clearErr(S + '-error');
      var snippet = css();
      var prev = TN.el(S + '-preview');
      if (prev) prev.style.boxShadow = snippet.replace(/^box-shadow:\s*/, '').replace(/;\s*$/, '');
      var pre = TN.el(S + '-css');
      if (pre) pre.textContent = snippet;
      [['x'], ['y'], ['blur'], ['spread']].forEach(function (k) {
        var v = TN.el(S + '-' + k[0] + '-val');
        if (v) v.textContent = TN.el(S + '-' + k[0]).value;
      });
    } catch (e) { /* never throw on input */ }
  }
  function copyCss() {
    try {
      TN.copy(css()).then(function (ok) {
        if (!ok) TN.setErr(S + '-error', 'Copy failed — select the CSS and copy it manually.');
        else TN.clearErr(S + '-error');
      });
    } catch (e) { TN.setErr(S + '-error', 'Copy failed.'); }
  }
  function init() {
    ['x', 'y', 'blur', 'spread'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', update);
    });
    TN.on(S + '-color', 'input', update);
    TN.on(S + '-inset', 'change', update);
    TN.on(S + '-copy', 'click', copyCss);
    update();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
