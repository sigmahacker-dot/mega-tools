(function () {
  'use strict';
  var ERR = 'concrete-calculator-error';
  function calc() {
    if (!TN.el('conc-length')) return;
    TN.clearErr(ERR);
    var L = parseFloat(TN.el('conc-length').value);
    var W = parseFloat(TN.el('conc-width').value);
    var T = parseFloat(TN.el('conc-thick').value);
    if (!(L > 0)) { TN.setErr(ERR, 'Enter a length greater than 0 ft.'); return; }
    if (!(W > 0)) { TN.setErr(ERR, 'Enter a width greater than 0 ft.'); return; }
    if (!(T > 0)) { TN.setErr(ERR, 'Enter a thickness greater than 0 inches.'); return; }
    var ft3 = L * W * (T / 12);
    var yd3 = ft3 / 27;
    var order = Math.ceil(yd3 * 4) / 4;
    var bags80 = Math.ceil(ft3 * 1.1 / 0.6);
    var bags60 = Math.ceil(ft3 * 1.1 / 0.45);
    TN.el('conc-yards').textContent = order.toFixed(2) + ' yd³';
    TN.el('conc-bags80').textContent = bags80;
    TN.el('conc-bags60').textContent = bags60;
    TN.el('conc-body').innerHTML =
      '<tr><td>Volume (exact)</td><td>' + yd3.toFixed(2) + ' yd³ (' + ft3.toFixed(1) + ' ft³)</td></tr>' +
      '<tr><td>Order amount (rounded up)</td><td>' + order.toFixed(2) + ' yd³</td></tr>' +
      '<tr><td>80 lb bags (0.6 ft³ each)</td><td>' + bags80 + ' bags</td></tr>' +
      '<tr><td>60 lb bags (0.45 ft³ each)</td><td>' + bags60 + ' bags</td></tr>';
  }
  try {
    TN.on('conc-length', 'input', calc);
    TN.on('conc-width', 'input', calc);
    TN.on('conc-thick', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();