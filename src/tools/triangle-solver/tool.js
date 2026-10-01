(function () {
  'use strict';
  var P = 'triangle-solver-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function fmt(n) { if (!isFinite(n)) return '–'; return String(Number(n.toFixed(6))); }
  var RAD = Math.PI / 180;
  function blank(msg) {
    set('area', '–'); set('perim', '–'); set('type', '–');
    g('body').innerHTML = '<tr><td colspan="3" class="muted">' + (msg || 'Enter the known values to solve the triangle.') + '</td></tr>';
    set('steps', 'Angles are shown in degrees.');
  }
  function num(id) { var v = g(id).value; return v === '' ? NaN : parseFloat(v); }
  function calc() {
    if (!g('a')) return;
    TN.clearErr(ERR);
    var mode = g('mode').value;
    g('wc').style.display = mode === 'sss' ? '' : 'none';
    g('wang').style.display = mode === 'sas' ? '' : 'none';
    g('wa').style.display = '';
    var a, b, c, Cdeg;
    if (mode === 'sss') {
      a = num('a'); b = num('b'); c = num('c');
      if ([a, b, c].some(isNaN)) { blank(); return; }
      if (a <= 0 || b <= 0 || c <= 0) { TN.setErr(ERR, 'All sides must be positive.'); blank(); return; }
      if (!(a + b > c && a + c > b && b + c > a)) {
        TN.setErr(ERR, 'These sides cannot form a triangle: each side must be shorter than the sum of the other two.');
        blank('Invalid triangle — triangle inequality failed.'); return;
      }
    } else {
      a = num('a'); b = num('b'); Cdeg = num('ang');
      if ([a, b, Cdeg].some(isNaN)) { blank(); return; }
      if (a <= 0 || b <= 0) { TN.setErr(ERR, 'Sides a and b must be positive.'); blank(); return; }
      if (Cdeg <= 0 || Cdeg >= 180) { TN.setErr(ERR, 'The included angle must be between 0° and 180°.'); blank(); return; }
      c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(Cdeg * RAD));
    }
    var Adeg = Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))) / RAD;
    var Bdeg = Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c)))) / RAD;
    var Cdeg2 = 180 - Adeg - Bdeg;
    var s = (a + b + c) / 2;
    var area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
    var perim = a + b + c;
    set('area', fmt(area));
    set('perim', fmt(perim));
    var angs = [Adeg, Bdeg, Cdeg2];
    var type = angs.some(function (x) { return Math.abs(x - 90) < 1e-9; }) ? 'Right' :
      angs.some(function (x) { return x > 90; }) ? 'Obtuse' : 'Acute';
    if (Math.abs(a - b) < 1e-9 && Math.abs(b - c) < 1e-9) type += ', equilateral';
    else if (Math.abs(a - b) < 1e-9 || Math.abs(b - c) < 1e-9 || Math.abs(a - c) < 1e-9) type += ', isosceles';
    else type += ', scalene';
    set('type', type);
    var sides = [a, b, c], names = ['a', 'b', 'c'], html = '';
    for (var i = 0; i < 3; i++) {
      html += '<tr><td>' + names[i] + '</td><td>' + TN.esc(fmt(sides[i])) + '</td><td>' + TN.esc(fmt(angs[i])) + '°</td></tr>';
    }
    g('body').innerHTML = html;
    set('steps', mode === 'sss'
      ? 'Angles from the law of cosines, e.g. A = arccos((b² + c² − a²) / 2bc). Area by Heron\u2019s formula with s = ' + fmt(s) + '.'
      : 'c from the law of cosines: c² = a² + b² − 2ab·cos C. Remaining angles from the law of sines. Area = ½·a·b·sin C.');
  }
  try {
    TN.on(P + 'mode', 'change', calc);
    ['a', 'b', 'c', 'ang'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();
