(function () {
  'use strict';
  var ERR = 'net-worth-calculator-error';
  function money(n) { var neg = n < 0; try { return (neg ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return (neg ? '−$' : '$') + (Math.round(Math.abs(n) * 100) / 100); } }
  function v(id) { var x = parseFloat(TN.el(id).value); return isNaN(x) ? 0 : x; }
  function calc() {
    if (!TN.el('nw-cash')) return;
    TN.clearErr(ERR);
    var assets = [['Cash & savings', v('nw-cash')], ['Investments', v('nw-invest')], ['Retirement accounts', v('nw-retire')], ['Home value', v('nw-home')], ['Vehicles & other', v('nw-vehicle')]];
    var debts = [['Mortgage', v('nw-mortgage')], ['Car loans', v('nw-carloan')], ['Student loans', v('nw-student')], ['Credit cards', v('nw-cards')], ['Other debt', v('nw-otherdebt')]];
    var bad = assets.concat(debts).some(function (p) { return p[1] < 0; });
    if (bad) { TN.setErr(ERR, 'Values cannot be negative.'); return; }
    var ta = 0, td = 0, rows = '';
    assets.forEach(function (p) { ta += p[1]; rows += '<tr><td>' + p[0] + ' (asset)</td><td>' + money(p[1]) + '</td></tr>'; });
    debts.forEach(function (p) { td += p[1]; rows += '<tr><td>' + p[0] + ' (liability)</td><td>' + money(p[1]) + '</td></tr>'; });
    var net = ta - td;
    TN.el('nw-net').textContent = money(net);
    TN.el('nw-assets').textContent = money(ta);
    TN.el('nw-debts').textContent = money(td);
    TN.el('nw-body').innerHTML = rows +
      '<tr><td><strong>Total assets</strong></td><td><strong>' + money(ta) + '</strong></td></tr>' +
      '<tr><td><strong>Total liabilities</strong></td><td><strong>' + money(td) + '</strong></td></tr>' +
      '<tr><td><strong>Net worth</strong></td><td><strong>' + money(net) + '</strong></td></tr>';
  }
  try {
    ['nw-cash', 'nw-invest', 'nw-retire', 'nw-home', 'nw-vehicle', 'nw-mortgage', 'nw-carloan', 'nw-student', 'nw-cards', 'nw-otherdebt'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();