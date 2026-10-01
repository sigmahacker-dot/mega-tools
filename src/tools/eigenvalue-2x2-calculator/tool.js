(function () {
  'use strict';
  var P = 'eigenvalue-2x2-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function fmt(x) {
    if (!isFinite(x)) return String(x);
    var r = parseFloat(x.toPrecision(10));
    return String(r);
  }
  function fmtC(re, im) {
    if (Math.abs(im) < 1e-9) return fmt(re);
    var s = fmt(re);
    s += (im >= 0 ? ' + ' : ' − ') + fmt(Math.abs(im)) + 'i';
    return s;
  }
  function num(id) {
    var v = parseFloat(g(id).value);
    if (isNaN(v)) throw new Error('Entry "' + id + '" must be a number.');
    return v;
  }
  function calc() {
    try {
      TN.clearErr(ERR);
      var a = num('a'), b = num('b'), c = num('c'), d = num('d');
      var tr = a + d, det = a * d - b * c;
      var disc = tr * tr - 4 * det;
      var steps = [];
      steps.push('<li>Trace tr(A) = a + d = ' + fmt(a) + ' + ' + fmt(d) + ' = <b>' + fmt(tr) + '</b>.</li>');
      steps.push('<li>Determinant det(A) = ad − bc = ' + fmt(a) + '·' + fmt(d) + ' − ' + fmt(b) + '·' + fmt(c) + ' = <b>' + fmt(det) + '</b>.</li>');
      steps.push('<li>Characteristic polynomial: det(A − λI) = λ² − tr·λ + det = <b>λ² − (' + fmt(tr) + ')λ + (' + fmt(det) + ') = 0</b>.</li>');
      steps.push('<li>Discriminant Δ = tr² − 4·det = ' + fmt(tr * tr) + ' − ' + fmt(4 * det) + ' = <b>' + fmt(disc) + '</b>.</li>');
      var l1, l2, complex = false, l1s, l2s;
      if (disc > 1e-12) {
        var sq = Math.sqrt(disc);
        l1 = (tr + sq) / 2; l2 = (tr - sq) / 2;
        l1s = fmt(l1); l2s = fmt(l2);
        steps.push('<li>Δ &gt; 0: two distinct real eigenvalues λ = (tr ± √Δ)/2 = (' + fmt(tr) + ' ± ' + fmt(sq) + ')/2.</li>');
        steps.push('<li>λ₁ = <b>' + l1s + '</b>, λ₂ = <b>' + l2s + '</b>.</li>');
      } else if (Math.abs(disc) <= 1e-12) {
        l1 = l2 = tr / 2;
        l1s = l2s = fmt(l1);
        steps.push('<li>Δ = 0: repeated eigenvalue λ = tr/2 = <b>' + l1s + '</b> (algebraic multiplicity 2).</li>');
      } else {
        complex = true;
        var re = tr / 2, im = Math.sqrt(-disc) / 2;
        l1s = fmtC(re, im); l2s = fmtC(re, -im);
        steps.push('<li>Δ &lt; 0: complex conjugate pair λ = (tr ± i√|Δ|)/2.</li>');
        steps.push('<li>λ₁ = <b>' + l1s + '</b>, λ₂ = <b>' + l2s + '</b>. Modulus |λ| = ' + fmt(Math.sqrt(re * re + im * im)) + '.</li>');
      }
      var plain = '';
      if (!complex) {
        [l1, l2].forEach(function (lam, ix) {
          // solve (A - lam I) v = 0
          var m11 = a - lam, m12 = b, m21 = c, m22 = d - lam;
          var v;
          if (Math.abs(m11) + Math.abs(m12) >= Math.abs(m21) + Math.abs(m22)) {
            v = [-m12, m11];
            if (Math.abs(v[0]) + Math.abs(v[1]) < 1e-12) v = [-m22, m21];
          } else {
            v = [-m22, m21];
            if (Math.abs(v[0]) + Math.abs(v[1]) < 1e-12) v = [-m12, m11];
          }
          var nrm = Math.hypot(v[0], v[1]);
          var vs = '[' + fmt(v[0] / nrm) + ', ' + fmt(v[1] / nrm) + ']';
          // verify A v = lam v
          var Av0 = a * v[0] + b * v[1], Av1 = c * v[0] + d * v[1];
          var lv0 = lam * v[0], lv1 = lam * v[1];
          var err = Math.hypot(Av0 - lv0, Av1 - lv1) / (nrm || 1);
          steps.push('<li>Eigenvector for λ' + (ix + 1) + ' = ' + fmt(lam) + ': solve (A − λI)v = 0 → v' + (ix + 1) + ' = <b>' + vs + '</b> (normalized). Check: A·v = [' + fmt(Av0 / nrm) + ', ' + fmt(Av1 / nrm) + '], λ·v = [' + fmt(lv0 / nrm) + ', ' + fmt(lv1 / nrm) + '], residual ' + fmt(err) + ' ✓.</li>');
          plain += 'lambda' + (ix + 1) + '=' + fmt(lam) + ' v' + (ix + 1) + '=' + vs + '\n';
        });
      } else {
        steps.push('<li>Eigenvectors for complex eigenvalues are complex; they are omitted — eigenvalues fully describe the rotation+scaling action.</li>');
      }
      TN.show(P + 'out');
      g('l1').textContent = l1s;
      g('l2').textContent = l2s;
      g('tr').textContent = fmt(tr);
      g('det').textContent = fmt(det);
      g('steps').innerHTML = '<ol>' + steps.join('') + '</ol>';
      g('copy').setAttribute('data-r', 'lambda1=' + l1s + '\nlambda2=' + l2s + '\ntrace=' + fmt(tr) + '\ndet=' + fmt(det) + '\n' + plain);
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    TN.on(P + 'calc', 'click', calc);
    TN.on(P + 'copy', 'click', function () {
      var r = g('copy').getAttribute('data-r');
      if (r) TN.copy(r);
    });
  } catch (e) { /* never throw on load */ }
})();
