/* Mixed number add/subtract with common-denominator steps. */
(function () {
  'use strict';
  var SLUG = 'mixed-number-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function parseMixed(s) {
    s = s.trim();
    var m = s.match(/^(-?)(\d+)?\s*(\d+)\/(\d+)$/) || s.match(/^(-?)(\d+)$/);
    if (!m) return null;
    var neg = m[1] === '-';
    var whole = m[2] ? parseInt(m[2], 10) : 0;
    var n = m[3] ? parseInt(m[3], 10) : 0, d = m[4] ? parseInt(m[4], 10) : 1;
    if (d === 0) return null;
    var num = whole * d + n;
    return { num: neg ? -num : num, den: d };
  }
  function fmt(n, d) {
    if (d === 1) return String(n);
    var neg = n < 0; n = Math.abs(n);
    var w = Math.floor(n / d), r = n % d;
    var s = r === 0 ? String(w) : (w === 0 ? r + '/' + d : w + ' ' + r + '/' + d);
    return (neg ? '-' : '') + s;
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var p1 = parseMixed($(SLUG + '-w1').value), p2 = parseMixed($(SLUG + '-w2').value);
    if (!p1 || !p2) { err('Use the form like 2 1/3, 3/4 or 5 (optional minus sign).'); return; }
    var op = $(SLUG + '-op').value;
    var n2 = op === '+' ? p2.num : -p2.num;
    var lines = [];
    lines.push('Step 1: convert to improper fractions');
    lines.push('   ' + $(SLUG + '-w1').value.trim() + ' = ' + p1.num + '/' + p1.den);
    lines.push('   ' + $(SLUG + '-w2').value.trim() + ' = ' + p2.num + '/' + p2.den);
    var g = gcd(p1.den, p2.den);
    var lcd = p1.den / g * p2.den;
    lines.push('Step 2: common denominator = LCM(' + p1.den + ', ' + p2.den + ') = ' + lcd);
    var m1 = lcd / p1.den, m2 = lcd / p2.den;
    var t1 = p1.num * m1, t2 = n2 * m2;
    lines.push('   ' + p1.num + '/' + p1.den + ' = ' + t1 + '/' + lcd + '    (' + (op === '+' ? '' : '\u2212') + p2.num + '/' + p2.den + ' = ' + t2 + '/' + lcd + ')');
    lines.push('Step 3: ' + (op === '+' ? 'add' : 'subtract') + ' numerators: ' + t1 + ' ' + op + ' ' + (n2 < 0 ? '(' + n2 + ')' : t2) + ' = ' + (t1 + t2));
    var rn = t1 + t2, rd = lcd;
    var gg = gcd(rn, rd);
    lines.push('Step 4: simplify \u2192 GCD(' + rn + ', ' + rd + ') = ' + gg);
    rn /= gg; rd /= gg;
    lines.push('Result: ' + rn + '/' + rd + ' = ' + fmt(rn, rd));
    $(SLUG + '-res').textContent = fmt(rn, rd);
    $(SLUG + '-improper').textContent = rn + '/' + rd;
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-w1', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-w2', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-op', 'change', calc);
    calc();
  } catch (e) {}
})();