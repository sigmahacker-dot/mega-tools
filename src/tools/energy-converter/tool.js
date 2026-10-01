(function () {
  'use strict';
  var P = 'energy-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function lin(f) {
    return { to: function (v) { return v * f; }, from: function (b) { return b / f; } };
  }
  /* base unit: joule */
  var UNITS = [
    { id: 'j', name: 'Joule (J)', short: 'J', c: lin(1) },
    { id: 'kj', name: 'Kilojoule (kJ)', short: 'kJ', c: lin(1000) },
    { id: 'cal', name: 'Calorie (cal)', short: 'cal', c: lin(4.184) },
    { id: 'kcal', name: 'Kilocalorie (kcal)', short: 'kcal', c: lin(4184) },
    { id: 'wh', name: 'Watt-hour (Wh)', short: 'Wh', c: lin(3600) },
    { id: 'kwh', name: 'Kilowatt-hour (kWh)', short: 'kWh', c: lin(3.6e6) },
    { id: 'btu', name: 'British thermal unit (BTU)', short: 'BTU', c: lin(1055.05585262) },
    { id: 'ev', name: 'Electronvolt (eV)', short: 'eV', c: lin(1.602176634e-19) },
    { id: 'ftlb', name: 'Foot-pound (ft·lbf)', short: 'ft·lbf', c: lin(1.3558179483314004) }
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
    var base = find(g('from').value).c.to(v); /* joules */
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
    fs.value = 'kwh'; ts.value = 'j';
    TN.on(P + 'val', 'input', calc);
    TN.on(P + 'from', 'change', calc);
    TN.on(P + 'to', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
