(function () {
  'use strict';
  var ERR = 'budget-50-30-20-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('b50-income')) return;
    TN.clearErr(ERR);
    var inc = parseFloat(TN.el('b50-income').value);
    if (!(inc > 0)) { TN.setErr(ERR, 'Enter take-home pay greater than 0.'); return; }
    var needs = inc * 0.5, wants = inc * 0.3, save = inc * 0.2;
    TN.el('b50-needs').textContent = money(needs);
    TN.el('b50-wants').textContent = money(wants);
    TN.el('b50-save').textContent = money(save);
    var an = parseFloat(TN.el('b50-aneeds').value);
    var aw = parseFloat(TN.el('b50-awants').value);
    var as = parseFloat(TN.el('b50-asave').value);
    if ((isNaN(an) || an < 0) && TN.el('b50-aneeds').value !== '') { TN.setErr(ERR, 'Actual needs spending cannot be negative.'); return; }
    if ((isNaN(aw) || aw < 0) && TN.el('b50-awants').value !== '') { TN.setErr(ERR, 'Actual wants spending cannot be negative.'); return; }
    if ((isNaN(as) || as < 0) && TN.el('b50-asave').value !== '') { TN.setErr(ERR, 'Actual savings cannot be negative.'); return; }
    function diff(target, actual) {
      if (isNaN(actual)) return '–';
      var d = target - actual;
      var label = d >= 0 ? 'under by ' : 'over by ';
      return label + money(Math.abs(d));
    }
    function cell(x) { return isNaN(x) ? '–' : money(x); }
    TN.el('b50-body').innerHTML =
      '<tr><td>Needs (50%)</td><td>' + money(needs) + '</td><td>' + cell(an) + '</td><td>' + diff(needs, an) + '</td></tr>' +
      '<tr><td>Wants (30%)</td><td>' + money(wants) + '</td><td>' + cell(aw) + '</td><td>' + diff(wants, aw) + '</td></tr>' +
      '<tr><td>Savings (20%)</td><td>' + money(save) + '</td><td>' + cell(as) + '</td><td>' + (isNaN(as) ? '–' : (as >= save ? 'on track (+' + money(as - save) + ')' : 'short by ' + money(save - as))) + '</td></tr>';
  }
  try {
    ['b50-income', 'b50-aneeds', 'b50-awants', 'b50-asave'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();