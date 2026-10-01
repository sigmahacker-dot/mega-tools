(function () {
  'use strict';
  var ERR = 'pythagorean-calculator-error';

  function fmt(v) {
    if (!isFinite(v)) return '–';
    return parseFloat(v.toPrecision(10)).toString();
  }

  function read(id) {
    var el = TN.el(id);
    var s = el ? el.value.trim() : '';
    if (s === '') return null;
    var v = Number(s);
    if (!isFinite(v)) throw new Error('Sides must be numbers.');
    if (v <= 0) throw new Error('Sides must be positive.');
    return v;
  }

  function solve() {
    TN.clearErr(ERR);
    try {
      var a = read('pythagorean-calculator-a');
      var b = read('pythagorean-calculator-b');
      var c = read('pythagorean-calculator-c');
      var given = [a, b, c].filter(function (v) { return v !== null; }).length;
      if (given !== 2) throw new Error('Enter exactly two sides — leave the unknown one blank.');
      var missing;
      if (a === null) {
        if (c <= b) throw new Error('Hypotenuse c must be longer than leg b.');
        a = Math.sqrt(c * c - b * b);
        missing = 'a = ' + fmt(a);
      } else if (b === null) {
        if (c <= a) throw new Error('Hypotenuse c must be longer than leg a.');
        b = Math.sqrt(c * c - a * a);
        missing = 'b = ' + fmt(b);
      } else {
        c = Math.sqrt(a * a + b * b);
        missing = 'c = ' + fmt(c);
      }
      var area = (a * b) / 2;
      var perim = a + b + c;
      var angA = Math.atan(a / b) * 180 / Math.PI;
      var angB = 90 - angA;

      TN.el('pythagorean-calculator-side').textContent = missing;
      TN.el('pythagorean-calculator-area').textContent = fmt(area);
      TN.el('pythagorean-calculator-perim').textContent = fmt(perim);
      TN.el('pythagorean-calculator-sides').textContent = 'a = ' + fmt(a) + ', b = ' + fmt(b) + ', c = ' + fmt(c);
      TN.el('pythagorean-calculator-angA').textContent = fmt(angA) + '°';
      TN.el('pythagorean-calculator-angB').textContent = fmt(angB) + '°';
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('pythagorean-calculator-go', 'click', solve);
  } catch (e) { /* never throw on load */ }
})();
