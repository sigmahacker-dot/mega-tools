(function () {
  'use strict';
  var S = 'gradient-generator';
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function update() {
    try {
      TN.clearErr(S + '-error');
      var c1 = TN.el(S + '-c1').value || '#166534';
      var c2 = TN.el(S + '-c2').value || '#4d7c0f';
      var angle = parseInt(TN.el(S + '-angle').value, 10);
      if (!(angle >= 0)) angle = 0;
      TN.el(S + '-angle-val').textContent = angle;
      var css = 'linear-gradient(' + angle + 'deg, ' + c1 + ', ' + c2 + ')';
      TN.el(S + '-preview').style.background = css;
      TN.el(S + '-css').textContent = 'background: ' + css + ';';
    } catch (e) {}
  }
  on(S + '-c1', 'input', update);
  on(S + '-c2', 'input', update);
  on(S + '-angle', 'input', update);
  on(S + '-random', 'click', function () {
    try {
      TN.el(S + '-c1').value = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
      TN.el(S + '-c2').value = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
      TN.el(S + '-angle').value = Math.floor(Math.random() * 361);
      update();
    } catch (e) {}
  });
  on(S + '-copy', 'click', function () {
    try {
      var css = TN.el(S + '-css').textContent;
      if (!css) return;
      TN.copy(css).catch(function () { TN.setErr(S + '-error', 'Copy failed — please copy manually.'); });
    } catch (e) {}
  });
  try { update(); } catch (e) {}
})();
