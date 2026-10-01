(function () {
  'use strict';
  var P = 'permutation-combination-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function disp(n) {
    if (!isFinite(n)) return '∞ (too large)';
    if (n <= 9e15 && Math.floor(n) === n) return n.toLocaleString('en-US');
    return n.toExponential(6);
  }
  function perm(n, r) {
    var p = 1;
    for (var i = 0; i < r; i++) { p *= (n - i); if (!isFinite(p)) break; }
    return p;
  }
  function comb(n, r) {
    r = Math.min(r, n - r);
    var c = 1;
    for (var i = 1; i <= r; i++) { c = c * (n - r + i) / i; if (!isFinite(c)) break; }
    return Math.round(c);
  }
  function blank() {
    set('value', '–'); set('other', '–');
    set('steps', 'Enter n and r to compute.');
  }
  function calc() {
    if (!g('n')) return;
    TN.clearErr(ERR);
    var nr = g('n').value, rr = g('r').value;
    if (nr === '' || rr === '') { blank(); return; }
    var n = parseFloat(nr), r = parseFloat(rr);
    if ([n, r].some(function (v) { return isNaN(v) || Math.floor(v) !== v; }) || n < 0 || n > 1000 || r < 0) {
      TN.setErr(ERR, 'n and r must be whole numbers with 0 ≤ n ≤ 1000 and r ≥ 0.');
      blank(); return;
    }
    if (r > n) { TN.setErr(ERR, 'r cannot be greater than n — you cannot pick more items than exist.'); blank(); return; }
    var mode = g('mode').value;
    var pv = perm(n, r), cv = comb(n, r);
    if (mode === 'P') {
      set('lab', 'P(' + n + ',' + r + ')'); set('value', disp(pv));
      set('lab2', 'C(' + n + ',' + r + ')'); set('other', disp(cv));
      set('steps', 'P(' + n + ',' + r + ') = ' + n + '! ÷ (' + n + '−' + r + ')! = ' + disp(pv) + '. Order matters, so this counts every distinct arrangement.');
    } else {
      set('lab', 'C(' + n + ',' + r + ')'); set('value', disp(cv));
      set('lab2', 'P(' + n + ',' + r + ')'); set('other', disp(pv));
      set('steps', 'C(' + n + ',' + r + ') = ' + n + '! ÷ (' + r + '! × ' + (n - r) + '!) = ' + disp(cv) + '. Order is ignored, so this counts every distinct selection.');
    }
  }
  try {
    TN.on(P + 'n', 'input', calc);
    TN.on(P + 'r', 'input', calc);
    TN.on(P + 'mode', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
