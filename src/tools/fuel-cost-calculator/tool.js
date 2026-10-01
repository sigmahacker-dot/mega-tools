(function () {
  'use strict';
  var ERR = 'fuel-cost-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('fuel-distance')) return;
    TN.clearErr(ERR);
    var sys = TN.el('fuel-system').value;
    var dist = parseFloat(TN.el('fuel-distance').value);
    var eff = parseFloat(TN.el('fuel-eff').value);
    var price = parseFloat(TN.el('fuel-price').value);
    if (!(dist > 0)) { TN.setErr(ERR, 'Enter a trip distance greater than 0.'); return; }
    if (!(eff > 0)) { TN.setErr(ERR, 'Enter a fuel efficiency greater than 0.'); return; }
    if (!(price >= 0)) { TN.setErr(ERR, 'Enter a valid fuel price (0 or more).'); return; }
    var needed, unit, perLabel;
    if (sys === 'imp') {
      needed = dist / eff; unit = 'gal'; perLabel = 'Cost per mile';
      TN.el('fuel-distance-label').textContent = 'Distance (miles)';
      TN.el('fuel-eff-label').textContent = 'Efficiency (MPG)';
      TN.el('fuel-price-label').textContent = 'Fuel price ($/gallon)';
      TN.el('fuel-needed-label').textContent = 'Fuel needed (gal)';
    } else {
      needed = dist * eff / 100; unit = 'L'; perLabel = 'Cost per km';
      TN.el('fuel-distance-label').textContent = 'Distance (km)';
      TN.el('fuel-eff-label').textContent = 'Efficiency (L/100km)';
      TN.el('fuel-price-label').textContent = 'Fuel price ($/liter)';
      TN.el('fuel-needed-label').textContent = 'Fuel needed (L)';
    }
    var cost = needed * price;
    TN.el('fuel-needed').textContent = needed.toFixed(2) + ' ' + unit;
    TN.el('fuel-cost').textContent = money(cost);
    TN.el('fuel-perdist-label').textContent = perLabel;
    TN.el('fuel-perdist').textContent = money(cost / dist);
  }
  try {
    TN.on('fuel-system', 'change', calc);
    TN.on('fuel-distance', 'input', calc);
    TN.on('fuel-eff', 'input', calc);
    TN.on('fuel-price', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();