(function () {
  'use strict';
  var P = 'chi-square-test-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  // regularized upper incomplete gamma Q(a,x) — Numerical Recipes
  function gser(a, x) {
    var gln = gammaln(a), ap = a, sum = 1 / a, del = sum, n;
    for (n = 1; n <= 200; n++) {
      ap++; del *= x / ap; sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-14) break;
    }
    return { p: sum * Math.exp(-x + a * Math.log(x) - gln), gln: gln };
  }
  function gcf(a, x) {
    var gln = gammaln(a), b = x + 1 - a, c = 1e300, d = 1 / b, h = d, i, an, del;
    for (i = 1; i <= 200; i++) {
      an = -i * (i - a); b += 2; d = an * d + b;
      if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c;
      if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-14) break;
    }
    return { q: Math.exp(-x + a * Math.log(x) - gln) * h, gln: gln };
  }
  function gammaincc(a, x) { // Q(a,x)
    if (x < 0 || a <= 0) return NaN;
    if (x === 0) return 1;
    if (x < a + 1) return 1 - gser(a, x).p;
    return gcf(a, x).q;
  }
  var gammlnC = [76.18009172947146, -86.50532032961677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
  function gammaln(x) {
    var y = x, tmp = x + 5.5, ser = 1.000000000190015, j;
    tmp -= (x + 0.5) * Math.log(tmp);
    for (j = 0; j < 6; j++) { y++; ser += gammlnC[j] / y; }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function fmt(x, d) {
    if (!isFinite(x)) return String(x);
    if (x !== 0 && (Math.abs(x) < 1e-4 || Math.abs(x) >= 1e10)) return x.toExponential(4);
    return String(parseFloat(x.toPrecision(d || 6)));
  }
  function parseNums(s) {
    var parts = s.split(/[\s,;]+/).filter(Boolean), out = [];
    for (var i = 0; i < parts.length; i++) {
      var v = parseFloat(parts[i]);
      if (isNaN(v) || v < 0) throw new Error('Counts must be non-negative numbers. Bad value: "' + parts[i] + '".');
      out.push(v);
    }
    return out;
  }
  function calc() {
    try {
      TN.clearErr(ERR);
      var mode = g('mode').value;
      var chi2 = 0, df = 0, rows = [], expSmall = 0, note = '';
      if (mode === 'gof') {
        var obs = parseNums(g('obs').value);
        if (obs.length < 2) { TN.setErr(ERR, 'Goodness-of-fit needs at least 2 observed counts.'); return; }
        var expRaw = g('exp').value.trim();
        var exp;
        if (!expRaw) {
          var tot = obs.reduce(function (s, v) { return s + v; }, 0);
          exp = obs.map(function () { return tot / obs.length; });
          note = 'Expected counts assumed uniform (total ' + fmt(tot) + ' ÷ ' + obs.length + ' categories).';
        } else {
          exp = parseNums(expRaw);
          if (exp.length !== obs.length) { TN.setErr(ERR, 'Expected (' + exp.length + ') and observed (' + obs.length + ') counts must match.'); return; }
        }
        df = obs.length - 1;
        for (var i = 0; i < obs.length; i++) {
          if (exp[i] === 0) { TN.setErr(ERR, 'Expected count for category ' + (i + 1) + ' is 0 — χ² is undefined.'); return; }
          var term = Math.pow(obs[i] - exp[i], 2) / exp[i];
          chi2 += term;
          if (exp[i] < 5) expSmall++;
          rows.push({ cell: 'Category ' + (i + 1), o: obs[i], e: exp[i], t: term });
        }
        note += (note ? ' ' : '') + 'H₀: observed follows the expected distribution.';
      } else {
        var lines = g('obs').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        if (lines.length < 2) { TN.setErr(ERR, 'Independence needs at least 2 rows (one per line).'); return; }
        var tab = lines.map(parseNums);
        var nc = tab[0].length;
        if (nc < 2) { TN.setErr(ERR, 'Need at least 2 columns.'); return; }
        for (var r = 0; r < tab.length; r++) if (tab[r].length !== nc) { TN.setErr(ERR, 'Row ' + (r + 1) + ' has ' + tab[r].length + ' values, expected ' + nc + '.'); return; }
        var rowT = tab.map(function (row) { return row.reduce(function (s, v) { return s + v; }, 0); });
        var colT = [];
        for (var c = 0; c < nc; c++) { var s = 0; for (var rr = 0; rr < tab.length; rr++) s += tab[rr][c]; colT.push(s); }
        var grand = rowT.reduce(function (s, v) { return s + v; }, 0);
        if (grand === 0) { TN.setErr(ERR, 'All counts are zero.'); return; }
        df = (tab.length - 1) * (nc - 1);
        for (r = 0; r < tab.length; r++) for (c = 0; c < nc; c++) {
          var e = rowT[r] * colT[c] / grand;
          if (e === 0) { TN.setErr(ERR, 'Expected count is 0 for a cell — χ² is undefined.'); return; }
          var t2 = Math.pow(tab[r][c] - e, 2) / e;
          chi2 += t2;
          if (e < 5) expSmall++;
          rows.push({ cell: 'Row ' + (r + 1) + ', Col ' + (c + 1), o: tab[r][c], e: e, t: t2 });
        }
        note = 'H₀: the two variables are independent. Expected = row total × column total ÷ grand total.';
      }
      var p = gammaincc(df / 2, chi2 / 2);
      TN.show(P + 'out');
      g('chi2').textContent = fmt(chi2);
      g('df').textContent = String(df);
      g('p').textContent = fmt(p);
      var sig = p < 0.05;
      g('verdict').innerHTML = 'p = ' + fmt(p) + (sig
        ? ' &lt; 0.05 → <b>reject H₀</b>: the difference is statistically significant at the 5% level.'
        : ' ≥ 0.05 → <b>fail to reject H₀</b>: no significant difference at the 5% level.');
      g('table').innerHTML = rows.map(function (rw) {
        return '<tr><td>' + TN.esc(rw.cell) + '</td><td>' + fmt(rw.o) + '</td><td>' + fmt(rw.e) + '</td><td>' + fmt(rw.t) + '</td></tr>';
      }).join('') + '<tr><td><b>Total</b></td><td></td><td></td><td><b>χ² = ' + fmt(chi2) + '</b></td></tr>';
      g('check').textContent = note + (expSmall ? ' Caution: ' + expSmall + ' expected count(s) < 5 — the χ² approximation may be unreliable.' : ' All expected counts ≥ 5 — the χ² approximation is fine.');
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    TN.on(P + 'calc', 'click', calc);
    TN.on(P + 'mode', 'change', function () {
      var ind = g('mode').value === 'ind';
      g('exp-wrap').style.display = ind ? 'none' : '';
      g('obs-l').textContent = ind ? 'Contingency table (one row per line, commas between columns)' : 'Observed counts (comma separated)';
      g('obs').value = ind ? '20, 15, 10\n12, 18, 25' : '23, 31, 19, 27';
      g('obs').placeholder = ind ? 'e.g.\n20, 15, 10\n12, 18, 25' : 'e.g. 23, 31, 19, 27';
      TN.hide(P + 'out');
    });
  } catch (e) { /* never throw on load */ }
})();
