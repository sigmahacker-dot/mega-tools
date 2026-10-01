(function () {
  'use strict';
  var ERR = 'wallpaper-calculator-error';
  function calc() {
    if (!TN.el('wall-length')) return;
    TN.clearErr(ERR);
    var L = parseFloat(TN.el('wall-length').value);
    var H = parseFloat(TN.el('wall-height').value);
    var cov = parseFloat(TN.el('wall-coverage').value);
    var rep = TN.el('wall-repeat').value;
    if (!(L > 0)) { TN.setErr(ERR, 'Enter a wall length greater than 0 ft.'); return; }
    if (!(H > 0)) { TN.setErr(ERR, 'Enter a wall height greater than 0 ft.'); return; }
    if (!(cov > 0)) { TN.setErr(ERR, 'Enter roll coverage greater than 0 sq ft.'); return; }
    var area = L * H;
    var rolls = Math.ceil(area / cov - 1e-9) + (rep === 'yes' ? 1 : 0);
    var strips = Math.ceil(L / 2.25 - 1e-9);
    TN.el('wall-rolls').textContent = rolls;
    TN.el('wall-area').textContent = area.toFixed(1) + ' sq ft';
    TN.el('wall-strips').textContent = strips;
  }
  try {
    TN.on('wall-length', 'input', calc);
    TN.on('wall-height', 'input', calc);
    TN.on('wall-coverage', 'input', calc);
    TN.on('wall-repeat', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();