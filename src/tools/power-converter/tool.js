(function () {
  'use strict';
  var P = 'power-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function lin(f) {
    return { to: function (v) { return v * f; }, from: function (b) { return b / f; } };
  }
  /* base unit: watt */
  var UNITS = [
    { id: 'w', name: 'Watt (W)', short: 'W', c: lin(1) },
    { id: 'kw', name: 'Kilowatt (kW)', short: 'kW', c: lin(1000) },
    { id: 'mw', name: 'Megawatt (MW)', short: 'MW', c: lin(1e6) },
    { id: 'hp', name: 'Horsepower, mechanical (hp)', short: 'hp', c: lin(745.69987158227022) },
    { id: 'hpm', name: 'Horsepower, metric (PS)', short: 'PS', c: lin(735.49875) },
    { id: 'btuh', name: 'BTU per hour (BTU/h)', short: 'BTU/h', c: lin(0.2930710701722222) },
    { id: 'ftlbs', name: 'Foot-pound per second (ft·lbf/s)', short: 'ft·lbf/s', c: lin(1.3558179483314004) },
    { id: 'dbm', name: 'Decibel-milliwatt (dBm)', short: 'dBm', c: {
      to: function (v) { return 0.001 * Math.pow(10, v / 10); },
      from: function (b) { return b > 0 ? 10 * Math.log10(b / 0.001) : NaN; }
    } }
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
    var fromU = find(g('from').value);
    var base = fromU.c.to(v); /* watts */
    if (!isFinite(base) || base < 0) { TN.setErr(ERR, 'Power must be a non-negative value.'); blank(); return; }
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
    fs.value = 'hp'; ts.value = 'kw';
    TN.on(P + 'val', 'input', calc);
    TN.on(P + 'from', 'change', calc);
    TN.on(P + 'to', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
