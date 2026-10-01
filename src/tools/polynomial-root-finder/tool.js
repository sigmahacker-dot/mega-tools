(function () {
  'use strict';
  var P = 'polynomial-root-finder-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  // complex helpers
  function C(re, im) { return { re: re, im: im }; }
  function cadd(a, b) { return C(a.re + b.re, a.im + b.im); }
  function csub(a, b) { return C(a.re - b.re, a.im - b.im); }
  function cmul(a, b) { return C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function cdiv(a, b) {
    var d = b.re * b.re + b.im * b.im;
    return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
  }
  function cabs(a) { return Math.hypot(a.re, a.im); }
  function cfmt(z) {
    function f(x) { return String(parseFloat(x.toPrecision(10))); }
    if (Math.abs(z.im) < 5e-10) return f(z.re);
    if (Math.abs(z.re) < 5e-10) return f(z.im) + 'i';
    return f(z.re) + (z.im >= 0 ? ' + ' : ' − ') + f(Math.abs(z.im)) + 'i';
  }
  function peval(coeffs, z) { // Horner with complex z
    var r = C(0, 0);
    for (var i = 0; i < coeffs.length; i++) r = cadd(cmul(r, z), C(coeffs[i], 0));
    return r;
  }
  function durandKerner(coeffs) {
    var n = coeffs.length - 1;
    var roots = [];
    for (var i = 0; i < n; i++) {
      var ang = 2 * Math.PI * i / n;
      roots.push(C(0.4 * Math.cos(ang), 0.4 * Math.sin(ang)));
    }
    var iter = 0, maxChange = Infinity;
    while (iter < 500 && maxChange > 1e-12) {
      maxChange = 0;
      var next = [];
      for (i = 0; i < n; i++) {
        var denom = C(1, 0);
        for (var j = 0; j < n; j++) if (j !== i) denom = cmul(denom, csub(roots[i], roots[j]));
        var delta = cdiv(peval(coeffs, roots[i]), denom);
        var nr = csub(roots[i], delta);
        var ch = cabs(csub(nr, roots[i]));
        if (ch > maxChange) maxChange = ch;
        next.push(nr);
      }
      roots = next;
      iter++;
    }
    return { roots: roots, iter: iter, converged: maxChange <= 1e-12 };
  }
  function polyStr(coeffs) {
    var n = coeffs.length - 1, parts = [];
    for (var i = 0; i <= n; i++) {
      var c = coeffs[i], p = n - i;
      if (Math.abs(c) < 1e-12) continue;
      var mag = Math.abs(c);
      var term = (mag === 1 && p > 0) ? '' : String(parseFloat(mag.toPrecision(10)));
      if (p > 1) term += 'x^' + p; else if (p === 1) term += 'x';
      if (!parts.length) parts.push((c < 0 ? '−' : '') + term);
      else parts.push((c < 0 ? ' − ' : ' + ') + term);
    }
    return parts.length ? parts.join('') : '0';
  }
  function find() {
    try {
      TN.clearErr(ERR);
      var raw = g('coeffs').value.trim();
      if (!raw) { TN.setErr(ERR, 'Type the coefficients first.'); return; }
      var parts = raw.split(/[\s,;]+/).filter(Boolean);
      var coeffs = [];
      for (var i = 0; i < parts.length; i++) {
        var v = parseFloat(parts[i]);
        if (isNaN(v)) { TN.setErr(ERR, '"' + parts[i] + '" is not a number.'); return; }
        coeffs.push(v);
      }
      while (coeffs.length > 1 && coeffs[0] === 0) coeffs.shift();
      var n = coeffs.length - 1;
      if (n < 1) { TN.setErr(ERR, 'Need at least 2 coefficients (a constant alone has no roots to find).'); return; }
      if (n > 8) { TN.setErr(ERR, 'Degree is limited to 8 for reliable convergence.'); return; }
      TN.show(P + 'out');
      g('poly').textContent = 'P(x) = ' + polyStr(coeffs);
      var roots, iter = 0, method, converged = true;
      var steps = [];
      if (n === 1) {
        roots = [C(-coeffs[1] / coeffs[0], 0)];
        method = 'Linear: x = −c/a = ' + cfmt(roots[0]) + '.';
      } else if (n === 2) {
        var a = coeffs[0], b = coeffs[1], cc = coeffs[2];
        var disc = b * b - 4 * a * cc;
        steps.push('<li>Discriminant Δ = b² − 4ac = ' + b + '² − 4·' + a + '·' + cc + ' = <b>' + parseFloat(disc.toPrecision(10)) + '</b>.</li>');
        if (disc >= 0) {
          var sq = Math.sqrt(disc);
          roots = [C((-b + sq) / (2 * a), 0), C((-b - sq) / (2 * a), 0)];
          steps.push('<li>Δ ≥ 0: x = (−b ± √Δ)/2a = (' + (-b) + ' ± ' + parseFloat(sq.toPrecision(10)) + ')/' + (2 * a) + '.</li>');
        } else {
          var re = -b / (2 * a), im = Math.sqrt(-disc) / (2 * a);
          roots = [C(re, im), C(re, -im)];
          steps.push('<li>Δ &lt; 0: complex pair x = (−b ± i√|Δ|)/2a = ' + cfmt(roots[0]) + ', ' + cfmt(roots[1]) + '.</li>');
        }
        method = 'Exact quadratic formula.';
      } else {
        var r = durandKerner(coeffs);
        roots = r.roots; iter = r.iter; converged = r.converged;
        method = 'Durand–Kerner simultaneous iteration (degree ' + n + ' has no general exact formula shown here).';
        steps.push('<li>Started with ' + n + ' initial guesses spread on a circle of radius 0.4 in the complex plane.</li>');
        steps.push('<li>Iterated z<sub>k</sub> ← z<sub>k</sub> − P(z<sub>k</sub>) / ∏(z<sub>k</sub> − z<sub>j</sub>) until every root moved less than 10⁻¹² per step.</li>');
        steps.push('<li>' + (converged ? 'Converged' : 'Stopped') + ' after <b>' + iter + '</b> iterations' + (converged ? '' : ' (max reached — treat results with caution)') + '.</li>');
      }
      // sort: real first then by re, im
      roots.sort(function (x, y) {
        var xr = Math.abs(x.im) < 5e-10, yr = Math.abs(y.im) < 5e-10;
        if (xr !== yr) return xr ? -1 : 1;
        return x.re - y.re || x.im - y.im;
      });
      var plain = [];
      g('roots').innerHTML = roots.map(function (z, ix) {
        var isReal = Math.abs(z.im) < 5e-10;
        var pv = peval(coeffs, z);
        var ok = cabs(pv) < 1e-6;
        plain.push(cfmt(z));
        return '<tr><td>' + (ix + 1) + '</td><td><code>' + TN.esc(cfmt(z)) + '</code></td><td>' + (isReal ? 'real' : 'complex') + '</td><td>' + (ok ? '✓ |P| = ' + cabs(pv).toExponential(1) : '≈ ' + cabs(pv).toExponential(1)) + '</td></tr>';
      }).join('');
      g('iter').textContent = n > 2 ? 'Durand–Kerner: ' + iter + ' iterations, ' + (converged ? 'converged' : 'did not fully converge') + '.' : '';
      steps.unshift('<li><b>' + TN.esc(method) + '</b></li>');
      g('steps').innerHTML = '<ol>' + steps.join('') + '</ol>';
      g('copy').setAttribute('data-r', plain.join('\n'));
    } catch (e) { TN.setErr(ERR, e.message || 'Could not find roots.'); }
  }
  try {
    if (!TN.el(P + 'find')) return;
    TN.on(P + 'find', 'click', find);
    TN.on(P + 'copy', 'click', function () {
      var r = g('copy').getAttribute('data-r');
      if (r) TN.copy(r);
    });
  } catch (e) { /* never throw on load */ }
})();
