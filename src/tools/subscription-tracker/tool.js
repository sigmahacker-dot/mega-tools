(function () {
  'use strict';
  var ERR = 'subscription-tracker-error';
  var KEY = 'tn_subscriptions';
  var subs = [];
  var FACTOR = { weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(subs)); } catch (e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) subs = JSON.parse(raw) || [];
    } catch (e) { subs = []; }
  }
  function daysUntil(dateStr) {
    if (!dateStr) return null;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    return Math.round((d - now) / 86400000);
  }
  function render() {
    var monthly = 0;
    subs.forEach(function (s) { monthly += (s.cost || 0) * (FACTOR[s.cycle] || 1); });
    TN.el('sub-monthly').textContent = money(monthly);
    TN.el('sub-yearly').textContent = money(monthly * 12);
    TN.el('sub-count').textContent = subs.length;
    var sorted = subs.map(function (s, i) { return { s: s, i: i }; });
    sorted.sort(function (a, b) {
      var da = daysUntil(a.s.renew), db = daysUntil(b.s.renew);
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
    TN.el('sub-body').innerHTML = sorted.map(function (w) {
      var s = w.s, i = w.i;
      var meq = (s.cost || 0) * (FACTOR[s.cycle] || 1);
      var d = daysUntil(s.renew), renewTxt, color = '';
      if (d === null) { renewTxt = '<span class="muted">—</span>'; }
      else if (d < 0) { renewTxt = Math.abs(d) + 'd overdue'; color = 'color:#f87171'; }
      else if (d === 0) { renewTxt = 'today'; color = 'color:#fcd34d'; }
      else { renewTxt = d + ' day' + (d === 1 ? '' : 's'); if (d <= 7) color = 'color:#fcd34d'; }
      return '<tr><td><strong>' + esc(s.name) + '</strong></td><td>' + money(s.cost || 0) + '</td>' +
        '<td>' + esc(s.cycle) + '</td><td>' + money(meq) + '/mo</td>' +
        '<td style="' + color + '">' + renewTxt + '</td>' +
        '<td style="text-align:right"><button type="button" class="btn btn-danger btn-sm sub-del" data-i="' + i + '">✕</button></td></tr>';
    }).join('') || '<tr><td colspan="6" class="muted">No subscriptions yet — add your first one above.</td></tr>';
    TN.qsa('#sub-body .sub-del').forEach(function (b) {
      b.addEventListener('click', function () {
        subs.splice(parseInt(b.getAttribute('data-i'), 10), 1);
        save(); render();
      });
    });
  }
  try {
    load(); render();
    TN.on('sub-add', 'click', function () {
      TN.clearErr(ERR);
      var name = TN.el('sub-name').value.trim();
      var cost = parseFloat(TN.el('sub-cost').value);
      if (!name) { TN.setErr(ERR, 'Enter the service name.'); return; }
      if (!(cost >= 0)) { TN.setErr(ERR, 'Enter a valid cost (0 or more).'); return; }
      subs.push({ name: name, cost: cost, cycle: TN.el('sub-cycle').value, renew: TN.el('sub-renew').value });
      TN.el('sub-name').value = ''; TN.el('sub-cost').value = ''; TN.el('sub-renew').value = '';
      save(); render();
    });
  } catch (e) { /* never throw on load */ }
})();