(function () {
  'use strict';
  var S = 'invoice-generator';
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function esc(s) { try { return TN.esc(String(s == null ? '' : s)); } catch (e) { return ''; } }
  function addRow(desc, qty, rate) {
    try {
      var wrap = TN.el(S + '-items');
      var row = document.createElement('div');
      row.className = 'grid2 mt';
      row.innerHTML =
        '<div class="field"><label>Description</label><input class="input ' + S + '-d" type="text" value="' + esc(desc || '') + '" placeholder="Item description"></div>' +
        '<div class="row">' +
        '<div class="field"><label>Qty</label><input class="input ' + S + '-q" type="number" min="0" step="1" value="' + (qty == null ? 1 : qty) + '"></div>' +
        '<div class="field"><label>Rate</label><input class="input ' + S + '-r" type="number" min="0" step="0.01" value="' + (rate == null ? 0 : rate) + '"></div>' +
        '<div class="field"><label>&nbsp;</label><button class="btn btn-danger btn-sm ' + S + '-rm">Remove</button></div>' +
        '</div>';
      wrap.appendChild(row);
      row.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', update); });
      row.querySelector('.' + S + '-rm').addEventListener('click', function () { row.remove(); update(); });
    } catch (e) {}
  }
  function money(n, cur) {
    var v = (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return cur + ' ' + v;
  }
  function update() {
    try {
      TN.clearErr(S + '-error');
      var business = TN.el(S + '-business').value;
      var client = TN.el(S + '-client').value;
      var num = TN.el(S + '-number').value || 'INV-001';
      var date = TN.el(S + '-date').value;
      var taxPct = parseFloat(TN.el(S + '-tax').value);
      if (!(taxPct >= 0)) taxPct = 0;
      var cur = TN.el(S + '-currency').value || 'PKR';
      var notes = TN.el(S + '-notes').value;
      var rows = [];
      TN.qsa('.' + S + '-d').forEach(function (d, i) {
        var qs = TN.qsa('.' + S + '-q'), rs = TN.qsa('.' + S + '-r');
        var q = parseFloat(qs[i] ? qs[i].value : 0) || 0;
        var r = parseFloat(rs[i] ? rs[i].value : 0) || 0;
        rows.push({ d: d.value, q: q, r: r, total: q * r });
      });
      var sub = rows.reduce(function (a, b) { return a + b.total; }, 0);
      var tax = sub * taxPct / 100;
      var total = sub + tax;
      var itemHtml = rows.map(function (it) {
        return '<tr><td>' + esc(it.d || '—') + '</td><td style="text-align:right">' + it.q + '</td>' +
          '<td style="text-align:right">' + money(it.r, cur) + '</td>' +
          '<td style="text-align:right">' + money(it.total, cur) + '</td></tr>';
      }).join('');
      var html =
        '<div class="result" id="' + S + '-print-area">' +
        '<div class="row" style="justify-content:space-between;align-items:flex-start">' +
        '<div><h3 style="margin:0">' + esc(business || 'Your Business') + '</h3></div>' +
        '<div style="text-align:right"><strong>' + esc(num) + '</strong><br><span class="muted">' + esc(date || '') + '</span></div></div>' +
        '<p><strong>Bill to:</strong> ' + esc(client || 'Client') + '</p>' +
        '<table class="data"><thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>' +
        '<tbody>' + (itemHtml || '<tr><td colspan="4" class="muted">No items yet.</td></tr>') + '</tbody></table>' +
        '<div style="text-align:right;margin-top:8px">' +
        '<div>Subtotal: <strong>' + money(sub, cur) + '</strong></div>' +
        '<div>Tax (' + taxPct + '%): <strong>' + money(tax, cur) + '</strong></div>' +
        '<div style="font-size:1.2em">Total: <strong>' + money(total, cur) + '</strong></div></div>' +
        (notes ? '<p class="muted">' + esc(notes).replace(/\n/g, '<br>') + '</p>' : '') +
        '</div>';
      TN.el(S + '-preview').innerHTML = html;
    } catch (e) {}
  }
  on(S + '-add', 'click', function () { addRow('', 1, 0); update(); });
  ['business', 'client', 'number', 'date', 'tax', 'currency', 'notes'].forEach(function (k) {
    on(S + '-' + k, 'input', update);
    on(S + '-' + k, 'change', update);
  });
  on(S + '-print', 'click', function () {
    try {
      var rows = TN.qsa('.' + S + '-d');
      if (!rows.length) { TN.setErr(S + '-error', 'Add at least one item before printing.'); return; }
      document.body.classList.add(S + '-printing');
      window.print();
      setTimeout(function () { document.body.classList.remove(S + '-printing'); }, 500);
    } catch (e) {}
  });
  try {
    addRow('Service rendered', 1, 100);
    TN.el(S + '-date').value = new Date().toISOString().slice(0, 10);
    update();
  } catch (e) {}
})();
