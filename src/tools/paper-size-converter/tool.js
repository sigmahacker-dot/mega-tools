(function () {
  'use strict';
  var P = 'paper-size-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  /* width × height in millimetres */
  var SIZES = [
    { id: 'a0', name: 'A0', w: 841, h: 1189 },
    { id: 'a1', name: 'A1', w: 594, h: 841 },
    { id: 'a2', name: 'A2', w: 420, h: 594 },
    { id: 'a3', name: 'A3', w: 297, h: 420 },
    { id: 'a4', name: 'A4', w: 210, h: 297 },
    { id: 'a5', name: 'A5', w: 148, h: 210 },
    { id: 'a6', name: 'A6', w: 105, h: 148 },
    { id: 'letter', name: 'US Letter', w: 215.9, h: 279.4 },
    { id: 'legal', name: 'US Legal', w: 215.9, h: 355.6 },
    { id: 'tabloid', name: 'Tabloid / Ledger', w: 279.4, h: 431.8 }
  ];
  function find(id) { for (var i = 0; i < SIZES.length; i++) if (SIZES[i].id === id) return SIZES[i]; return SIZES[4]; }
  function f2(n) { return String(Number(n.toFixed(2))); }
  function calc() {
    if (!g('size')) return;
    TN.clearErr(ERR);
    var s = find(g('size').value);
    var dpi = parseFloat(g('dpi').value);
    if (isNaN(dpi) || dpi < 1 || dpi > 2400) { TN.setErr(ERR, 'DPI must be between 1 and 2400.'); return; }
    var wIn = s.w / 25.4, hIn = s.h / 25.4;
    set('mm', s.w + ' × ' + s.h);
    set('in', f2(wIn) + ' × ' + f2(hIn));
    set('px', Math.round(wIn * dpi) + ' × ' + Math.round(hIn * dpi));
    var rows = [
      ['Size', s.name],
      ['Millimetres', s.w + ' × ' + s.h + ' mm'],
      ['Centimetres', f2(s.w / 10) + ' × ' + f2(s.h / 10) + ' cm'],
      ['Inches', f2(wIn) + ' × ' + f2(hIn) + ' in'],
      ['Area', f2(s.w * s.h / 100) + ' cm²'],
      ['Aspect ratio', f2(Math.max(s.w, s.h) / Math.min(s.w, s.h)) + ' : 1'],
      ['Pixels @ ' + dpi + ' DPI', Math.round(wIn * dpi) + ' × ' + Math.round(hIn * dpi) + ' px']
    ];
    var html = '';
    rows.forEach(function (r) {
      html += '<tr><td>' + TN.esc(r[0]) + '</td><td>' + TN.esc(r[1]) + '</td></tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    var sel = g('size');
    SIZES.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id; o.textContent = s.name + ' — ' + s.w + ' × ' + s.h + ' mm';
      sel.appendChild(o);
    });
    sel.value = 'a4';
    TN.on(P + 'size', 'change', calc);
    TN.on(P + 'dpi', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
