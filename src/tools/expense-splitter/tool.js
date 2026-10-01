/* Expense Splitter — log expenses, compute minimal settle-up transactions. */
(function () {
  'use strict';

  var SLUG = 'expense-splitter';
  var KEY = 'tn-' + SLUG + '-expenses';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(expenses) {
    try { localStorage.setItem(KEY, JSON.stringify(expenses)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function names(s) {
    return s.split(',').map(function (n) { return n.trim(); }).filter(Boolean);
  }

  function render() {
    var expenses = load();
    var list = TN.el(SLUG + '-list');
    if (!expenses.length) { list.innerHTML = '<p class="muted">No expenses yet.</p>'; return; }
    list.innerHTML = expenses.slice().reverse().map(function (e) {
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>' + TN.esc(e.desc || 'Expense') + '</strong> — ' + e.amount.toFixed(2) +
        ' <span class="muted">paid by ' + TN.esc(e.payer) + ', shared by ' + TN.esc(e.for.join(', ')) + '</span>' +
        '<button class="btn btn-sm btn-outline" data-del="' + e.id + '" style="margin-left:8px">Delete</button></div>';
    }).join('');
    var dels = list.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
          render();
          TN.el(SLUG + '-result').innerHTML = '';
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var payer = TN.el(SLUG + '-payer').value.trim();
    var amount = parseFloat(TN.el(SLUG + '-amount').value);
    var forList = names(TN.el(SLUG + '-for').value);
    var desc = TN.el(SLUG + '-desc').value.trim();
    if (!payer) { TN.setErr(SLUG + '-error', 'Enter who paid.'); return; }
    if (isNaN(amount) || amount <= 0) { TN.setErr(SLUG + '-error', 'Enter a valid amount.'); return; }
    if (!forList.length) { TN.setErr(SLUG + '-error', 'Enter who shared the expense.'); return; }
    var expenses = load();
    expenses.push({ id: Date.now(), payer: payer, amount: amount, for: forList, desc: desc });
    persist(expenses);
    TN.el(SLUG + '-payer').value = '';
    TN.el(SLUG + '-amount').value = '';
    TN.el(SLUG + '-for').value = '';
    TN.el(SLUG + '-desc').value = '';
    render();
  }

  function settle() {
    TN.clearErr(SLUG + '-error');
    var expenses = load();
    var out = TN.el(SLUG + '-result');
    if (!expenses.length) { TN.setErr(SLUG + '-error', 'Add at least one expense first.'); return; }
    var balances = {};
    expenses.forEach(function (e) {
      var share = e.amount / e.for.length;
      e.for.forEach(function (p) {
        if (!(p in balances)) balances[p] = 0;
        balances[p] -= share;
      });
      if (!(e.payer in balances)) balances[e.payer] = 0;
      balances[e.payer] += e.amount;
    });
    var debtors = [], creditors = [];
    Object.keys(balances).forEach(function (p) {
      var b = Math.round(balances[p] * 100) / 100;
      if (b < -0.005) debtors.push({ name: p, amt: -b });
      else if (b > 0.005) creditors.push({ name: p, amt: b });
    });
    debtors.sort(function (a, b) { return b.amt - a.amt; });
    creditors.sort(function (a, b) { return b.amt - a.amt; });
    var transfers = [];
    var i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      var pay = Math.min(debtors[i].amt, creditors[j].amt);
      pay = Math.round(pay * 100) / 100;
      transfers.push({ from: debtors[i].name, to: creditors[j].name, amt: pay });
      debtors[i].amt = Math.round((debtors[i].amt - pay) * 100) / 100;
      creditors[j].amt = Math.round((creditors[j].amt - pay) * 100) / 100;
      if (debtors[i].amt < 0.005) i++;
      if (creditors[j].amt < 0.005) j++;
    }
    if (!transfers.length) {
      out.innerHTML = '<p>🎉 Everyone is already settled up!</p>';
      return;
    }
    out.innerHTML = '<p><strong>' + transfers.length + ' payment' + (transfers.length > 1 ? 's' : '') + ' to settle:</strong></p><ul>' +
      transfers.map(function (t) {
        return '<li>' + TN.esc(t.from) + ' → ' + TN.esc(t.to) + ': <strong>' + t.amt.toFixed(2) + '</strong></li>';
      }).join('') + '</ul>';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-calc', 'click', settle);
      TN.on(SLUG + '-clear', 'click', function () {
        if (!window.confirm('Delete all expenses?')) return;
        persist([]); render(); TN.el(SLUG + '-result').innerHTML = '';
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();