(function () {
  'use strict';
  var P = 'volume-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  /* factor: how many cubic meters one unit equals */
  var UNITS = [
    { id: 'm3', name: 'Cubic meter (m³)', short: 'm³', toBase: 1 },
    { id: 'l', name: 'Litre (L)', short: 'L', toBase: 0.001 },
    { id: 'ml', name: 'Millilitre (mL)', short: 'mL', toBase: 1e-6 },
    { id: 'ft3', name: 'Cubic foot (ft³)', short: 'ft³', toBase: 0.028316846592 },
    { id: 'in3', name: 'Cubic inch (in³)', short: 'in³', toBase: 1.6387064e-5 },
    { id: 'gal', name: 'US gallon (gal)', short: 'gal', toBase: 0.003785411784 },
    { id: 'qt', name: 'US quart (qt)', short: 'qt', toBase: 0.000946352946 },
    { id: 'pt', name: 'US pint (pt)', short: 'pt', toBase: 0.000473176473 },
    { id: 'cup', name: 'US cup', short: 'cup', toBase: 0.0002365882365 },
    { id: 'floz', name: 'US fluid ounce (fl oz)', short: 'fl oz', toBase: 2.95735295625e-5 },
    { id: 'tbsp', name: 'US tablespoon (tbsp)', short: 'tbsp', toBase: 1.478676478125e-5 },
    { id: 'tsp', name: 'US teaspoon (tsp)', short: 'tsp', toBase: 4.92892159375e-6 }
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
    var base = v * find(g('from').value).toBase; /* cubic meters */
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
    fs.value = 'l'; ts.value = 'gal';
    TN.on(P + 'val', 'input', calc);
    TN.on(P + 'from', 'change', calc);
    TN.on(P + 'to', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
