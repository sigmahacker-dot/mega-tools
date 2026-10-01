/* Collatz sequence explorer with bar chart. */
(function () {
  'use strict';
  var SLUG = 'collatz-sequence-explorer';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var n = parseInt($(SLUG + '-n').value, 10);
    if (isNaN(n) || n < 1 || n > 10000000) { err('Enter a whole number from 1 to 10,000,000.'); return; }
    var seq = [n], cur = n, max = n, guard = 0;
    while (cur !== 1 && guard < 1000000) {
      cur = cur % 2 === 0 ? cur / 2 : 3 * cur + 1;
      seq.push(cur);
      if (cur > max) max = cur;
      guard++;
    }
    var steps = seq.length - 1;
    $(SLUG + '-steps').textContent = steps;
    $(SLUG + '-max').textContent = max.toLocaleString('en-US');
    // bar chart (log scale)
    var chart = $(SLUG + '-chart');
    chart.innerHTML = '';
    var lmax = Math.log10(max + 1);
    var stride = Math.max(1, Math.floor(seq.length / 200));
    for (var i = 0; i < seq.length; i += stride) {
      var bar = document.createElement('div');
      var h = Math.max(2, Math.log10(seq[i] + 1) / lmax * 100);
      bar.style.cssText = 'flex:1;min-width:1px;background:#166534;height:' + h + '%';
      bar.title = seq[i].toLocaleString('en-US');
      chart.appendChild(bar);
    }
    $(SLUG + '-seq').textContent = 'Rule: even \u2192 n/2, odd \u2192 3n+1\n\n' + seq.map(function (x) { return x.toLocaleString('en-US'); }).join(' \u2192 ');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-n', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();