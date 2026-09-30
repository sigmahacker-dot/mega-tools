(function () {
  'use strict';
  var ERR = 'percentage-calculator-error';
  var LABELS = {
    of:    { x: 'Percentage (X%)', y: 'Base value (Y)', rl: 'X% of Y' },
    what:  { x: 'Part (X)', y: 'Whole (Y)', rl: 'X is what % of Y' },
    change:{ x: 'Old value (X)', y: 'New value (Y)', rl: '% change from X to Y' }
  };
  function fmtNum(n) {
    var r = Math.round(n * 10000) / 10000;
    try { return r.toLocaleString('en-US'); } catch (e) { return String(r); }
  }
  function calc() {
    var mEl = TN.el('percentage-mode'), xEl = TN.el('percentage-x'), yEl = TN.el('percentage-y');
    if (!mEl || !xEl || !yEl) return;
    TN.clearErr(ERR);
    var mode = mEl.value;
    var x = parseFloat(xEl.value);
    var y = parseFloat(yEl.value);
    var out = TN.el('percentage-value');
    var outLabel = TN.el('percentage-value-label');
    var explain = TN.el('percentage-explain');
    if (isNaN(x) || isNaN(y)) {
      if (out) out.textContent = '–';
      if (explain) explain.textContent = '';
      return;
    }
    var result, expl, label;
    if (mode === 'of') {
      result = x / 100 * y;
      label = fmtNum(x) + '% of ' + fmtNum(y);
      expl = fmtNum(x) + '% of ' + fmtNum(y) + ' = ' + fmtNum(result);
    } else if (mode === 'what') {
      if (y === 0) { TN.setErr(ERR, 'Y cannot be 0 for this calculation.'); return; }
      result = x / y * 100;
      label = fmtNum(x) + ' is what % of ' + fmtNum(y);
      expl = fmtNum(x) + ' / ' + fmtNum(y) + ' × 100 = ' + fmtNum(result) + '%';
    } else {
      if (x === 0) { TN.setErr(ERR, 'X cannot be 0 for percentage change.'); return; }
      result = (y - x) / x * 100;
      var dir = result > 0 ? 'increase' : (result < 0 ? 'decrease' : 'no change');
      label = '% change from ' + fmtNum(x) + ' to ' + fmtNum(y);
      expl = '(' + fmtNum(y) + ' − ' + fmtNum(x) + ') / ' + fmtNum(x) + ' × 100 = ' +
             fmtNum(result) + '% (' + dir + ')';
    }
    if (out) out.textContent = (mode === 'of' ? fmtNum(result) : fmtNum(result) + '%');
    if (outLabel) outLabel.textContent = label;
    if (explain) explain.textContent = expl;
  }
  function syncLabels() {
    var mEl = TN.el('percentage-mode');
    if (!mEl) return;
    var L = LABELS[mEl.value] || LABELS.of;
    var xl = TN.el('percentage-x-label'), yl = TN.el('percentage-y-label');
    if (xl) xl.textContent = L.x;
    if (yl) yl.textContent = L.y;
  }
  try {
    TN.on('percentage-mode', 'change', function () { syncLabels(); calc(); });
    TN.on('percentage-x', 'input', calc);
    TN.on('percentage-y', 'input', calc);
    syncLabels();
  } catch (e) { /* never throw on load */ }
})();
