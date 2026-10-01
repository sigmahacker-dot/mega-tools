/* Hex add/subtract with decimal verification. */
(function () {
  'use strict';
  var SLUG = 'hexadecimal-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var A = $(SLUG + '-a').value.trim().toUpperCase().replace(/^0X/, '');
    var B = $(SLUG + '-b').value.trim().toUpperCase().replace(/^0X/, '');
    var op = $(SLUG + '-op').value;
    if (!/^[0-9A-F]+$/.test(A) || !/^[0-9A-F]+$/.test(B)) { err('Enter valid hex digits (0-9, A-F).'); return; }
    var da = parseInt(A, 16), db = parseInt(B, 16);
    var res = op === '+' ? da + db : da - db;
    var lines = [
      'A = ' + A + '\u2081\u2086 = ' + da + '\u2081\u2080',
      'B = ' + B + '\u2081\u2086 = ' + db + '\u2081\u2080',
      'Decimal: ' + da + ' ' + op + ' ' + db + ' = ' + res,
      'Back to hex: ' + res + '\u2081\u2080 = ' + (res < 0 ? '-' : '') + Math.abs(res).toString(16).toUpperCase() + '\u2081\u2086',
      'Binary check: ' + da.toString(2) + '\u2082 ' + op + ' ' + db.toString(2) + '\u2082 = ' + (res < 0 ? '-' : '') + Math.abs(res).toString(2) + '\u2082'
    ];
    $(SLUG + '-hex').textContent = (res < 0 ? '-' : '') + Math.abs(res).toString(16).toUpperCase();
    $(SLUG + '-dec').textContent = res;
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-a', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-b', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-op', 'change', calc);
    calc();
  } catch (e) {}
})();