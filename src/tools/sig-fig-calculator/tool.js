/* Significant figures counter + rounder. */
(function () {
  'use strict';
  var SLUG = 'sig-fig-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function countSig(s) {
    // returns {count, notes[]}
    var notes = [];
    s = s.replace(/^[-+]/, '');
    var sci = s.match(/^(\d+(?:\.\d+)?)[eE]([-+]?\d+)$/);
    var mant = sci ? sci[1] : s;
    var ip = mant.split('.')[0] || '', fp = mant.split('.')[1] || '';
    var hasDot = mant.indexOf('.') >= 0;
    var digits = (ip + fp).replace(/^0+/, '');
    if (digits === '') return { count: 1, notes: ['Zero has 1 significant figure.'] };
    notes.push('Leading zeros are never significant.');
    var stripped = digits;
    if (!hasDot) {
      stripped = digits.replace(/0+$/, '');
      if (stripped.length !== digits.length) notes.push('Trailing zeros without a decimal point are ambiguous \u2014 treated as NOT significant here.');
    } else {
      notes.push('The decimal point makes trailing zeros significant.');
    }
    notes.push('Captive zeros (between non-zero digits) are significant.');
    return { count: stripped.length, notes: notes };
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var raw = $(SLUG + '-num').value.trim();
    var n = parseInt($(SLUG + '-n').value, 10);
    if (!/^-?\d*(\.\d+)?([eE][-+]?\d+)?$/.test(raw) || raw === '' || raw === '-' || raw === '.') { err('Enter a valid number.'); return; }
    if (!(n >= 1 && n <= 21)) { err('N must be between 1 and 21.'); return; }
    var r = countSig(raw);
    var val = parseFloat(raw);
    var rounded;
    if (val === 0) rounded = '0';
    else rounded = Number(val.toPrecision(n)).toString();
    var lines = [];
    lines.push('Number: ' + raw);
    r.notes.forEach(function (t) { lines.push('\u2022 ' + t); });
    lines.push('');
    lines.push('Significant figures: ' + r.count);
    lines.push('Rounded to ' + n + ' sig fig' + (n > 1 ? 's' : '') + ': ' + rounded + '   (via toPrecision(' + n + '))');
    $(SLUG + '-count').textContent = r.count;
    $(SLUG + '-rounded').textContent = rounded;
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-num', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-n', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();