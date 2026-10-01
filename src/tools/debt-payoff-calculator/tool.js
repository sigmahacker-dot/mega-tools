(function () {
  'use strict';
  var ERR = 'debt-payoff-calculator-error';
  var MAX_ROWS = 8;
  function money(n) {
    try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch (e) { return '$' + String(Math.round(n * 100) / 100); }
  }
  function esc(s) { return TN.esc(s); }
  function rowCount() {
    return TN.qsa('#debt-rows .debt-row').length;
  }
  function addRow(name, bal, apr, min) {
    if (rowCount() >= MAX_ROWS) return;
    var wrap = TN.el('debt-rows');
    var idx = rowCount() + 1;
    var div = document.createElement('div');
    div.className = 'debt-row grid2';
    div.style.cssText = 'align-items:end;margin-bottom:12px;padding:12px;border:1px solid var(--border,#e5e7eb);border-radius:8px;';
    div.innerHTML =
      '<div class="field"><label>Debt name</label><input type="text" class="input debt-name" placeholder="Credit card" value="' + esc(name || '') + '"></div>' +
      '<div class="field"><label>Balance ($)</label><input type="number" class="input debt-bal" min="0" step="any" placeholder="5000" value="' + (bal || '') + '"></div>' +
      '<div class="field"><label>APR (%)</label><input type="number" class="input debt-apr" min="0" max="100" step="any" placeholder="19.99" value="' + (apr || '') + '"></div>' +
      '<div class="field"><label>Min payment ($)</label><input type="number" class="input debt-min" min="0" step="any" placeholder="150" value="' + (min || '') + '"></div>';
    if (idx > 1) {
      var btnWrap = document.createElement('div');
      btnWrap.className = 'field';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline';
      btn.textContent = 'Remove';
      btn.addEventListener('click', function () { wrap.removeChild(div); calc(); });
      btnWrap.appendChild(btn);
      div.appendChild(btnWrap);
    }
    wrap.appendChild(div);
    TN.qsa('input', div).forEach(function (inp) {
      inp.addEventListener('input', calc);
    });
  }
  function calc() {
    if (!TN.el('debt-rows')) return;
    TN.clearErr(ERR);
    var rows = TN.qsa('#debt-rows .debt-row');
    var debts = [];
    for (var k = 0; k < rows.length; k++) {
      var name = TN.qs('.debt-name', rows[k]).value.trim();
      var bal = parseFloat(TN.qs('.debt-bal', rows[k]).value);
      var apr = parseFloat(TN.qs('.debt-apr', rows[k]).value);
      var min = parseFloat(TN.qs('.debt-min', rows[k]).value);
      if (isNaN(bal) && isNaN(apr) && isNaN(min) && !name) continue; // empty row
      if (!(bal > 0)) { TN.setErr(ERR, 'Row ' + (k + 1) + ': enter a balance greater than 0.'); return; }
      if (isNaN(apr) || apr < 0 || apr > 100) { TN.setErr(ERR, 'Row ' + (k + 1) + ': enter an APR between 0 and 100.'); return; }
      if (!(min > 0)) { TN.setErr(ERR, 'Row ' + (k + 1) + ': enter a minimum payment greater than 0.'); return; }
      debts.push({ name: name || 'Debt ' + (debts.length + 1), bal: bal, apr: apr, min: min, payoffMonth: 0 });
    }
    if (debts.length === 0) {
      TN.el('debt-months').textContent = '–';
      TN.el('debt-interest').textContent = '–';
      TN.el('debt-first').textContent = '–';
      TN.el('debt-table-body').innerHTML = '<tr><td colspan="5" class="muted">Enter your debts above to build the payoff plan.</td></tr>';
      return;
    }
    var extra = parseFloat(TN.el('debt-extra').value);
    if (isNaN(extra) || extra < 0) { TN.setErr(ERR, 'Enter a valid extra monthly payment (0 or more).'); return; }

    var sim = debts.map(function (d) { return { name: d.name, bal: d.bal, apr: d.apr, min: d.min, payoffMonth: 0, startBal: d.bal }; });
    var budget = extra;
    sim.forEach(function (d) { budget += d.min; });
    var totalInterest = 0, month = 0, prevTotal = Infinity, done = false;
    while (month < 1200) {
      month++;
      var active = sim.filter(function (d) { return d.bal > 0; });
      if (active.length === 0) { done = true; break; }
      // accrue interest
      var mTotal = 0;
      active.forEach(function (d) {
        var i = d.bal * d.apr / 100 / 12;
        d.bal += i;
        totalInterest += i;
        mTotal += d.bal;
      });
      if (mTotal > prevTotal + 0.01 && month > 1) {
        TN.setErr(ERR, 'Payments do not cover the monthly interest — the total balance is growing. Increase minimum or extra payments.');
        return;
      }
      prevTotal = mTotal;
      // pay minimums
      var paid = 0;
      active.forEach(function (d) {
        var p = Math.min(d.min, d.bal);
        d.bal -= p;
        paid += p;
        if (d.bal <= 0.005) { d.bal = 0; if (!d.payoffMonth) d.payoffMonth = month; }
      });
      // avalanche: leftover to highest APR
      var leftover = budget - paid;
      var guard = 0;
      while (leftover > 0.005 && guard++ < 100) {
        var target = null;
        sim.forEach(function (d) {
          if (d.bal > 0 && (!target || d.apr > target.apr)) target = d;
        });
        if (!target) break;
        var p2 = Math.min(leftover, target.bal);
        target.bal -= p2;
        leftover -= p2;
        if (target.bal <= 0.005) { target.bal = 0; if (!target.payoffMonth) target.payoffMonth = month; }
      }
    }
    if (!done) { TN.setErr(ERR, 'This plan would take over 100 years — increase your payments.'); return; }

    var ordered = sim.slice().sort(function (a, b) { return a.payoffMonth - b.payoffMonth; });
    TN.el('debt-months').textContent = String(month);
    TN.el('debt-interest').textContent = money(totalInterest);
    TN.el('debt-first').textContent = ordered[0].name;
    TN.el('debt-table-body').innerHTML = ordered.map(function (d, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(d.name) + '</td><td>' + money(d.startBal) + '</td><td>' + d.apr + '%</td><td>Month ' + d.payoffMonth + '</td></tr>';
    }).join('');
  }
  try {
    addRow('', '', '', '');
    addRow('', '', '', '');
    TN.on('debt-add', 'click', function () {
      if (rowCount() >= MAX_ROWS) { TN.setErr(ERR, 'Maximum ' + MAX_ROWS + ' debts.'); return; }
      TN.clearErr(ERR);
      addRow('', '', '', '');
      calc();
    });
    TN.on('debt-extra', 'input', calc);
  } catch (e) { /* never throw on load */ }
})();
