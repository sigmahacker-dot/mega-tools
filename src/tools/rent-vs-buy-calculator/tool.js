(function () {
  'use strict';
  var ERR = 'rent-vs-buy-calculator-error';
  function money(n) { try { return '$' + Math.round(n).toLocaleString('en-US'); } catch (e) { return '$' + Math.round(n); } }
  function calc() {
    if (!TN.el('rvb-rent')) return;
    TN.clearErr(ERR);
    var rent0 = parseFloat(TN.el('rvb-rent').value);
    var price = parseFloat(TN.el('rvb-price').value);
    var downPct = parseFloat(TN.el('rvb-down').value);
    var rate = parseFloat(TN.el('rvb-rate').value);
    var termY = parseInt(TN.el('rvb-term').value, 10);
    var years = parseInt(TN.el('rvb-years').value, 10);
    var appr = parseFloat(TN.el('rvb-appr').value);
    var rgrow = parseFloat(TN.el('rvb-rentgrow').value);
    if (!(rent0 >= 0)) { TN.setErr(ERR, 'Enter a valid monthly rent (0 or more).'); return; }
    if (!(price > 0)) { TN.setErr(ERR, 'Enter a home price greater than 0.'); return; }
    if (isNaN(downPct) || downPct < 0 || downPct > 100) { TN.setErr(ERR, 'Enter a down payment between 0 and 100%.'); return; }
    if (isNaN(rate) || rate < 0 || rate > 20) { TN.setErr(ERR, 'Enter a mortgage rate between 0 and 20%.'); return; }
    if (!(termY >= 1 && termY <= 50)) { TN.setErr(ERR, 'Enter a loan term between 1 and 50 years.'); return; }
    if (!(years >= 1 && years <= 30)) { TN.setErr(ERR, 'Enter a comparison period of 1–30 years.'); return; }
    if (isNaN(appr) || appr < -10 || appr > 20) { TN.setErr(ERR, 'Enter appreciation between −10 and 20%.'); return; }
    if (isNaN(rgrow) || rgrow < -10 || rgrow > 20) { TN.setErr(ERR, 'Enter rent growth between −10 and 20%.'); return; }
    var down = price * downPct / 100;
    var P = price - down;
    var r = rate / 100 / 12;
    var n = termY * 12;
    var M = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    var bal = P, homeVal = price, rentMo = rent0;
    var buyCum = down + price * 0.02, rentCum = 0, rows = [], breakeven = null;
    for (var y = 1; y <= years; y++) {
      for (var m = 0; m < 12 && bal > 0; m++) {
        var i = bal * r;
        var pmt = Math.min(M, bal + i);
        buyCum += pmt;
        bal -= (pmt - i);
        if (bal < 0.005) bal = 0;
      }
      buyCum += homeVal * 0.012;
      rentCum += rentMo * 12;
      homeVal *= (1 + appr / 100);
      rentMo *= (1 + rgrow / 100);
      var buyNet = buyCum - (homeVal - bal);
      var winner = buyNet < rentCum ? 'Buy' : 'Rent';
      if (breakeven === null && buyNet < rentCum) breakeven = y;
      rows.push('<tr><td>' + y + '</td><td>' + money(buyNet) + '</td><td>' + money(rentCum) + '</td><td>' + winner + '</td></tr>');
    }
    var finalBuy = buyCum - (homeVal - bal);
    var diff = rentCum - finalBuy;
    TN.el('rvb-verdict').textContent = diff > 0 ? 'Buying wins' : (diff < 0 ? 'Renting wins' : 'Tie');
    TN.el('rvb-breakeven').textContent = breakeven === null ? 'Never' : 'Year ' + breakeven;
    TN.el('rvb-diff-label').textContent = diff >= 0 ? 'Buying saves' : 'Renting saves';
    TN.el('rvb-diff').textContent = money(Math.abs(diff));
    TN.el('rvb-body').innerHTML = rows.join('');
  }
  try {
    ['rvb-rent', 'rvb-price', 'rvb-down', 'rvb-rate', 'rvb-term', 'rvb-years', 'rvb-appr', 'rvb-rentgrow'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();