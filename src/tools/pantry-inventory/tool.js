/* Pantry Inventory — items with quantities + expiry, expiring-soon highlight. */
(function () {
  'use strict';

  var SLUG = 'pantry-inventory';
  var KEY = 'tn-' + SLUG + '-items';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var d = new Date(dateStr + 'T00:00:00');
    return Math.round((d.getTime() - now.getTime()) / 86400000);
  }

  function render() {
    var items = load();
    TN.el(SLUG + '-count').textContent = '(' + items.length + ')';
    var list = TN.el(SLUG + '-list');
    if (!items.length) { list.innerHTML = '<p class="muted">Pantry is empty.</p>'; return; }
    items.sort(function (a, b) {
      var da = daysUntil(a.exp), db = daysUntil(b.exp);
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
    list.innerHTML = items.map(function (it) {
      var d = daysUntil(it.exp);
      var flag = '';
      var border = '';
      if (d !== null && d < 0) { flag = '🔴 expired ' + Math.abs(d) + 'd ago'; border = 'border-left:4px solid #e74c3c;'; }
      else if (d !== null && d <= 7) { flag = '🟡 ' + d + 'd left'; border = 'border-left:4px solid #f1c40f;'; }
      return '<div class="tool-card" style="margin:8px 0;' + border + '">' +
        '<strong>' + TN.esc(it.name) + '</strong> <span class="muted">— ' + it.qty + ' ' + TN.esc(it.unit) + '</span>' +
        (it.exp ? '<p class="muted" style="margin:2px 0">Expires: ' + TN.esc(it.exp) + (flag ? ' &nbsp;' + flag : '') + '</p>' : '') +
        '<div class="btn-row" style="margin-top:6px">' +
        '<button class="btn btn-sm btn-outline" data-inc="' + it.id + '">+1</button>' +
        '<button class="btn btn-sm btn-outline" data-dec="' + it.id + '">−1</button>' +
        '<button class="btn btn-sm btn-outline" data-del="' + it.id + '">Delete</button>' +
        '</div></div>';
    }).join('');
    var i, btns;
    btns = list.querySelectorAll('[data-inc]');
    for (i = 0; i < btns.length; i++) (function (b) {
      b.addEventListener('click', function () {
        var ms = load();
        var it = ms.filter(function (x) { return String(x.id) === b.getAttribute('data-inc'); })[0];
        if (it) { it.qty = Math.round((it.qty + 1) * 100) / 100; persist(ms); render(); }
      });
    })(btns[i]);
    btns = list.querySelectorAll('[data-dec]');
    for (i = 0; i < btns.length; i++) (function (b) {
      b.addEventListener('click', function () {
        var ms = load();
        var it = ms.filter(function (x) { return String(x.id) === b.getAttribute('data-dec'); })[0];
        if (it) { it.qty = Math.max(0, Math.round((it.qty - 1) * 100) / 100); persist(ms); render(); }
      });
    })(btns[i]);
    btns = list.querySelectorAll('[data-del]');
    for (i = 0; i < btns.length; i++) (function (b) {
      b.addEventListener('click', function () {
        persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
        render();
      });
    })(btns[i]);
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = TN.el(SLUG + '-name').value.trim();
    var qty = parseFloat(TN.el(SLUG + '-qty').value);
    var unit = TN.el(SLUG + '-unit').value;
    var exp = TN.el(SLUG + '-exp').value;
    if (!name) { TN.setErr(SLUG + '-error', 'Please enter an item name.'); return; }
    if (isNaN(qty) || qty < 0) { TN.setErr(SLUG + '-error', 'Quantity must be 0 or more.'); return; }
    var items = load();
    items.push({ id: Date.now(), name: name, qty: qty, unit: unit, exp: exp || '' });
    persist(items);
    TN.el(SLUG + '-name').value = '';
    TN.el(SLUG + '-qty').value = '1';
    TN.el(SLUG + '-exp').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();