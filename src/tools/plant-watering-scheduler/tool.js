(function () {
  'use strict';
  var P = 'plant-watering-scheduler-', ERR = P + 'error', LS = 'tn-plant-watering-scheduler';
  var DAY = 86400000;
  var plants = [];
  function g(id) { return TN.el(P + id); }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      plants = raw ? JSON.parse(raw) : [];
    } catch (e) { plants = []; }
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(plants)); } catch (e) { /* unavailable */ }
  }
  function dstr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function pdate(s) { var p = s.split('-'); return new Date(p[0], p[1] - 1, p[2]); }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function render() {
    var body = g('list'), t = today();
    if (!plants.length) { body.innerHTML = '<tr><td colspan="6" class="muted">No plants yet — add your first one above.</td></tr>'; return; }
    var rows = plants.map(function (pl, i) {
      var due = new Date(pdate(pl.last).getTime() + pl.interval * DAY);
      var diff = Math.round((due - t) / DAY);
      return { pl: pl, i: i, due: due, diff: diff };
    }).sort(function (a, b) { return a.diff - b.diff; });
    body.innerHTML = rows.map(function (r) {
      var st, color;
      if (r.diff < 0) { st = 'Overdue by ' + (-r.diff) + 'd'; color = '#f87171'; }
      else if (r.diff === 0) { st = 'Due today'; color = '#fbbf24'; }
      else { st = 'In ' + r.diff + 'd'; color = '#4ade80'; }
      return '<tr><td><b>' + TN.esc(r.pl.name) + '</b></td><td>' + r.pl.interval + 'd</td><td>' + TN.esc(r.pl.last) + '</td><td>' + dstr(r.due) + '</td>' +
        '<td style="color:' + color + ';font-weight:bold">' + st + '</td>' +
        '<td><div class="btn-row"><button type="button" class="btn btn-outline btn-sm" data-water="' + r.i + '">Watered</button>' +
        '<button type="button" class="btn btn-outline btn-sm" data-del="' + r.i + '">✕</button></div></td></tr>';
    }).join('');
    function wire(attr, fn) {
      var els = body.querySelectorAll('[' + attr + ']');
      for (var i = 0; i < els.length; i++) {
        (function (b) {
          TN.on(b, 'click', function () { fn(parseInt(b.getAttribute(attr), 10)); });
        })(els[i]);
      }
    }
    wire('data-water', function (i) { plants[i].last = dstr(today()); save(); render(); });
    wire('data-del', function (i) { plants.splice(i, 1); save(); render(); });
  }
  try {
    if (!TN.el(P + 'add')) return;
    load(); render();
    var n = new Date();
    g('last').value = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
    TN.on(P + 'add', 'click', function () {
      TN.clearErr(ERR);
      var name = g('name').value.trim();
      var interval = parseInt(g('interval').value, 10);
      var last = g('last').value;
      if (!name) { TN.setErr(ERR, 'Give the plant a name.'); return; }
      if (isNaN(interval) || interval < 1 || interval > 365) { TN.setErr(ERR, 'Interval must be 1–365 days.'); return; }
      if (!last) { TN.setErr(ERR, 'Pick the last-watered date.'); return; }
      if (pdate(last) > today()) { TN.setErr(ERR, 'Last-watered cannot be in the future.'); return; }
      plants.push({ name: name, interval: interval, last: last });
      g('name').value = '';
      save(); render();
    });
  } catch (e) { /* never throw on load */ }
})();
