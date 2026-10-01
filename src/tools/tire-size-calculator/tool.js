(function () {
  'use strict';
  var P = 'tire-size-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function f1(n) { return String(Number(n.toFixed(1))); }
  function f2(n) { return String(Number(n.toFixed(2))); }
  function tire(w, a, r) {
    var sidewall = w * a / 100;              /* mm */
    var diaIn = r + 2 * sidewall / 25.4;     /* inches */
    var diaMm = diaIn * 25.4;                /* mm */
    var circMm = Math.PI * diaMm;            /* mm */
    return { sidewall: sidewall, diaIn: diaIn, diaMm: diaMm, circMm: circMm, revKm: 1e6 / circMm };
  }
  function blank() {
    set('diff', '–'); set('speedo', '–'); set('safe', '–');
    g('body').innerHTML = '<tr><td colspan="3" class="muted">Enter both tire sizes to compare.</td></tr>';
  }
  function calc() {
    if (!g('w1')) return;
    TN.clearErr(ERR);
    var keys = ['w1', 'a1', 'r1', 'w2', 'a2', 'r2'];
    var vals = {};
    for (var i = 0; i < keys.length; i++) {
      var raw = g(keys[i]).value;
      if (raw === '') { blank(); return; }
      var v = parseFloat(raw);
      if (isNaN(v) || v <= 0) { TN.setErr(ERR, 'Enter positive numbers for width, aspect ratio and rim.'); blank(); return; }
      vals[keys[i]] = v;
    }
    var t1 = tire(vals.w1, vals.a1, vals.r1);
    var t2 = tire(vals.w2, vals.a2, vals.r2);
    var diffPct = (t2.diaMm - t1.diaMm) / t1.diaMm * 100;
    var trueSpeed = 100 * t2.circMm / t1.circMm;
    set('diff', (diffPct >= 0 ? '+' : '') + f2(diffPct) + '%');
    set('speedo', f1(trueSpeed) + ' km/h');
    set('safe', Math.abs(diffPct) <= 3 ? 'Yes ✓' : 'No ✗');
    var rows = [
      ['Size label', vals.w1 + '/' + vals.a1 + 'R' + vals.r1, vals.w2 + '/' + vals.a2 + 'R' + vals.r2],
      ['Sidewall height', f1(t1.sidewall) + ' mm', f1(t2.sidewall) + ' mm'],
      ['Overall diameter', f2(t1.diaIn) + ' in (' + f1(t1.diaMm) + ' mm)', f2(t2.diaIn) + ' in (' + f1(t2.diaMm) + ' mm)'],
      ['Circumference', f1(t1.circMm) + ' mm', f1(t2.circMm) + ' mm'],
      ['Revolutions per km', f1(t1.revKm), f1(t2.revKm)]
    ];
    var html = '';
    rows.forEach(function (r) {
      html += '<tr><td>' + TN.esc(r[0]) + '</td><td>' + TN.esc(r[1]) + '</td><td>' + TN.esc(r[2]) + '</td></tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    ['w1', 'a1', 'r1', 'w2', 'a2', 'r2'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();
