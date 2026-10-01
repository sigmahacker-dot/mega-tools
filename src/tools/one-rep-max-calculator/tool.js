(function () {
  'use strict';
  var ERR = 'one-rep-max-calculator-error';
  function r1(n) { return (Math.round(n * 10) / 10).toLocaleString('en-US'); }
  function calc() {
    if (!TN.el('orm-weight')) return;
    TN.clearErr(ERR);
    var w = parseFloat(TN.el('orm-weight').value);
    var reps = parseInt(TN.el('orm-reps').value, 10);
    if (!(w > 0)) { TN.setErr(ERR, 'Enter a weight greater than 0.'); return; }
    if (!(reps >= 1 && reps <= 12)) { TN.setErr(ERR, 'Enter reps between 1 and 12.'); return; }
    var epley = w * (1 + reps / 30);
    var brzycki = w * 36 / (37 - reps);
    var avg = (epley + brzycki) / 2;
    TN.el('orm-epley').textContent = r1(epley);
    TN.el('orm-brzycki').textContent = r1(brzycki);
    TN.el('orm-avg').textContent = r1(avg);
    var rows = [];
    for (var p = 100; p >= 55; p -= 5) {
      rows.push('<tr><td>' + p + '%</td><td>' + r1(avg * p / 100) + '</td></tr>');
    }
    TN.el('orm-table-body').innerHTML = rows.join('');
  }
  try {
    TN.on('orm-weight', 'input', calc);
    TN.on('orm-reps', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
