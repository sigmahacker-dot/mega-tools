(function () {
  'use strict';
  var P = 'base-n-arithmetic-', ERR = P + 'error';
  var DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function g(id) { return TN.el(P + id); }
  function toBig(s, base) {
    s = s.trim().toUpperCase().replace(/^\+/, '');
    var neg = false;
    if (s.charAt(0) === '-') { neg = true; s = s.slice(1); }
    if (!s) throw new Error('Operand is empty.');
    var v = 0n, b = BigInt(base);
    for (var i = 0; i < s.length; i++) {
      var d = DIGITS.indexOf(s[i]);
      if (d < 0 || d >= base) throw new Error('Invalid digit "' + s[i] + '" for base ' + base + '.');
      v = v * b + BigInt(d);
    }
    return neg ? -v : v;
  }
  function fromBig(v, base) {
    if (v === 0n) return '0';
    var neg = v < 0n, b = BigInt(base), out = '';
    if (neg) v = -v;
    while (v > 0n) { out = DIGITS[Number(v % b)] + out; v = v / b; }
    return (neg ? '-' : '') + out;
  }
  function calc() {
    try {
      TN.clearErr(ERR);
      var base = parseInt(g('base').value, 10);
      if (isNaN(base) || base < 2 || base > 36) { TN.setErr(ERR, 'Base must be an integer from 2 to 36.'); return; }
      var a, b;
      try { a = toBig(g('a').value, base); } catch (e) { TN.setErr(ERR, 'First operand: ' + e.message); return; }
      try { b = toBig(g('b').value, base); } catch (e) { TN.setErr(ERR, 'Second operand: ' + e.message); return; }
      var op = g('op').value, res, decRes, steps = [];
      steps.push('<li>Converted <code>' + TN.esc(g('a').value.trim().toUpperCase()) + '</code><sub>' + base + '</sub> → decimal <b>' + a.toString() + '</b>.</li>');
      steps.push('<li>Converted <code>' + TN.esc(g('b').value.trim().toUpperCase()) + '</code><sub>' + base + '</sub> → decimal <b>' + b.toString() + '</b>.</li>');
      var sym = op === '*' ? '×' : (op === '/' ? '÷' : op);
      if (op === '+') { res = a + b; }
      else if (op === '-') { res = a - b; }
      else if (op === '*') { res = a * b; }
      else {
        if (b === 0n) { TN.setErr(ERR, 'Division by zero is not allowed.'); return; }
        var q = a / b, r = a % b;
        res = q;
        steps.push('<li>Decimal: ' + a + ' ÷ ' + b + ' = quotient <b>' + q + '</b>, remainder <b>' + r + '</b>.</li>');
        steps.push('<li>Quotient back to base ' + base + ': <b>' + fromBig(q, base) + '</b>; remainder: <b>' + fromBig(r, base) + '</b>.</li>');
        g('rem-wrap').style.display = '';
        g('rem').innerHTML = 'Quotient <b style="font-family:monospace">' + TN.esc(fromBig(q, base)) + '</b><sub>' + base + '</sub> &nbsp; Remainder <b style="font-family:monospace">' + TN.esc(fromBig(r, base)) + '</b><sub>' + base + '</sub>';
      }
      if (op !== '/') {
        decRes = res.toString();
        steps.push('<li>Decimal result: <b>' + a + ' ' + sym + ' ' + b + ' = ' + decRes + '</b>.</li>');
        steps.push('<li>Converted back to base ' + base + ': <b>' + TN.esc(fromBig(res, base)) + '</b>.</li>');
        g('rem-wrap').style.display = 'none';
      } else { decRes = res.toString() + ' r ' + (a % b).toString(); }
      steps.push('<li>Verification: <code>' + TN.esc(fromBig(res, base)) + '</code><sub>' + base + '</sub> converts back to decimal ' + res.toString() + ' ✓.</li>');
      TN.show(P + 'out');
      g('result').textContent = fromBig(res, base);
      g('result-l').textContent = 'Result (base ' + base + ')';
      g('result').setAttribute('data-r', fromBig(res, base));
      g('dec').textContent = decRes;
      g('steps').innerHTML = '<ol>' + steps.join('') + '</ol>';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    TN.on(P + 'calc', 'click', calc);
    TN.on(P + 'copy', 'click', function () {
      var r = g('result').getAttribute('data-r');
      if (r) TN.copy(r);
    });
  } catch (e) { /* never throw on load */ }
})();
