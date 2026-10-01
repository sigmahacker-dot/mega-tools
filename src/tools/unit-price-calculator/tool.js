(function () {
  'use strict';
  var ERR = 'unit-price-calculator-error';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }); } catch (e) { return '$' + (Math.round(n * 10000) / 10000); } }
  function calc() {
    if (!TN.el('unitprice-price1')) return;
    TN.clearErr(ERR);
    var items = [];
    for (var i = 1; i <= 3; i++) {
      var name = (TN.el('unitprice-name' + i).value || '').trim() || ('Product ' + i);
      var p = parseFloat(TN.el('unitprice-price' + i).value);
      var q = parseFloat(TN.el('unitprice-qty' + i).value);
      if (isNaN(p) && isNaN(q)) continue;
      if (!(p >= 0)) { TN.setErr(ERR, 'Enter a valid price (0 or more) for ' + name + '.'); return; }
      if (!(q > 0)) { TN.setErr(ERR, 'Enter a quantity greater than 0 for ' + name + '.'); return; }
      items.push({ name: name, p: p, q: q, u: p / q });
    }
    if (items.length < 2) { TN.setErr(ERR, 'Enter at least two products to compare.'); return; }
    var best = items[0];
    items.forEach(function (it) { if (it.u < best.u) best = it; });
    var rows = items.map(function (it) {
      var v = it === best ? '<strong>Best deal</strong>' : ('+' + Math.round((it.u / best.u - 1) * 100) + '%');
      return '<tr><td>' + esc(it.name) + '</td><td>$' + it.p.toFixed(2) + '</td><td>' + it.q + '</td><td>' + money(it.u) + '</td><td>' + v + '</td></tr>';
    });
    TN.el('unitprice-body').innerHTML = rows.join('');
    TN.el('unitprice-best').textContent = best.name;
    TN.el('unitprice-bestunit').textContent = money(best.u);
    TN.el('unitprice-count').textContent = items.length;
  }
  try {
    for (var i = 1; i <= 3; i++) { TN.on('unitprice-name' + i, 'input', calc); TN.on('unitprice-price' + i, 'input', calc); TN.on('unitprice-qty' + i, 'input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();