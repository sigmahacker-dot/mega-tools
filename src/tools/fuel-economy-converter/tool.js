(function () {
  'use strict';
  var P = 'fuel-economy-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function recip(k) {
    return {
      to: function (v) { return v > 0 ? k / v : NaN; },
      from: function (b) { return b > 0 ? k / b : NaN; }
    };
  }
  /* base unit: litres per 100 km */
  var UNITS = [
    { id: 'l100', name: 'Litres per 100 km (L/100km)', short: 'L/100km', c: { to: function (v) { return v; }, from: function (b) { return b; } } },
    { id: 'kml', name: 'Kilometres per litre (km/L)', short: 'km/L', c: recip(100) },
    { id: 'mpgus', name: 'Miles per gallon, US (mpg)', short: 'mpg (US)', c: recip(235.214583) },
    { id: 'mpguk', name: 'Miles per gallon, UK (mpg)', short: 'mpg (UK)', c: recip(282.480936) },
    { id: 'mil', name: 'Miles per litre (mi/L)', short: 'mi/L', c: recip(62.1371192) }
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
    if (isNaN(v) || v < 0) { TN.setErr(ERR, 'Enter a non-negative number.'); blank(); return; }
    var base = find(g('from').value).c.to(v); /* L/100km */
    if (!isFinite(base) || base <= 0) { TN.setErr(ERR, 'The value must be greater than zero for these units.'); blank(); return; }
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
    fs.value = 'mpgus'; ts.value = 'l100';
    TN.on(P + 'val', 'input', calc);
    TN.on(P + 'from', 'change', calc);
    TN.on(P + 'to', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
