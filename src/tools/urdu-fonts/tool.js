(function () {
  'use strict';
  var S = 'urdu-fonts';
  var DEFAULT_SAMPLE = 'اردو زبان خوبصورت ہے';
  function update() {
    var box = TN.el(S + '-preview');
    var text = (box && box.value || '').replace(/\s+$/, '');
    if (!text) text = DEFAULT_SAMPLE;
    TN.qsa('.' + S + '-sample').forEach(function (el) {
      el.textContent = text;
    });
  }
  try { TN.on(S + '-preview', 'input', update); } catch (e) {}
  update();
})();
