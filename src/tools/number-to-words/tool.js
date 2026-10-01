(function () {
  'use strict';
  var P = 'number-to-words-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  var SCALES = [
    [1e15, 'quadrillion'], [1e12, 'trillion'], [1e9, 'billion'],
    [1e6, 'million'], [1e3, 'thousand']
  ];
  function words(n) {
    if (n < 0) return 'minus ' + words(-n);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : '');
    for (var i = 0; i < SCALES.length; i++) {
      if (n >= SCALES[i][0]) {
        var q = Math.floor(n / SCALES[i][0]), r = n % SCALES[i][0];
        return words(q) + ' ' + SCALES[i][1] + (r ? ' ' + words(r) : '');
      }
    }
    return '';
  }
  function calc() {
    if (!g('num')) return;
    TN.clearErr(ERR);
    var raw = g('num').value;
    if (raw === '') { set('words', '–'); set('digits', '–'); return; }
    if (!/^-?\d+$/.test(raw.trim())) { TN.setErr(ERR, 'Enter a whole number (no decimals).'); set('words', '–'); set('digits', '–'); return; }
    var n = parseFloat(raw);
    if (!isFinite(n) || Math.abs(n) > 9007199254740991) {
      TN.setErr(ERR, 'Number is outside the safe range ±9,007,199,254,740,991.');
      set('words', '–'); set('digits', '–'); return;
    }
    set('words', words(n));
    set('digits', String(String(Math.abs(n)).length));
  }
  try {
    TN.on(P + 'num', 'input', calc);
    TN.on(P + 'copy', 'click', function () {
      var t = g('words').textContent;
      if (t && t !== '–') TN.copy(t);
      else TN.setErr(ERR, 'Nothing to copy yet — enter a number first.');
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
