(function () {
  'use strict';
  var ERR = 'moving-box-calculator-error';
  function num(id) { var v = parseInt(TN.el(id).value, 10); return isNaN(v) ? 0 : v; }
  function calc() {
    if (!TN.el('move-bedrooms')) return;
    TN.clearErr(ERR);
    var b = num('move-bedrooms'), l = num('move-living'), k = num('move-kitchen'), d = num('move-dining');
    if (b < 0 || l < 0 || k < 0 || d < 0 || b > 10 || l > 6 || k > 3 || d > 6) { TN.setErr(ERR, 'Enter sensible room counts (bedrooms 0–10, living 0–6, kitchens 0–3, other 0–6).'); return; }
    if (b + l + k + d === 0) { TN.setErr(ERR, 'Enter at least one room.'); return; }
    var small = b * 3 + l * 2 + k * 3 + d * 1;
    var med = b * 3 + l * 2 + k * 2 + d * 2;
    var large = b * 2 + l * 2 + k * 2 + d * 1;
    var total = small + med + large;
    TN.el('move-total').textContent = total;
    TN.el('move-tape').textContent = Math.ceil(total / 12);
    TN.el('move-wardrobe').textContent = b * 2;
    TN.el('move-body').innerHTML =
      '<tr><td>Small (16×12×12 in)</td><td>' + small + '</td></tr>' +
      '<tr><td>Medium (18×18×16 in)</td><td>' + med + '</td></tr>' +
      '<tr><td>Large (24×18×18 in)</td><td>' + large + '</td></tr>' +
      '<tr><td><strong>Total</strong></td><td><strong>' + total + '</strong></td></tr>';
  }
  try {
    TN.on('move-bedrooms', 'input', calc);
    TN.on('move-living', 'input', calc);
    TN.on('move-kitchen', 'input', calc);
    TN.on('move-dining', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();