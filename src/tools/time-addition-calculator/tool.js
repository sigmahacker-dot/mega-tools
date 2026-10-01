(function () {
  'use strict';
  var ERR = 'time-addition-calculator-error';

  function parseLine(line) {
    var s = line.trim();
    if (!s) return null;
    var neg = false;
    if (s[0] === '-' || s[0] === '−') { neg = true; s = s.slice(1).trim(); }
    var sign = neg ? -1 : 1;
    var m;
    if ((m = /^(\d+)\s*:\s*(\d{1,2})$/.exec(s))) {
      if (Number(m[2]) > 59) throw new Error('Minutes must be 0–59 in "' + line.trim() + '".');
      return sign * (Number(m[1]) * 60 + Number(m[2]));
    }
    if ((m = /^(\d+(?:\.\d+)?)\s*h(?:ours?)?$/i.exec(s))) return sign * Number(m[1]) * 60;
    if ((m = /^(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?$/i.exec(s))) return sign * Number(m[1]);
    if ((m = /^(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?$/i.exec(s))) return sign * Number(m[1]) / 60;
    if ((m = /^(\d+(?:\.\d+)?)$/.exec(s))) return sign * Number(m[1]); // bare = minutes
    throw new Error('Could not parse "' + line.trim() + '".');
  }

  function calc() {
    TN.clearErr(ERR);
    try {
      var el = TN.el('time-addition-calculator-input');
      var lines = el ? el.value.split('\n') : [];
      var total = 0, count = 0;
      lines.forEach(function (ln) {
        var v = parseLine(ln);
        if (v !== null) { total += v; count++; }
      });
      if (!count) throw new Error('Enter at least one duration.');
      var neg = total < 0;
      var abs = Math.abs(total);
      var h = Math.floor(abs / 60);
      var mm = Math.round(abs % 60);
      if (mm === 60) { h++; mm = 0; }
      var hmm = (neg ? '−' : '') + h + ':' + ('0' + mm).slice(-2);
      TN.el('time-addition-calculator-hmm').textContent = hmm;
      TN.el('time-addition-calculator-dec').textContent = parseFloat((total / 60).toFixed(4)).toString() + ' h';
      TN.el('time-addition-calculator-min').textContent = parseFloat(total.toFixed(2)).toString() + ' min';
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('time-addition-calculator-go', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
