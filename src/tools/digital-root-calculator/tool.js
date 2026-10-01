/* Digital root with repeated digit-sum steps. */
(function () {
  'use strict';
  var SLUG = 'digital-root-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var raw = $(SLUG + '-n').value.trim();
    if (!/^-?\d+$/.test(raw)) { err('Enter a whole number.'); return; }
    var s = raw.charAt(0) === '-' ? raw.slice(1) : raw;
    var lines = [];
    var cur = s, steps = 0;
    lines.push('Start: ' + s);
    while (cur.length > 1) {
      var digits = cur.split('');
      var sum = digits.reduce(function (a, c) { return a + parseInt(c, 10); }, 0);
      steps++;
      lines.push('Step ' + steps + ': ' + digits.join(' + ') + ' = ' + sum);
      cur = String(sum);
    }
    var dr = parseInt(cur, 10);
    // exact formula via BigInt-free mod: dr = 1 + (n-1) % 9
    var mod = 0;
    for (var i = 0; i < s.length; i++) mod = (mod * 10 + parseInt(s[i], 10)) % 9;
    var drCheck = s.replace(/0/g, '') === '' ? 0 : (mod === 0 ? 9 : mod);
    lines.push('');
    lines.push('Digital root = ' + dr + '   (casting-out-nines check: ' + drCheck + (dr === drCheck ? ' \u2713 matches' : ''));
    lines.push('Additive persistence (steps taken): ' + steps);
    $(SLUG + '-dr').textContent = dr;
    $(SLUG + '-add').textContent = steps;
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-n', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();