(function () {
  'use strict';
  var P = 'pressure-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  /* factor: how many pascals one unit equals */
  var UNITS = [
    { id: 'pa', name: 'Pascal (Pa)', short: 'Pa', toBase: 1 },
    { id: 'kpa', name: 'Kilopascal (kPa)', short: 'kPa', toBase: 1000 },
    { id: 'mpa', name: 'Megapascal (MPa)', short: 'MPa', toBase: 1e6 },
    { id: 'bar', name: 'Bar (bar)', short: 'bar', toBase: 1e5 },
    { id: 'mbar', name: 'Millibar (mbar)', short: 'mbar', toBase: 100 },
    { id: 'psi', name: 'Pounds per sq. inch (psi)', short: 'psi', toBase: 6894.757293178 },
    { id: 'atm', name: 'Atmosphere (atm)', short: 'atm', toBase: 101325 },
    { id: 'mmhg', name: 'Millimetres of mercury (mmHg)', short: 'mmHg', toBase: 133.322387415 },
    { id: 'torr', name: 'Torr (torr)', short: 'torr', toBase: 133.32236842105263 },
    { id: 'inhg', name: 'Inches of mercury (inHg)', short: 'inHg', toBase: 3386.389 }
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
    var base = v * find(g('from').value).toBase; /* pascals */
    var to = find(g('to').value);
    set('res', fmt(base / to.toBase) + ' ' + to.short);
    var html = '';
    UNITS.forEach(function (u) {
      html += '<tr><td>' + TN.esc(u.name) + '</td><td>' + TN.esc(fmt(base / u.toBase)) + '</td></tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    var fs = g('from'), ts = g('to');
    UNITS.forEach(function (u) {
      var o1 = document.createElement('option'); o1.value = u.id; o1.textContent = u.name; fs.appendChild(o1);
      var o2 = document.createElement('option'); o2.value = u.id; o2.textContent = u.name; ts.appendChild(o2);
    });
    fs.value = 'bar'; ts.value = 'psi';
    TN.on(P + 'val', 'input', calc);
    TN.on(P + 'from', 'change', calc);
    TN.on(P + 'to', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
