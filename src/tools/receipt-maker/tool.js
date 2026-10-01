(function () {
  'use strict';
  var ERR = 'receipt-maker-error';
  function val(id) { var e = TN.el(id); return e ? e.value.trim() : ''; }
  function money(n) { return '$' + n.toFixed(2); }
  function itemRows() { return TN.qsa('#rcpt-items .rcpt-row'); }
  function addRow(name, qty, price) {
    var box = TN.el('rcpt-items');
    var d = document.createElement('div');
    d.className = 'rcpt-row';
    d.style.cssText = 'display:grid;grid-template-columns:1fr 70px 90px 34px;gap:8px;margin-bottom:8px;';
    d.innerHTML = '<input type="text" class="input rcpt-name" placeholder="Item name" value="">' +
      '<input type="number" class="input rcpt-qty" min="0" step="any" placeholder="Qty" value="">' +
      '<input type="number" class="input rcpt-price" min="0" step="any" placeholder="Price" value="">' +
      '<button type="button" class="btn btn-danger btn-sm rcpt-del" title="Remove">✕</button>';
    if (name) d.querySelector('.rcpt-name').value = name;
    if (qty) d.querySelector('.rcpt-qty').value = qty;
    if (price) d.querySelector('.rcpt-price').value = price;
    box.appendChild(d);
    d.querySelector('.rcpt-name').addEventListener('input', update);
    d.querySelector('.rcpt-qty').addEventListener('input', update);
    d.querySelector('.rcpt-price').addEventListener('input', update);
    d.querySelector('.rcpt-del').addEventListener('click', function () { d.remove(); update(); });
  }
  function getItems() {
    var out = [];
    itemRows().forEach(function (r) {
      var n = r.querySelector('.rcpt-name').value.trim();
      var q = parseFloat(r.querySelector('.rcpt-qty').value) || 0;
      var p = parseFloat(r.querySelector('.rcpt-price').value) || 0;
      if (n || q > 0 || p > 0) out.push({ name: n || 'Item', qty: q, price: p });
    });
    return out;
  }
  function totals() {
    var items = getItems();
    var sub = 0;
    items.forEach(function (i) { sub += i.qty * i.price; });
    var taxR = Math.min(100, Math.max(0, parseFloat(val('rcpt-tax')) || 0));
    var discR = Math.min(100, Math.max(0, parseFloat(val('rcpt-disc')) || 0));
    var tax = sub * taxR / 100;
    var disc = (sub + tax) * discR / 100;
    return { items: items, sub: sub, tax: tax, disc: disc, total: sub + tax - disc, taxR: taxR, discR: discR };
  }
  function center(s, w) {
    s = String(s);
    if (s.length >= w) return s;
    var l = Math.floor((w - s.length) / 2);
    return new Array(l + 1).join(' ') + s;
  }
  function build() {
    var t = totals();
    var W = 40, L = [];
    L.push(center(val('rcpt-biz') || 'RECEIPT', W));
    if (val('rcpt-addr')) L.push(center(val('rcpt-addr'), W));
    var now = new Date();
    L.push(center(now.toLocaleString(), W));
    if (val('rcpt-num')) L.push(center('Receipt #' + val('rcpt-num'), W));
    L.push(new Array(W + 1).join('-'));
    t.items.forEach(function (i) {
      var line = i.qty + ' x ' + i.name;
      var amt = money(i.qty * i.price);
      L.push(line.length + amt.length > W ? line + '\n' + new Array(W - amt.length + 1).join(' ') + amt
        : line + new Array(W - line.length - amt.length + 1).join(' ') + amt);
    });
    if (!t.items.length) L.push('(no items)');
    L.push(new Array(W + 1).join('-'));
    function row(label, v) { L.push(label + new Array(W - label.length - money(v).length + 1).join(' ') + money(v)); }
    row('Subtotal', t.sub);
    if (t.taxR) row('Tax (' + t.taxR + '%)', t.tax);
    if (t.discR) row('Discount (' + t.discR + '%)', -t.disc);
    row('TOTAL', t.total);
    L.push(new Array(W + 1).join('='));
    L.push(center('Paid by ' + val('rcpt-pay'), W));
    L.push(center('Thank you!', W));
    return { text: L.join('\n'), total: t.total, count: t.items.length };
  }
  function update() {
    if (!TN.el('rcpt-out')) return;
    TN.clearErr(ERR);
    TN.el('rcpt-out').value = build().text;
  }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  try {
    ['rcpt-biz', 'rcpt-addr', 'rcpt-tax', 'rcpt-disc', 'rcpt-pay', 'rcpt-num'].forEach(function (id) {
      TN.on(id, 'input', update); TN.on(id, 'change', update);
    });
    TN.on('rcpt-add', 'click', function () { addRow(); });
    TN.on('rcpt-dl', 'click', function () {
      var r = build();
      if (!r.count) { TN.setErr(ERR, 'Add at least one item to the receipt first.'); return; }
      TN.clearErr(ERR);
      var b = new Blob([r.text], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'receipt' + (val('rcpt-num') ? '-' + val('rcpt-num') : '') + '.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
    TN.on('rcpt-print', 'click', function () {
      var r = build();
      if (!r.count) { TN.setErr(ERR, 'Add at least one item to the receipt first.'); return; }
      TN.clearErr(ERR);
      var w = window.open('', '_blank', 'width=420,height=700');
      if (!w) { TN.setErr(ERR, 'Popup blocked — allow popups to print the receipt.'); return; }
      w.document.write('<!DOCTYPE html><html><head><title>Receipt</title><style>body{font-family:monospace;white-space:pre;max-width:380px;margin:20px auto}</style></head><body>' +
        escHtml(r.text) + '<scr' + 'ipt>window.onload=function(){window.print();}</scr' + 'ipt></body></html>');
      w.document.close();
    });
    addRow('Coffee', 2, 3.50);
    addRow('Sandwich', 1, 7.99);
    update();
  } catch (e) { /* never throw on load */ }
})();