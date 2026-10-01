(function () {
  'use strict';
  var ERR = 'quadratic-equation-solver-error';

  function fmt(v) {
    if (!isFinite(v)) return '–';
    if (Math.abs(v) < 1e-12) v = 0;
    return parseFloat(v.toPrecision(10)).toString();
  }

  function fmtCoef(v) {
    var s = fmt(v);
    if (s === '1') return '';
    if (s === '-1') return '-';
    return s;
  }

  function solve() {
    TN.clearErr(ERR);
    try {
      var a = Number(TN.el('quadratic-equation-solver-a').value);
      var b = Number(TN.el('quadratic-equation-solver-b').value);
      var c = Number(TN.el('quadratic-equation-solver-c').value);
      if (!isFinite(a) || !isFinite(b) || !isFinite(c)) throw new Error('Enter numeric coefficients.');
      if (a === 0) throw new Error('a = 0 is not quadratic — it is the linear equation bx + c = 0.');

      var D = b * b - 4 * a * c;
      var r1s, r2s, nature, factored;
      if (D > 0) {
        var sq = Math.sqrt(D);
        var r1 = (-b + sq) / (2 * a);
        var r2 = (-b - sq) / (2 * a);
        r1s = fmt(r1); r2s = fmt(r2);
        nature = 'Two distinct real roots';
        factored = fmtCoef(a) + '(x ' + (r1 < 0 ? '+ ' + fmt(-r1) : '− ' + fmt(r1)) + ')(x ' +
          (r2 < 0 ? '+ ' + fmt(-r2) : '− ' + fmt(r2)) + ')';
      } else if (Math.abs(D) < 1e-12 || D === 0) {
        var r = -b / (2 * a);
        r1s = fmt(r); r2s = fmt(r);
        nature = 'One repeated real root';
        factored = fmtCoef(a) + '(x ' + (r < 0 ? '+ ' + fmt(-r) : '− ' + fmt(r)) + ')²';
      } else {
        var re = -b / (2 * a);
        var im = Math.sqrt(-D) / (2 * a);
        r1s = fmt(re) + ' + ' + fmt(im) + 'i';
        r2s = fmt(re) + ' − ' + fmt(im) + 'i';
        nature = 'Two complex conjugate roots';
        factored = fmtCoef(a) + '(x − (' + fmt(re) + ' + ' + fmt(im) + 'i))(x − (' + fmt(re) + ' − ' + fmt(im) + 'i))';
      }

      var h = -b / (2 * a);
      var k = a * h * h + b * h + c;

      TN.el('quadratic-equation-solver-root1').textContent = r1s;
      TN.el('quadratic-equation-solver-root2').textContent = r2s;
      TN.el('quadratic-equation-solver-disc').textContent = fmt(D);
      TN.el('quadratic-equation-solver-nature').textContent = nature;
      TN.el('quadratic-equation-solver-vertex').textContent = '(' + fmt(h) + ', ' + fmt(k) + ')';
      TN.el('quadratic-equation-solver-axis').textContent = 'x = ' + fmt(h);
      TN.el('quadratic-equation-solver-factored').textContent = factored;
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('quadratic-equation-solver-go', 'click', solve);
  } catch (e) { /* never throw on load */ }
})();
