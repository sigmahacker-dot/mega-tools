(function () {
  'use strict';
  var P = 'birthday-reminder-list-', ERR = P + 'error', LS = 'tn-birthday-reminder-list';
  var DAY = 86400000;
  var people = [];
  function g(id) { return TN.el(P + id); }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      people = raw ? JSON.parse(raw) : [];
    } catch (e) { people = []; }
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(people)); } catch (e) { /* unavailable */ }
  }
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function nextBday(m, d) {
    var t = today(), y = t.getFullYear();
    function mk(yy) {
      var dd = d;
      if (m === 2 && d === 29 && !isLeap(yy)) dd = 28;
      return new Date(yy, m - 1, dd);
    }
    var c = mk(y);
    if (c < t) c = mk(y + 1);
    return c;
  }
  function dstr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function render() {
    var body = g('list'), t = today();
    if (!people.length) {
      body.innerHTML = '<tr><td colspan="5" class="muted">No birthdays yet — add someone above.</td></tr>';
      TN.hide(P + 'next');
      return;
    }
    var rows = people.map(function (p, i) {
      var dp = p.date.split('-');
      var m = parseInt(dp[1], 10), d = parseInt(dp[2], 10), by = parseInt(dp[0], 10);
      var nb = nextBday(m, d);
      var days = Math.round((nb - t) / DAY);
      return { p: p, i: i, nb: nb, days: days, age: nb.getFullYear() - by };
    }).sort(function (a, b) { return a.days - b.days; });
    body.innerHTML = rows.map(function (r) {
      var dp = r.p.date.split('-');
      var bd = dp[2] + '/' + dp[1];
      var inStr = r.days === 0 ? '<b style="color:#fbbf24">TODAY!</b>' : 'in ' + r.days + 'd';
      return '<tr><td><b>' + TN.esc(r.p.name) + '</b></td><td>' + bd + '</td><td>' + r.age + '</td><td>' + inStr + '</td>' +
        '<td><button type="button" class="btn btn-outline btn-sm" data-del="' + r.i + '">✕</button></td></tr>';
    }).join('');
    var dels = body.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        TN.on(b, 'click', function () {
          people.splice(parseInt(b.getAttribute('data-del'), 10), 1);
          save(); render();
        });
      })(dels[i]);
    }
    var r0 = rows[0];
    TN.show(P + 'next');
    g('who').textContent = r0.p.name;
    g('when').textContent = dstr(r0.nb);
    g('count').textContent = r0.days === 0 ? 'Today!' : String(r0.days);
  }
  try {
    if (!TN.el(P + 'add')) return;
    load(); render();
    TN.on(P + 'add', 'click', function () {
      TN.clearErr(ERR);
      var name = g('name').value.trim(), dv = g('date').value;
      if (!name) { TN.setErr(ERR, 'Enter a name.'); return; }
      if (!dv) { TN.setErr(ERR, 'Pick a birth date.'); return; }
      if (new Date(dv + 'T00:00') > today()) { TN.setErr(ERR, 'Birth date cannot be in the future.'); return; }
      people.push({ name: name, date: dv });
      g('name').value = '';
      save(); render();
    });
  } catch (e) { /* never throw on load */ }
})();
