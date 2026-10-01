(function () {
  'use strict';
  var P = 't-test-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  // regularized incomplete beta I_x(a,b) — Numerical Recipes betai
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1;
    var c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    d = 1 / d; var h = d, m, aa, del;
    for (m = 1; m <= 200; m++) {
      var m2 = 2 * m;
      aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; del = d * c; h *= del;
      if (Math.abs(del - 1) < 3e-14) break;
    }
    return h;
  }
  function gammaln(x) {
    var c = [76.18009172947146, -86.50532032961677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
    var y = x, tmp = x + 5.5, ser = 1.000000000190015, j;
    tmp -= (x + 0.5) * Math.log(tmp);
    for (j = 0; j < 6; j++) { y++; ser += c[j] / y; }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function betai(a, b, x) {
    if (x < 0 || x > 1) return NaN;
    if (x === 0 || x === 1) return x;
    var bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function tCDF(t, df) { // P(T <= t)
    var x = df / (df + t * t);
    var ib = betai(df / 2, 0.5, x);
    return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
  }
  function tP2(t, df) { return 2 * (1 - tCDF(Math.abs(t), df)); }
  function mean(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function sd(a, m) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += Math.pow(a[i] - m, 2);
    return Math.sqrt(s / (a.length - 1));
  }
  function fmt(x, d) {
    if (!isFinite(x)) return String(x);
    if (x !== 0 && (Math.abs(x) < 1e-4 || Math.abs(x) >= 1e10)) return x.toExponential(4);
    return String(parseFloat(x.toPrecision(d || 6)));
  }
  function parseData(s, name) {
    var parts = s.split(/[\s,;]+/).filter(Boolean), out = [];
    for (var i = 0; i < parts.length; i++) {
      var v = parseFloat(parts[i]);
      if (isNaN(v)) throw new Error(name + ': "' + parts[i] + '" is not a number.');
      out.push(v);
    }
    if (out.length < 2) throw new Error(name + ' needs at least 2 values.');
    return out;
  }
  function calc() {
    try {
      TN.clearErr(ERR);
      var mode = g('mode').value;
      var d1 = parseData(g('d1').value, 'Sample 1');
      var m1 = mean(d1), s1 = sd(d1, m1);
      var t, df, steps = [];
      if (mode === 'one') {
        var mu0 = parseFloat(g('mu').value);
        if (isNaN(mu0)) { TN.setErr(ERR, 'Claimed mean μ₀ must be a number.'); return; }
        if (s1 === 0) { TN.setErr(ERR, 'Sample 1 has zero variance — the t statistic is undefined.'); return; }
        var se = s1 / Math.sqrt(d1.length);
        t = (m1 - mu0) / se;
        df = d1.length - 1;
        steps.push('<li>H₀: μ = ' + fmt(mu0) + '. Sample: n = ' + d1.length + ', x̄ = ' + fmt(m1) + ', s = ' + fmt(s1) + '.</li>');
        steps.push('<li>Standard error SE = s/√n = ' + fmt(s1) + '/√' + d1.length + ' = ' + fmt(se) + '.</li>');
        steps.push('<li>t = (x̄ − μ₀)/SE = (' + fmt(m1) + ' − ' + fmt(mu0) + ')/' + fmt(se) + ' = <b>' + fmt(t) + '</b>, df = n − 1 = ' + df + '.</li>');
      } else {
        var d2 = parseData(g('d2').value, 'Sample 2');
        var m2 = mean(d2), s2 = sd(d2, m2);
        var n1 = d1.length, n2 = d2.length;
        if (s1 === 0 && s2 === 0) { TN.setErr(ERR, 'Both samples have zero variance — the t statistic is undefined.'); return; }
        var sp2 = ((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2);
        var se2 = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
        if (se2 === 0) { TN.setErr(ERR, 'Standard error is zero — the t statistic is undefined.'); return; }
        t = (m1 - m2) / se2;
        df = n1 + n2 - 2;
        steps.push('<li>H₀: μ₁ = μ₂ (equal-variance two-sample t-test). Sample 1: n = ' + n1 + ', x̄ = ' + fmt(m1) + ', s = ' + fmt(s1) + '. Sample 2: n = ' + n2 + ', x̄ = ' + fmt(m2) + ', s = ' + fmt(s2) + '.</li>');
        steps.push('<li>Pooled variance s_p² = [(n₁−1)s₁² + (n₂−1)s₂²]/(n₁+n₂−2) = ' + fmt(sp2) + '.</li>');
        steps.push('<li>SE = √(s_p²(1/n₁ + 1/n₂)) = ' + fmt(se2) + '.</li>');
        steps.push('<li>t = (x̄₁ − x̄₂)/SE = <b>' + fmt(t) + '</b>, df = n₁ + n₂ − 2 = ' + df + '.</li>');
      }
      var p = tP2(t, df);
      TN.show(P + 'out');
      g('t').textContent = fmt(t);
      g('df').textContent = String(df);
      g('p').textContent = fmt(p);
      steps.push('<li>Two-tailed p-value = 2·P(T &gt; |t|) = <b>' + fmt(p) + '</b> (Student t, df = ' + df + ').</li>');
      var sig = p < 0.05;
      g('verdict').innerHTML = 'p = ' + fmt(p) + (sig
        ? ' &lt; 0.05 → <b>reject H₀</b>: the difference is statistically significant at the 5% level.'
        : ' ≥ 0.05 → <b>fail to reject H₀</b>: no significant difference at the 5% level.');
      g('steps').innerHTML = '<ol>' + steps.join('') + '</ol><p class="muted">Assumes roughly normal data (or n ≥ 30); the two-sample version also assumes equal variances.</p>';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    TN.on(P + 'calc', 'click', calc);
    TN.on(P + 'mode', 'change', function () {
      var two = g('mode').value === 'two';
      g('d2-wrap').style.display = two ? '' : 'none';
      g('mu-wrap').style.display = two ? 'none' : '';
      TN.hide(P + 'out');
    });
  } catch (e) { /* never throw on load */ }
})();
