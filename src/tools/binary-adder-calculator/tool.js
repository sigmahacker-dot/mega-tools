/* Binary addition with column carry visualization. */
(function () {
  'use strict';
  var SLUG = 'binary-adder-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var A = $(SLUG + '-a').value.trim(), B = $(SLUG + '-b').value.trim();
    if (!/^[01]+$/.test(A) || !/^[01]+$/.test(B)) { err('Enter binary strings (0s and 1s only).'); return; }
    if (A.length > 64 || B.length > 64) { err('Keep each number to 64 bits or fewer.'); return; }
    var a = A.split('').reverse(), b = B.split('').reverse();
    var n = Math.max(a.length, b.length);
    var carry = 0, sumBits = [], carries = [], lines = [];
    lines.push('Adding column by column, right to left:');
    for (var i = 0; i < n; i++) {
      var da = i < a.length ? parseInt(a[i], 10) : 0;
      var db = i < b.length ? parseInt(b[i], 10) : 0;
      var total = da + db + carry;
      var bit = total % 2;
      var newCarry = Math.floor(total / 2);
      sumBits.push(bit); carries.push(carry);
      lines.push('  col ' + (i + 1) + ': ' + da + ' + ' + db + ' + carry ' + carry + ' = ' + total + ' \u2192 write ' + bit + ', carry ' + newCarry);
      carry = newCarry;
    }
    if (carry) { sumBits.push(carry); lines.push('  final carry ' + carry + ' becomes a new leftmost bit'); }
    sumBits.reverse(); carries.reverse();
    var sum = sumBits.join('');
    // aligned column view
    var w = sum.length;
    function P(s) { s = String(s); while (s.length < w) s = ' ' + s; return s; }
    lines.push('');
    lines.push('   ' + carries.map(function () { return ''; }).join(''));
    lines.push('   ' + P(A));
    lines.push('+  ' + P(B));
    lines.push('   ' + '-'.repeat(w));
    lines.push('   ' + sum);
    lines.push('carries: ' + carries.join('') + (carry ? ' (+final)' : ''));
    var dec = parseInt(A, 2) + parseInt(B, 2);
    lines.push('');
    lines.push('Check: ' + parseInt(A, 2) + ' + ' + parseInt(B, 2) + ' = ' + dec + ' = ' + sum + '\u2082');
    $(SLUG + '-sum').textContent = sum;
    $(SLUG + '-dec').textContent = dec;
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-a', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-b', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();