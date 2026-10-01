(function () {
  'use strict';
  var P = 'warranty-expiry-tracker-', ERR = P + 'error', LS = 'tn-warranty-expiry-tracker';
  var DAY = 86400000;
  var items = [];
  function g(id) { return TN.el(P + id); }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      items = raw ? JSON.parse(raw) : [];
    } catch (e) { items = []; }
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(items)); } catch (e) { /* unavailable */ }
  }
  function pdate(s) { var p = s.split('-'); return new Date(p[0], p[1] - 1, p[2]); }
  function dstr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function expiry(it) {
    var d = pdate(it.date);
    d.setMonth(d.getMonth() + (it.unit === 'y' ? it.len * 12 : it.len));
    return d;
  }
  function render() {
    var body = g('list'), t = today();
    if (!items.length) { body.innerHTML = '<tr><td colspan="6" class="muted">No products yet — add your first one above.</td></tr>'; return; }
    var rows = items.map(function (it, i) {
      var ex = expiry(it);
      var days = Math.round((ex - t) / DAY);
      return { it: it, i: i, ex: ex, days: days };
    }).sort(function (a, b) { return a.days - b.days; });
    body.innerHTML = rows.map(function (r) {
      var st, color;
      if (r.days < 0) { st = 'Expired ' + (-r.days) + 'd ago'; color = '#f87171'; }
      else if (r.days === 0) { st = 'Expires TODAY'; color = '#fbbf24'; }
      else if (r.days <= 90) { st = r.days + ' days left'; color = '#fbbf24'; }
      else { st = r.days + ' days left'; color = '#4ade80'; }
      var w = r.it.len + ' ' + (r.it.unit === 'y' ? (r.it.len === 1 ? 'year' : 'years') : (r.it.len === 1 ? 'month' : 'months'));
      return '<tr><td><b>' + TN.esc(r.it.name) + '</b></td><td>' + TN.esc(r.it.date) + '</td><td>' + w + '</td><td>' + dstr(r.ex) + '</td>' +
        '<td style="color:' + color + ';font-weight:bold">' + st + '</td>' +
        '<td><button type="button" class="btn btn-outline btn-sm" data-del="' + r.i + '">✕</button></td></tr>';
    }).join('');
    var dels = body.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        TN.on(b, 'click', function () {
          items.splice(parseInt(b.getAttribute('data-del'), 10), 1);
          save(); render();
        });
      })(dels[i]);
    }
  }
  try {
    if (!TN.el(P + 'add')) return;
    load(); render();
    TN.on(P + 'add', 'click', function () {
      TN.clearErr(ERR);
      var name = g('name').value.trim(), dv = g('date').value;
      var len = parseInt(g('len').value, 10), unit = g('unit').value;
      if (!name) { TN.setErr(ERR, 'Name the product.'); return; }
      if (!dv) { TN.setErr(ERR, 'Pick the purchase date.'); return; }
      if (pdate(dv) > today()) { TN.setErr(ERR, 'Purchase date cannot be in the future.'); return; }
      if (isNaN(len) || len < 1 || len > 120) { TN.setErr(ERR, 'Warranty length must be 1–120.'); return; }
      items.push({ name: name, date: dv, len: len, unit: unit });
      g('name').value = '';
      save(); render();
    });
  } catch (e) { /* never throw on load */ }
})();
