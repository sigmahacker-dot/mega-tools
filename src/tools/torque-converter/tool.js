(function () {
  'use strict';
  var P = 'torque-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function lin(f) {
    return { to: function (v) { return v * f; }, from: function (b) { return b / f; } };
  }
  /* base unit: newton-meter */
  var UNITS = [
    { id: 'nm', name: 'Newton-meter (N·m)', short: 'N·m', c: lin(1) },
    { id: 'knm', name: 'Kilonewton-meter (kN·m)', short: 'kN·m', c: lin(1000) },
    { id: 'ftlb', name: 'Foot-pound (ft·lbf)', short: 'ft·lbf', c: lin(1.3558179483314004) },
    { id: 'inlb', name: 'Inch-pound (in·lbf)', short: 'in·lbf', c: lin(0.1129848250276167) },
    { id: 'kgm', name: 'Kilogram-force meter (kgf·m)', short: 'kgf·m', c: lin(9.80665) },
    { id: 'ozin', name: 'Ounce-force inch (ozf·in)', short: 'ozf·in', c: lin(0.0070615518) }
  ];
  function fmt(n) {
    if (!isFinite(n)) return '–';
    if (n === 0) return '0';
    if (Math.abs(n) >= 1e12 || Math.abs(n) < 1e-9) return n.toExponential(4);
    return String(parseFloat(n.toPrecision(8)));
  }
  function find(id) { for (var i = 0; i < UNITS.length; i++) if (UNITS[i].id === id) return UNITS[i]; return UNITS[0]; }
  function blank() {
    set('res', '–');
    g('body').innerHTML = '<tr><td colspan="2" class="muted">Enter a value to convert.</td></tr>';
  }
  function calc() {
    if (!g('val')) return;
    TN.clearErr(ERR);
    var raw = g('val').value;
    if (raw === '') { blank(); return; }
    var v = parseFloat(raw);
    if (isNaN(v)) { TN.setErr(ERR, 'Enter a valid number.'); blank(); return; }
    var base = find(g('from').value).c.to(v); /* N·m */
    var to = find(g('to').value);
    set('res', fmt(to.c.from(base)) + ' ' + to.short);
    var html = '';
    UNITS.forEach(function (u) {
      html += '<tr><td>' + TN.esc(u.name) + '</td><td>' + TN.esc(fmt(u.c.from(base))) + '</td></tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    var fs = g('from'), ts = g('to');
    UNITS.forEach(function (u) {
      var o1 = document.createElement('option'); o1.value = u.id; o1.textContent = u.name; fs.appendChild(o1);
      var o2 = document.createElement('option'); o2.value = u.id; o2.textContent = u.name; ts.appendChild(o2);
    });
    fs.value = 'nm'; ts.value = 'ftlb';
    TN.on(P + 'val', 'input', calc);
    TN.on(P + 'from', 'change', calc);
    TN.on(P + 'to', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
