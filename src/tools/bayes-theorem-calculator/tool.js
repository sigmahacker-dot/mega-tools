(function () {
  'use strict';
  var P = 'bayes-theorem-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function pct(x) { return (x * 100).toFixed(2) + '%'; }
  function f4(x) { return String(parseFloat(x.toPrecision(6))); }
  function calc() {
    try {
      TN.clearErr(ERR);
      function get(id, name) {
        var v = parseFloat(g(id).value);
        if (isNaN(v) || v < 0 || v > 100) throw new Error(name + ' must be a percentage between 0 and 100.');
        return v / 100;
      }
      var prior = get('prior', 'Prior'), sens = get('sens', 'Sensitivity'), spec = get('spec', 'Specificity');
      var pNotD = 1 - prior;
      var pPosGivenNotD = 1 - spec;
      var pPos = sens * prior + pPosGivenNotD * pNotD;
      var pNeg = 1 - pPos;
      var postPos = pPos === 0 ? NaN : sens * prior / pPos;
      var postNeg = pNeg === 0 ? NaN : (1 - sens) * prior / pNeg;
      TN.show(P + 'out');
      g('post-pos').textContent = isNaN(postPos) ? '—' : pct(postPos);
      g('post-neg').textContent = isNaN(postNeg) ? '—' : pct(postNeg);
      g('p-pos').textContent = pct(pPos);
      var steps = '<ol>' +
        '<li>P(D) = ' + f4(prior) + ', P(¬D) = ' + f4(pNotD) + ', P(+|D) = ' + f4(sens) + ', P(−|¬D) = ' + f4(spec) + ', so P(+|¬D) = ' + f4(pPosGivenNotD) + '.</li>' +
        '<li>Total probability of a positive: P(+) = P(+|D)·P(D) + P(+|¬D)·P(¬D) = ' + f4(sens) + '·' + f4(prior) + ' + ' + f4(pPosGivenNotD) + '·' + f4(pNotD) + ' = <b>' + f4(pPos) + '</b>.</li>' +
        '<li>Bayes: P(D|+) = P(+|D)·P(D) / P(+) = ' + f4(sens * prior) + ' / ' + f4(pPos) + ' = <b>' + pct(postPos) + '</b>.</li>' +
        '<li>P(D|−) = P(−|D)·P(D) / P(−) = ' + f4((1 - sens) * prior) + ' / ' + f4(pNeg) + ' = <b>' + pct(postNeg) + '</b>.</li>' +
        '</ol>';
      g('steps').innerHTML = steps;
      var N = 10000;
      var dPos = Math.round(N * prior * sens), dNeg = Math.round(N * prior * (1 - sens));
      var hPos = Math.round(N * pNotD * (1 - spec)), hNeg = Math.round(N * pNotD * spec);
      g('freq').innerHTML =
        '<tr><th>Has condition</th><td>' + dPos + '</td><td>' + dNeg + '</td><td>' + (dPos + dNeg) + '</td></tr>' +
        '<tr><th>No condition</th><td>' + hPos + '</td><td>' + hNeg + '</td><td>' + (hPos + hNeg) + '</td></tr>' +
        '<tr><th>Total</th><td><b>' + (dPos + hPos) + '</b></td><td>' + (dNeg + hNeg) + '</td><td>' + N + '</td></tr>' +
        '<tr><td colspan="4" class="muted">Of the ' + (dPos + hPos) + ' positive results, only ' + dPos + ' truly have the condition → ' + pct(dPos / Math.max(1, dPos + hPos)) + '.</td></tr>';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    TN.on(P + 'calc', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
