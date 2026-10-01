/* Monty Hall simulation: stay vs switch. */
(function () {
  'use strict';
  var SLUG = 'monty-hall-simulator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function bar(label, pct, color) {
    var wrap = document.createElement('div');
    wrap.style.margin = '8px 0';
    var lab = document.createElement('div');
    lab.style.cssText = 'font-size:13px;margin-bottom:4px';
    lab.textContent = label + ' \u2014 ' + pct.toFixed(1) + '%';
    var track = document.createElement('div');
    track.style.cssText = 'background:#eee;border-radius:6px;height:22px;overflow:hidden';
    var fill = document.createElement('div');
    fill.style.cssText = 'height:100%;width:' + Math.min(100, pct) + '%;background:' + color + ';border-radius:6px;transition:width .3s';
    track.appendChild(fill);
    wrap.appendChild(lab); wrap.appendChild(track);
    return wrap;
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var N = parseInt($(SLUG + '-n').value, 10);
    var D = parseInt($(SLUG + '-doors').value, 10);
    if (isNaN(N) || N < 100 || N > 1000000) { err('Trials must be 100\u20131,000,000.'); return; }
    if (isNaN(D) || D < 3 || D > 10) { err('Doors must be 3\u201310.'); return; }
    var stayWins = 0, switchWins = 0;
    for (var t = 0; t < N; t++) {
      var prize = Math.floor(Math.random() * D);
      var pick = Math.floor(Math.random() * D);
      if (pick === prize) stayWins++;
      // host opens a non-prize, non-pick door; switching picks uniformly among remaining closed doors
      var remaining = [];
      for (var d = 0; d < D; d++) if (d !== pick && d !== prize) remaining.push(d);
      var opened = remaining[Math.floor(Math.random() * remaining.length)];
      var choices = [];
      for (var d2 = 0; d2 < D; d2++) if (d2 !== pick && d2 !== opened) choices.push(d2);
      var switched = choices[Math.floor(Math.random() * choices.length)];
      if (switched === prize) switchWins++;
    }
    var pStay = stayWins / N * 100, pSwitch = switchWins / N * 100;
    $(SLUG + '-stay').textContent = pStay.toFixed(1) + '%';
    $(SLUG + '-switch').textContent = pSwitch.toFixed(1) + '%';
    var host = $(SLUG + '-bars');
    host.innerHTML = '';
    host.appendChild(bar('Stay (' + stayWins.toLocaleString('en-US') + ' wins)', pStay, '#9e9e9e'));
    host.appendChild(bar('Switch (' + switchWins.toLocaleString('en-US') + ' wins)', pSwitch, '#2e7d32'));
    // theory: P(stay)=1/D; P(switch to random other unopened)= (D-1)/D * 1/(D-2)
    var theorySwitch = (D - 1) / D * 1 / (D - 2) * 100;
    $(SLUG + '-theory').textContent = 'Theory with ' + D + ' doors: stay wins 1/' + D + ' = ' + tStay.toFixed(1) + '%; switching to a random other unopened door wins ' + theorySwitch.toFixed(1) + '%. (Classic 3-door: switching to THE other door wins 66.7%.)';
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    calc();
  } catch (e) {}
})();