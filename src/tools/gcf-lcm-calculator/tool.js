(function () {
  'use strict';
  var ERR = 'gcf-lcm-calculator-error';

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }

  function calc() {
    TN.clearErr(ERR);
    try {
      var el = TN.el('gcf-lcm-calculator-input');
      var raw = el ? el.value : '';
      var parts = raw.split(/[\s,;]+/).filter(function (s) { return s.length > 0; });
      if (!parts.length) throw new Error('Enter at least one integer.');
      if (parts.length > 100) throw new Error('Too many numbers — keep it to 100 or fewer.');
      var nums = parts.map(function (s) {
        if (!/^-?\d+$/.test(s)) throw new Error('"' + s + '" is not an integer.');
        var n = Number(s);
        if (!isFinite(n)) throw new Error('"' + s + '" is too large.');
        return n;
      });
      var g = 0;
      var l = 1;
      nums.forEach(function (n) {
        g = gcd(g, n);
        if (n === 0) { l = 0; return; }
        var lg = gcd(l, n) || 1;
        l = Math.abs((l / lg) * n);
        if (!isFinite(l)) throw new Error('LCM overflow — numbers too large.');
      });
      TN.el('gcf-lcm-calculator-gcf').textContent = String(g);
      TN.el('gcf-lcm-calculator-lcm').textContent = String(l);
      TN.el('gcf-lcm-calculator-count').textContent = String(nums.length);
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('gcf-lcm-calculator-go', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
