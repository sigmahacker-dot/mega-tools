(function () {
  'use strict';
  var ERR = 'investment-return-calculator-error';
  function money(n) {
    try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch (e) { return '$' + String(Math.round(n * 100) / 100); }
  }
  function pct(x, d) {
    try { return (x * 100).toLocaleString('en-US', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }) + '%'; }
    catch (e) { return String(Math.round(x * 10000) / 100) + '%'; }
  }
  function num(id) {
    var el = TN.el(id);
    if (!el) return NaN;
    return parseFloat(el.value);
  }
  function mode() {
    var el = TN.el('invest-mode');
    return el ? el.value : 'cagr';
  }
  function calc() {
    if (!TN.el('invest-start')) return;
    TN.clearErr(ERR);
    var m = mode();
    if (m === 'cagr') {
      TN.show('invest-mode-a'); TN.hide('invest-mode-b');
      TN.show('invest-result-a'); TN.hide('invest-result-b');
      var start = num('invest-start'), end = num('invest-end'), years = num('invest-years');
      if (!(start > 0)) { TN.setErr(ERR, 'Enter a start value greater than 0.'); return; }
      if (isNaN(end) || end < 0) { TN.setErr(ERR, 'Enter an end value of 0 or more.'); return; }
      if (!(years > 0 && years <= 200)) { TN.setErr(ERR, 'Enter a period between 0 and 200 years.'); return; }
      var cagr = Math.pow(end / start, 1 / years) - 1;
      var totalRet = (end - start) / start;
      TN.el('invest-cagr').textContent = pct(cagr);
      TN.el('invest-total-return').textContent = pct(totalRet);
      TN.el('invest-double').textContent = cagr > 0 ? (Math.log(2) / Math.log(1 + cagr)).toFixed(1) + ' years' : '–';
    } else {
      TN.hide('invest-mode-a'); TN.show('invest-mode-b');
      TN.hide('invest-result-a'); TN.show('invest-result-b');
      var s2 = num('invest2-start'), c2 = num('invest2-cagr'), y2 = num('invest2-years');
      if (!(s2 > 0)) { TN.setErr(ERR, 'Enter a start value greater than 0.'); return; }
      if (isNaN(c2) || c2 <= -100) { TN.setErr(ERR, 'Enter a CAGR greater than -100%.'); return; }
      if (!(y2 > 0 && y2 <= 200)) { TN.setErr(ERR, 'Enter a period between 0 and 200 years.'); return; }
      var fv = s2 * Math.pow(1 + c2 / 100, y2);
      TN.el('invest2-fv').textContent = money(fv);
      TN.el('invest2-gain').textContent = money(fv - s2);
    }
  }
  try {
    TN.on('invest-mode', 'change', calc);
    ['invest-start', 'invest-end', 'invest-years', 'invest2-start', 'invest2-cagr', 'invest2-years'].forEach(function (id) {
      TN.on(id, 'input', calc);
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
