/* Bill Due Tracker — recurring monthly bills, next due date, days remaining, sorted. */
(function () {
  'use strict';
  var SLUG = 'bill-due-tracker';
  var KEY = 'tn_bills_v1';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var bills = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      bills = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(bills)) bills = [];
    } catch (e) { bills = []; }
  }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(bills)); } catch (e) {} }

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

  function nextDue(day) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var y = today.getFullYear(), m = today.getMonth();
    var d = new Date(y, m, Math.min(day, daysInMonth(y, m)));
    if (d <= today) {
      m++;
      if (m > 11) { m = 0; y++; }
      d = new Date(y, m, Math.min(day, daysInMonth(y, m)));
    }
    return d;
  }

  function fmtDate(d) {
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  function render() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var rows = bills.map(function (b) {
      var due = nextDue(b.day);
      var days = Math.round((due.getTime() - today.getTime()) / 86400000);
      return { b: b, due: due, days: days };
    }).sort(function (a, b) { return a.days - b.days; });

    $('total').textContent = bills.length;
    $('duesoon').textContent = rows.filter(function (r) { return r.days <= 7; }).length;
    var sum = bills.reduce(function (a, b) { return a + (parseFloat(b.amount) || 0); }, 0);
    $('monthsum').textContent = bills.length ? sum.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—';

    if (!rows.length) {
      $('list').innerHTML = '<p class="muted" style="text-align:center">No bills yet — add your first one above.</p>';
      return;
    }
    var html = '';
    rows.forEach(function (r) {
      var color = r.days <= 3 ? '#c62828' : (r.days <= 7 ? '#ef6c00' : '#2e7d32');
      var urg = r.days === 0 ? 'due today' : r.days === 1 ? 'due tomorrow' : r.days + ' days left';
      html += '<div style="display:flex;align-items:center;gap:10px;border:1px solid #e0e0e0;border-left:5px solid ' + color + ';border-radius:8px;padding:8px 12px;margin-bottom:8px">' +
        '<div style="flex:1;min-width:0"><strong>' + esc(r.b.name) + '</strong>' +
        (r.b.amount !== '' ? ' · <span class="code">' + esc(r.b.amount) + '</span>' : '') +
        '<br><span class="muted">' + esc(fmtDate(r.due)) + '</span></div>' +
        '<div style="font-weight:700;color:' + color + ';white-space:nowrap">' + urg + '</div>' +
        '<button class="btn btn-outline bill-del" data-id="' + r.b.id + '" style="padding:4px 10px" aria-label="Delete bill">✕</button></div>';
    });
    $('list').innerHTML = html;
    TN.qsa('.bill-del', $('list')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        bills = bills.filter(function (b) { return String(b.id) !== btn.getAttribute('data-id'); });
        save(); render();
      });
    });
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = ($('name').value || '').trim();
    var amount = ($('amount').value || '').trim();
    var day = parseInt($('day').value, 10);
    if (!name) { TN.setErr(SLUG + '-error', 'Please enter the bill name.'); return; }
    if (!day || day < 1 || day > 31) { TN.setErr(SLUG + '-error', 'Due day must be between 1 and 31.'); return; }
    if (amount !== '' && (isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) { TN.setErr(SLUG + '-error', 'Please enter a valid amount (or leave it blank).'); return; }
    bills.push({ id: Date.now() + '' + Math.floor(Math.random() * 1000), name: name, amount: amount, day: day });
    $('name').value = ''; $('amount').value = ''; $('day').value = '';
    save(); render();
  }

  try {
    load(); render();
    TN.on(SLUG + '-add', 'click', add);
  } catch (e) { /* never throw on load */ }
})();
