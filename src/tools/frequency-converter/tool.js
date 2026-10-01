(function () {
  'use strict';
  var S = 'frequency-converter';
  var FREQ = [
    ['Hz', 'Hertz', 1],
    ['kHz', 'Kilohertz', 1e3],
    ['MHz', 'Megahertz', 1e6],
    ['GHz', 'Gigahertz', 1e9],
    ['THz', 'Terahertz', 1e12]
  ];
  var PERIOD = [
    ['s', 'Seconds', 1],
    ['ms', 'Milliseconds', 1e-3],
    ['µs', 'Microseconds', 1e-6],
    ['ns', 'Nanoseconds', 1e-9]
  ];
  function factorOf(list, code) {
    for (var i = 0; i < list.length; i++) if (list[i][0] === code) return list[i][2];
    return 1;
  }
  function fmt(n) {
    if (!isFinite(n) || n < 0) return '–';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e15 || a < 1e-9) return n.toExponential(4);
    return String(Math.round(n * 1e6) / 1e6);
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var raw = TN.el(S + '-value').value;
      var tb = TN.el(S + '-table');
      var perEl = TN.el(S + '-period');
      if (raw === '' || raw === null) {
        if (perEl) perEl.textContent = '–';
        if (tb) {
          var h0 = '';
          for (var j = 0; j < FREQ.length; j++) h0 += '<tr><td>' + FREQ[j][1] + ' (' + FREQ[j][0] + ')</td><td>–</td></tr>';
          tb.innerHTML = h0;
        }
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v)) { TN.setErr(S + '-error', 'Please enter a valid number.'); return; }
      if (v < 0) { TN.setErr(S + '-error', 'Frequency cannot be negative.'); return; }
      var hz = v * factorOf(FREQ, TN.el(S + '-from').value);
      var t = hz > 0 ? 1 / hz : 0;
      /* show period in the largest unit with a readable value */
      var plabel = fmt(t) + ' s';
      if (t > 0) {
        for (var p = PERIOD.length - 1; p >= 0; p--) {
          var pv = t / PERIOD[p][2];
          if (pv >= 1 && pv < 1e6) { plabel = fmt(pv) + ' ' + PERIOD[p][0]; break; }
        }
      }
      if (perEl) perEl.textContent = hz > 0 ? plabel : '– (DC)';
      if (tb) {
        var html = '';
        for (var i = 0; i < FREQ.length; i++) {
          html += '<tr><td>' + FREQ[i][1] + ' (' + FREQ[i][0] + ')</td><td>' + fmt(hz / FREQ[i][2]) + '</td></tr>';
        }
        html += '<tr><td colspan="2"><strong>Period (T = 1/f)</strong></td></tr>';
        for (var q = 0; q < PERIOD.length; q++) {
          html += '<tr><td>' + PERIOD[q][1] + ' (' + PERIOD[q][0] + ')</td><td>' + fmt(t / PERIOD[q][2]) + '</td></tr>';
        }
        tb.innerHTML = html;
      }
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    convert();
    ['value', 'from'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
