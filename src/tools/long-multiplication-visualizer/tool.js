/* Long multiplication with partial products and place-value shifts. */
(function () {
  'use strict';
  var SLUG = 'long-multiplication-visualizer';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function pad(s, w) { s = String(s); while (s.length < w) s = ' ' + s; return s; }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var A = $(SLUG + '-a').value.trim(), B = $(SLUG + '-b').value.trim();
    if (!/^-?\d+$/.test(A) || !/^-?\d+$/.test(B)) { err('Enter whole numbers only.'); return; }
    var a = Math.abs(parseInt(A, 10)), b = Math.abs(parseInt(B, 10));
    var neg = (/^-/.test(A)) !== (/^-/.test(B));
    var bDigits = String(b).split('').reverse();
    var partials = bDigits.map(function (d, i) { return { v: a * parseInt(d, 10), shift: i, digit: d }; });
    var total = a * b;
    var width = Math.max(String(a).length, String(b).length + 2, String(total).length, 12);
    var lines = [];
    lines.push(pad(A, width));
    lines.push('\u00D7' + pad(B, width - 1));
    lines.push('-'.repeat(width));
    partials.forEach(function (p, i) {
      var row = pad(String(p.v) + '0'.repeat(p.shift), width);
      var note = '   (' + a + ' \u00D7 ' + p.digit + (p.shift ? ' \u00D7 ' + Math.pow(10, p.shift) + ' — shifted ' + p.shift + ' place' + (p.shift > 1 ? 's' : '') : '') + ')';
      lines.push(row + note);
    });
    lines.push('-'.repeat(width));
    lines.push(pad((neg && total ? '-' : '') + total, width));
    lines.push('');
    lines.push('Product = ' + (neg && total ? '-' : '') + total);
    $(SLUG + '-res').textContent = (neg && total ? '-' : '') + total;
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-a', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-b', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();