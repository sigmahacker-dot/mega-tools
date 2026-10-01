(function () {
  'use strict';
  var P = 'ratio-simplifier-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function fmt(n) { if (!isFinite(n)) return '–'; return String(Number(n.toFixed(6))); }
  function gcd2(a, b) {
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
    while (b) { var t = a % b; a = b; b = t; }
    return a || 1;
  }
  function blanks() {
    set('simple', '–'); set('gcd', '–'); set('total', '–');
    g('body').innerHTML = '<tr><td colspan="5" class="muted">Enter at least two numbers to simplify the ratio.</td></tr>';
  }
  function calc() {
    if (!g('a')) return;
    TN.clearErr(ERR);
    var raws = [g('a').value, g('b').value, g('c').value];
    var nums = [];
    for (var i = 0; i < raws.length; i++) {
      if (raws[i] === '') continue;
      var v = parseFloat(raws[i]);
      if (isNaN(v) || v <= 0) { TN.setErr(ERR, 'Enter positive numbers only (decimals are fine).'); blanks(); return; }
      nums.push(v);
    }
    if (nums.length < 2) {
      if (raws.some(function (r) { return r !== ''; })) TN.setErr(ERR, 'Enter at least two numbers to form a ratio.');
      blanks(); return;
    }
    var maxDp = 0;
    nums.forEach(function (v) {
      var s = String(v), d = s.indexOf('.');
      if (d >= 0) maxDp = Math.max(maxDp, s.length - d - 1);
    });
    if (maxDp > 6) { TN.setErr(ERR, 'Please use at most 6 decimal places.'); blanks(); return; }
    var scale = Math.pow(10, maxDp);
    var ints = nums.map(function (v) { return Math.round(v * scale); });
    var d = ints.reduce(gcd2);
    var simp = ints.map(function (v) { return v / d; });
    var total = simp.reduce(function (s, v) { return s + v; }, 0);
    set('simple', simp.join(' : '));
    set('gcd', fmt(d / scale));
    set('total', String(total));
    var rows = '';
    var labels = ['First', 'Second', 'Third'];
    for (var j = 0; j < nums.length; j++) {
      var share = simp[j] / total;
      rows += '<tr><td>' + labels[j] + '</td><td>' + TN.esc(fmt(nums[j])) + '</td><td>' +
        TN.esc(String(simp[j])) + '</td><td>' + TN.esc(simp[j] + ' / ' + total) + '</td><td>' +
        TN.esc((share * 100).toFixed(2) + '%') + '</td></tr>';
    }
    g('body').innerHTML = rows;
  }
  try {
    ['a', 'b', 'c'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();
