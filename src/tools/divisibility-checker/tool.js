/* Divisibility by 2..12 with rule explanations. */
(function () {
  'use strict';
  var SLUG = 'divisibility-checker';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function digitSum(s) { return s.split('').reduce(function (a, c) { return a + parseInt(c, 10); }, 0); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var raw = $(SLUG + '-n').value.trim();
    if (!/^-?\d+$/.test(raw)) { err('Enter a whole number.'); return; }
    var neg = raw.charAt(0) === '-';
    var s = neg ? raw.slice(1) : raw;
    var n = parseInt(s, 10);
    var last = parseInt(s.slice(-1), 10), last2 = parseInt(s.slice(-2), 10);
    var rules = [
      { d: 2, rule: 'Last digit (' + last + ') is even', ok: last % 2 === 0 },
      { d: 3, rule: 'Digit sum = ' + digitSum(s) + ', divisible by 3', ok: digitSum(s) % 3 === 0 },
      { d: 4, rule: 'Last two digits (' + last2 + ') divisible by 4', ok: last2 % 4 === 0 },
      { d: 5, rule: 'Last digit is 0 or 5', ok: last === 0 || last === 5 },
      { d: 6, rule: 'Divisible by both 2 and 3', ok: last % 2 === 0 && digitSum(s) % 3 === 0 },
      { d: 7, rule: 'Double last digit, subtract from rest: checked by division', ok: n % 7 === 0 },
      { d: 8, rule: 'Last three digits (' + parseInt(s.slice(-3), 10) + ') divisible by 8', ok: parseInt(s.slice(-3), 10) % 8 === 0 },
      { d: 9, rule: 'Digit sum = ' + digitSum(s) + ', divisible by 9', ok: digitSum(s) % 9 === 0 },
      { d: 10, rule: 'Last digit is 0', ok: last === 0 },
      { d: 11, rule: 'Alternating digit sum difference divisible by 11', ok: n % 11 === 0 },
      { d: 12, rule: 'Divisible by both 3 and 4', ok: digitSum(s) % 3 === 0 && last2 % 4 === 0 }
    ];
    var html = '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:6px;border-bottom:2px solid #ddd">\u00F7</th><th style="text-align:left;padding:6px;border-bottom:2px solid #ddd">Rule</th><th style="text-align:right;padding:6px;border-bottom:2px solid #ddd">Result</th></tr></thead><tbody>';
    rules.forEach(function (r) {
      html += '<tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">' + r.d + '</td><td style="padding:6px;border-bottom:1px solid #eee" class="muted">' + TN.esc(r.rule) + '</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">' + (r.ok ? '<span style="color:#2e7d32;font-weight:bold">\u2713 Yes</span>' : '<span style="color:#c62828">\u2717 No</span>') + '</td></tr>';
    });
    html += '</tbody></table>';
    $(SLUG + '-table').innerHTML = html;
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-n', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();