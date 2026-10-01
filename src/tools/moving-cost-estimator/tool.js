/* Moving cost estimator — DIY vs full-service cost model with breakdown and range. */
(function () {
  'use strict';
  var SLUG = 'moving-cost-estimator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  var MODELS = {
    full: { base: 1200, perMile: 1.05, perRoom: 350, labels: ['Base fee', 'Distance charge', 'Packing / labor'] },
    diy: { base: 150, perMile: 0.35, perRoom: 80, labels: ['Truck rental base', 'Fuel + mileage', 'Supplies'] }
  };
  function calc() {
    TN.clearErr(SLUG + '-error');
    var dist = num(SLUG + '-distance'), rooms = Math.round(num(SLUG + '-bedrooms'));
    var mode = $(SLUG + '-mode').value;
    if (isNaN(dist) || isNaN(rooms) || dist < 0 || rooms < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid distance and number of bedrooms.');
      return;
    }
    var M = MODELS[mode] || MODELS.full;
    var parts = [M.base, M.perMile * dist, M.perRoom * rooms];
    var mid = parts[0] + parts[1] + parts[2];
    var low = mid * 0.85, high = mid * 1.15;
    $(SLUG + '-low').textContent = money(low);
    $(SLUG + '-high').textContent = money(high);
    $(SLUG + '-mid').textContent = money(mid);
    $(SLUG + '-table').innerHTML =
      '<tr><th>Cost item</th><th>Estimate</th></tr>' +
      '<tr><td>' + M.labels[0] + '</td><td>' + money(parts[0]) + '</td></tr>' +
      '<tr><td>' + M.labels[1] + ' (' + dist.toLocaleString() + ' miles × $' + M.perMile.toFixed(2) + ')</td><td>' + money(parts[1]) + '</td></tr>' +
      '<tr><td>' + M.labels[2] + ' (' + rooms + ' bedrooms × $' + M.perRoom + ')</td><td>' + money(parts[2]) + '</td></tr>' +
      '<tr><td><b>Total</b></td><td><b>' + money(mid) + '</b></td></tr>';
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"], select[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) {
      els[i].addEventListener('input', calc);
      els[i].addEventListener('change', calc);
    }
    calc();
  } catch (e) { /* never throw on load */ }
})();