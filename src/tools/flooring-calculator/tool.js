(function () {
  'use strict';
  var ERR = 'flooring-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('floor-length')) return;
    TN.clearErr(ERR);
    var L = parseFloat(TN.el('floor-length').value);
    var W = parseFloat(TN.el('floor-width').value);
    var waste = parseFloat(TN.el('floor-waste').value);
    var box = parseFloat(TN.el('floor-box').value);
    var price = parseFloat(TN.el('floor-price').value);
    if (!(L > 0)) { TN.setErr(ERR, 'Enter a room length greater than 0 ft.'); return; }
    if (!(W > 0)) { TN.setErr(ERR, 'Enter a room width greater than 0 ft.'); return; }
    if (isNaN(waste) || waste < 0 || waste > 50) { TN.setErr(ERR, 'Enter a waste allowance between 0 and 50%.'); return; }
    if (!(box > 0)) { TN.setErr(ERR, 'Enter box coverage greater than 0 sq ft.'); return; }
    if (isNaN(price)) price = 0;
    if (price < 0) { TN.setErr(ERR, 'Price per box cannot be negative.'); return; }
    var net = L * W;
    var total = net * (1 + waste / 100);
    var boxes = Math.ceil(total / box - 1e-9);
    TN.el('floor-boxes').textContent = boxes;
    TN.el('floor-area').textContent = total.toFixed(1) + ' sq ft';
    TN.el('floor-cost').textContent = price > 0 ? money(boxes * price) : '–';
  }
  try {
    TN.on('floor-length', 'input', calc);
    TN.on('floor-width', 'input', calc);
    TN.on('floor-waste', 'input', calc);
    TN.on('floor-box', 'input', calc);
    TN.on('floor-price', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();