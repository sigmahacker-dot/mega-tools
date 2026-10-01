/* Long division with bring-down steps. */
(function () {
  'use strict';
  var SLUG = 'long-division-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var A = $(SLUG + '-dividend').value.trim(), B = $(SLUG + '-divisor').value.trim();
    var dividend = parseInt(A, 10), divisor = parseInt(B, 10);
    if (!/^-?\d+$/.test(A) || !/^-?\d+$/.test(B)) { err('Enter whole numbers only.'); return; }
    if (divisor === 0) { err('Divisor cannot be zero.'); return; }
    dividend = Math.abs(dividend); divisor = Math.abs(divisor);
    var neg = (/^-/.test(A)) !== (/^-/.test(B));
    var digits = String(dividend).split('');
    var cur = 0, qDigits = [], lines = [], started = false;
    lines.push('  ' + A + ' \u00F7 ' + B);
    lines.push('');
    for (var i = 0; i < digits.length; i++) {
      var d = parseInt(digits[i], 10);
      var before = cur;
      cur = cur * 10 + d;
      if (!started && cur < divisor) { qDigits.push(0); lines.push('Step ' + (i + 1) + ': bring down ' + d + ' \u2192 ' + cur + '  (too small for ' + divisor + ', quotient digit 0)'); continue; }
      started = true;
      var qd = Math.floor(cur / divisor);
      var prod = qd * divisor, rem = cur - prod;
      qDigits.push(qd);
      var msg = 'Step ' + (i + 1) + ': ';
      if (before > 0 || i > 0) msg += 'bring down ' + d + ' \u2192 ' + cur + ';  ';
      msg += cur + ' \u00F7 ' + divisor + ' = ' + qd + '   (' + qd + ' \u00D7 ' + divisor + ' = ' + prod + ',  ' + cur + ' \u2212 ' + prod + ' = ' + rem + ')';
      lines.push(msg);
      cur = rem;
    }
    var q = parseInt(qDigits.join(''), 10) || 0;
    lines.push('');
    lines.push('Quotient = ' + (neg && q ? '-' : '') + q + ',   Remainder = ' + cur);
    lines.push('Check: ' + divisor + ' \u00D7 ' + q + ' + ' + cur + ' = ' + (divisor * q + cur));
    $(SLUG + '-quot').textContent = (neg && q ? '-' : '') + q;
    $(SLUG + '-rem').textContent = cur;
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-dividend', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-divisor', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();