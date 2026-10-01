(function () {
  'use strict';
  var S = 'border-radius-generator';
  var KEYS = ['tlh', 'tlv', 'trh', 'trv', 'brh', 'brv', 'blh', 'blv'];
  function val(k) { return TN.el(S + '-' + k).value; }
  function css() {
    return 'border-radius: ' + val('tlh') + '% ' + val('trh') + '% ' + val('brh') + '% ' +
      val('blh') + '% / ' + val('tlv') + '% ' + val('trv') + '% ' + val('brv') + '% ' + val('blv') + '%;';
  }
  function update() {
    try {
      var snippet = css();
      var prev = TN.el(S + '-preview');
      if (prev) prev.style.borderRadius = snippet.replace(/^border-radius:\s*/, '').replace(/;\s*$/, '');
      var pre = TN.el(S + '-css');
      if (pre) pre.textContent = snippet;
      KEYS.forEach(function (k) {
        var lab = TN.el(S + '-' + k + '-val');
        if (lab) lab.textContent = val(k);
      });
    } catch (e) { /* never throw on input */ }
  }
  function randomize() {
    try {
      KEYS.forEach(function (k) {
        TN.el(S + '-' + k).value = Math.floor(Math.random() * 101);
      });
      update();
    } catch (e) { /* never throw */ }
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
    KEYS.forEach(function (k) { TN.on(S + '-' + k, 'input', update); });
    TN.on(S + '-randomize', 'click', randomize);
    TN.on(S + '-copy', 'click', copyCss);
    update();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
