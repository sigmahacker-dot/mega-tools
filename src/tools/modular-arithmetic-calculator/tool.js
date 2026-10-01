(function () {
  'use strict';
  var P = 'modular-arithmetic-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function isInt(v) { return isFinite(v) && Math.floor(v) === v; }
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }
  function egcd(a, b) {
    if (b === 0) return [a, 1, 0];
    var r = egcd(b, a % b), d = r[0], x = r[2], y = r[1] - Math.floor(a / b) * r[2];
    return [d, x, y];
  }
  function modInv(a, m) {
    var r = egcd(((a % m) + m) % m, m);
    if (r[0] !== 1) return null;
    return ((r[1] % m) + m) % m;
  }
  function modPow(base, exp, m) {
    base = ((base % m) + m) % m;
    var res = 1 % m;
    while (exp > 0) {
      if (exp % 2 === 1) res = (res * base) % m;
      base = (base * base) % m;
      exp = Math.floor(exp / 2);
    }
    return res;
  }
  function blank() { set('res', '–'); set('gcdv', '–'); set('steps', 'Enter a, b and m to compute.'); }
  function calc() {
    if (!g('a')) return;
    TN.clearErr(ERR);
    var op = g('op').value;
    var ra = g('a').value, rb = g('b').value, rm = g('m').value;
    var a = ra === '' ? NaN : parseFloat(ra);
    var b = rb === '' ? NaN : parseFloat(rb);
    var m = rm === '' ? NaN : parseFloat(rm);
    var needM = op !== 'gcd';
    if (isNaN(a) || !isInt(a) || (op !== 'inv' && (isNaN(b) || !isInt(b))) || (needM && (isNaN(m) || !isInt(m)))) {
      blank();
      if (ra !== '' || rb !== '' || rm !== '') TN.setErr(ERR, 'Enter whole numbers for a, b and m.');
      return;
    }
    if (needM && m <= 0) { TN.setErr(ERR, 'The modulus m must be a positive whole number.'); blank(); return; }
    if (Math.abs(a) > 1e12 || Math.abs(b) > 1e12 || (needM && m > 1e9)) {
      TN.setErr(ERR, 'Values are too large for exact integer arithmetic here — keep |a|,|b| ≤ 10¹² and m ≤ 10⁹.');
      blank(); return;
    }
    set('gcdv', needM ? String(gcd(a, m)) : String(gcd(a, b)));
    var res, steps;
    if (op === 'add') { res = (((a + b) % m) + m) % m; steps = '(' + a + ' + ' + b + ') mod ' + m + ' = ' + res + '.'; }
    else if (op === 'sub') { res = (((a - b) % m) + m) % m; steps = '(' + a + ' − ' + b + ') mod ' + m + ' = ' + res + ' (wrapped into 0…' + (m - 1) + ').'; }
    else if (op === 'mul') { res = (((a % m) * (b % m)) % m + m) % m; res = (((a % m) * (b % m)) % m + m) % m; steps = '(' + a + ' × ' + b + ') mod ' + m + ' = ' + res + '.'; }
    else if (op === 'pow') {
      if (b < 0) {
        var inv = modInv(a, m);
        if (inv === null) { TN.setErr(ERR, 'No inverse exists: gcd(' + a + ', ' + m + ') ≠ 1, so a^(' + b + ') mod ' + m + ' is undefined.'); blank(); return; }
        res = modPow(inv, -b, m);
        steps = a + '^(' + b + ') mod ' + m + ' = (' + a + '⁻¹)^' + (-b) + ' mod ' + m + ' = ' + inv + '^' + (-b) + ' mod ' + m + ' = ' + res + '.';
      } else {
        res = modPow(a, b, m);
        steps = a + '^' + b + ' mod ' + m + ' = ' + res + ' (square-and-multiply, no giant intermediate numbers).';
      }
    }
    else if (op === 'gcd') { res = gcd(a, b); steps = 'gcd(' + a + ', ' + b + ') = ' + res + ' (Euclidean algorithm).'; }
    else {
      var iv = modInv(a, m);
      if (iv === null) { TN.setErr(ERR, 'No modular inverse exists because gcd(' + a + ', ' + m + ') = ' + gcd(a, m) + ' ≠ 1.'); blank(); return; }
      res = iv;
      steps = a + '⁻¹ mod ' + m + ' = ' + iv + ' (extended Euclidean algorithm). Check: (' + a + ' × ' + iv + ') mod ' + m + ' = ' + ((((a % m) * iv) % m + m) % m) + '.';
    }
    set('res', String(res));
    set('steps', steps);
  }
  try {
    ['a', 'b', 'm'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    TN.on(P + 'op', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
