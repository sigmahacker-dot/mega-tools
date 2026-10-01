/* Birthday paradox: simulated vs theoretical collision probability. */
(function () {
  'use strict';
  var SLUG = 'birthday-paradox-simulator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function bar(label, pct, color) {
    var wrap = document.createElement('div');
    wrap.style.margin = '8px 0';
    var lab = document.createElement('div');
    lab.style.cssText = 'font-size:13px;margin-bottom:4px';
    lab.textContent = label + ' \u2014 ' + pct.toFixed(2) + '%';
    var track = document.createElement('div');
    track.style.cssText = 'background:#eee;border-radius:6px;height:22px;overflow:hidden';
    var fill = document.createElement('div');
    fill.style.cssText = 'height:100%;width:' + Math.min(100, pct) + '%;background:' + color + ';border-radius:6px';
    track.appendChild(fill);
    wrap.appendChild(lab); wrap.appendChild(track);
    return wrap;
  }
  function theory(n) {
    var pNo = 1;
    for (var i = 0; i < n; i++) pNo *= (365 - i) / 365;
    return (1 - pNo) * 100;
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var n = parseInt($(SLUG + '-n').value, 10);
    var T = parseInt($(SLUG + '-t').value, 10);
    if (isNaN(n) || n < 2 || n > 200) { err('Group size must be 2\u2013200.'); return; }
    if (isNaN(T) || T < 100 || T > 200000) { err('Trials must be 100\u2013200,000.'); return; }
    var hits = 0;
    for (var t = 0; t < T; t++) {
      var seen = {};
      var collided = false;
      for (var i = 0; i < n; i++) {
        var b = Math.floor(Math.random() * 365);
        if (seen[b]) { collided = true; break; }
        seen[b] = true;
      }
      if (collided) hits++;
    }
    var sim = hits / T * 100, th = theory(n);
    $(SLUG + '-sim').textContent = sim.toFixed(2) + '%';
    $(SLUG + '-th').textContent = th.toFixed(2) + '%';
    var host = $(SLUG + '-bars');
    host.innerHTML = '';
    host.appendChild(bar('Simulated (' + hits.toLocaleString('en-US') + '/' + T.toLocaleString('en-US') + ' groups)', sim, '#1976d2'));
    host.appendChild(bar('Theoretical 1 \u2212 \u220F', th, '#7b1fa2'));
    var lines = [
      'Theoretical: P(match) = 1 \u2212 (364/365) \u00D7 (363/365) \u00D7 \u2026 \u00D7 (' + (365 - n + 1) + '/365)',
      '           = 1 \u2212 P(no shared birthday among ' + n + ' people) = ' + th.toFixed(4) + '%',
      'Simulation: ' + T.toLocaleString('en-US') + ' random groups of ' + n + ' \u2192 ' + hits.toLocaleString('en-US') + ' had a shared birthday = ' + sim.toFixed(4) + '%',
      'Why so high? ' + n + ' people make ' + (n * (n - 1) / 2) + ' pairs — each pair is a chance to match.'
    ];
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    calc();
  } catch (e) {}
})();