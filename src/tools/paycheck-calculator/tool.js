(function () {
  'use strict';
  var ERR = 'paycheck-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('pc-gross')) return;
    TN.clearErr(ERR);
    var gross = parseFloat(TN.el('pc-gross').value);
    var freq = parseInt(TN.el('pc-freq').value, 10);
    var fed = parseFloat(TN.el('pc-fed').value) || 0;
    var state = parseFloat(TN.el('pc-state').value) || 0;
    var fica = parseFloat(TN.el('pc-fica').value) || 0;
    var pre = parseFloat(TN.el('pc-pretax').value) || 0;
    var post = parseFloat(TN.el('pc-posttax').value) || 0;
    if (!(gross > 0)) { TN.setErr(ERR, 'Enter gross pay greater than 0.'); return; }
    if (fed < 0 || fed > 60 || state < 0 || state > 30 || fica < 0 || fica > 30) { TN.setErr(ERR, 'Check your tax rates — one looks out of range.'); return; }
    if (pre < 0 || post < 0) { TN.setErr(ERR, 'Deductions cannot be negative.'); return; }
    var taxable = Math.max(0, gross - pre);
    var tax = taxable * (fed + state + fica) / 100;
    var net = gross - tax - pre - post;
    if (net < 0) { TN.setErr(ERR, 'Deductions exceed gross pay — check your entries.'); return; }
    TN.el('pc-net').textContent = money(net);
    TN.el('pc-annual').textContent = money(net * freq);
    TN.el('pc-rate').textContent = ((tax + post) / gross * 100).toFixed(1) + '%';
    function r2(label, per) { return '<tr><td>' + label + '</td><td>' + money(per) + '</td><td>' + money(per * freq) + '</td></tr>'; }
    TN.el('pc-body').innerHTML =
      r2('Gross pay', gross) + r2('Taxes', tax) + r2('Pre-tax deductions', pre) + r2('Post-tax deductions', post) +
      '<tr><td><strong>Net pay</strong></td><td><strong>' + money(net) + '</strong></td><td><strong>' + money(net * freq) + '</strong></td></tr>';
  }
  try {
    TN.on('pc-freq', 'change', calc);
    ['pc-gross', 'pc-fed', 'pc-state', 'pc-fica', 'pc-pretax', 'pc-posttax'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();