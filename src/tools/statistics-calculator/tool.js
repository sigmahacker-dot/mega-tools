(function () {
  'use strict';
  var ERR = 'statistics-calculator-error';

  function fmt(v) {
    if (!isFinite(v)) return '–';
    return parseFloat(v.toPrecision(10)).toString();
  }

  function quantile(sorted, q) {
    var n = sorted.length;
    if (n === 1) return sorted[0];
    var pos = (n - 1) * q;
    var lo = Math.floor(pos);
    var hi = Math.ceil(pos);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  function calc() {
    TN.clearErr(ERR);
    try {
      var el = TN.el('statistics-calculator-input');
      var raw = el ? el.value : '';
      var parts = raw.split(/[\s,;]+/).filter(function (s) { return s.length > 0; });
      if (!parts.length) throw new Error('Enter at least one number.');
      if (parts.length > 100000) throw new Error('Too many numbers — keep it under 100,000.');
      var nums = parts.map(function (s) {
        var n = Number(s);
        if (!isFinite(n)) throw new Error('"' + s + '" is not a number.');
        return n;
      });
      var n = nums.length;
      var sum = 0, min = Infinity, max = -Infinity;
      nums.forEach(function (v) { sum += v; if (v < min) min = v; if (v > max) max = v; });
      var sorted = nums.slice().sort(function (a, b) { return a - b; });
      var mean = sum / n;
      var median = n % 2 === 1
        ? sorted[(n - 1) / 2]
        : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      // Mode(s)
      var freq = {}, best = 0;
      nums.forEach(function (v) {
        var k = String(v);
        freq[k] = (freq[k] || 0) + 1;
        if (freq[k] > best) best = freq[k];
      });
      var modes = Object.keys(freq).filter(function (k) { return freq[k] === best; })
        .map(Number).sort(function (a, b) { return a - b; });
      var modeStr = (best === 1 && n > 1) ? 'none (all values unique)' : modes.map(fmt).join(', ');
      // Variance
      var sq = 0;
      nums.forEach(function (v) { sq += (v - mean) * (v - mean); });
      var varP = sq / n;
      var varS = n > 1 ? sq / (n - 1) : NaN;
      var q1 = quantile(sorted, 0.25);
      var q3 = quantile(sorted, 0.75);

      TN.el('statistics-calculator-n').textContent = String(n);
      TN.el('statistics-calculator-mean').textContent = fmt(mean);
      TN.el('statistics-calculator-median').textContent = fmt(median);
      TN.el('statistics-calculator-stddev').textContent = fmt(Math.sqrt(varP));
      TN.el('statistics-calculator-sum').textContent = fmt(sum);
      TN.el('statistics-calculator-minmax').textContent = fmt(min) + ' / ' + fmt(max);
      TN.el('statistics-calculator-range').textContent = fmt(max - min);
      TN.el('statistics-calculator-mode').textContent = modeStr;
      TN.el('statistics-calculator-varp').textContent = fmt(varP);
      TN.el('statistics-calculator-vars').textContent = n > 1 ? fmt(varS) : '– (needs n ≥ 2)';
      TN.el('statistics-calculator-stddevs').textContent = n > 1 ? fmt(Math.sqrt(varS)) : '– (needs n ≥ 2)';
      TN.el('statistics-calculator-q').textContent = fmt(q1) + ' / ' + fmt(q3);
      TN.el('statistics-calculator-iqr').textContent = fmt(q3 - q1);
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('statistics-calculator-go', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
