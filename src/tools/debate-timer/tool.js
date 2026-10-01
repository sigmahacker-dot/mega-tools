(function () {
  'use strict';
  var P = 'debate-timer-', ERR = P + 'error';
  var segs = [{ name: 'Opening', mins: 5 }, { name: 'Rebuttal', mins: 3 }, { name: 'Closing', mins: 2 }];
  var idx = 0, remain = 0, timerId = null, warned = false, ended = false, audio = null;
  function g(id) { return TN.el(P + id); }
  function fmt(s) {
    s = Math.ceil(s);
    var m = Math.floor(Math.abs(s) / 60), ss = Math.abs(s) % 60;
    return (s < 0 ? '−' : '') + String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }
  function beep(times) {
    try {
      if (!audio) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audio = new AC();
      }
      if (audio.state === 'suspended') audio.resume();
      var t0 = audio.currentTime;
      for (var i = 0; i < times; i++) {
        var o = audio.createOscillator(), gn = audio.createGain();
        o.type = 'sine'; o.frequency.value = 880;
        var t = t0 + i * 0.45;
        gn.gain.setValueAtTime(0.0001, t);
        gn.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        o.connect(gn); gn.connect(audio.destination);
        o.start(t); o.stop(t + 0.42);
      }
    } catch (e) { /* audio unavailable */ }
  }
  function renderSegs() {
    var h = '<table class="data"><tbody>' + segs.map(function (s, i) {
      return '<tr' + (i === idx ? ' style="background:#16653433"' : '') + '><td>' + (i + 1) + '</td><td><b>' + TN.esc(s.name) + '</b></td><td>' + s.mins + ' min</td>' +
        '<td><button type="button" class="btn btn-outline btn-sm" data-rmseg="' + i + '">Remove</button></td></tr>';
    }).join('') + '</tbody></table>';
    g('segs').innerHTML = h;
    var btns = g('segs').querySelectorAll('[data-rmseg]');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        TN.on(b, 'click', function () {
          stop();
          segs.splice(parseInt(b.getAttribute('data-rmseg'), 10), 1);
          if (!segs.length) segs.push({ name: 'Speech', mins: 5 });
          idx = 0;
          resetClock(); renderSegs();
        });
      })(btns[i]);
    }
  }
  function resetClock() {
    remain = segs[idx].mins * 60;
    warned = false; ended = false;
    update();
  }
  function update() {
    g('cur-label').textContent = segs[idx] ? segs[idx].name + ' (' + (idx + 1) + '/' + segs.length + ')' : 'Done';
    var clock = g('clock');
    clock.textContent = (remain < 0 ? '+' : '') + fmt(remain).replace('−', '');
    if (remain < 0) { clock.textContent = '+' + fmt(-remain); clock.style.color = '#f87171'; }
    else { clock.style.color = ''; }
    g('next').textContent = segs[idx + 1] ? 'Next: ' + segs[idx + 1].name + ' (' + segs[idx + 1].mins + ' min)' : (idx >= segs.length - 1 && remain < 0 ? 'All segments complete.' : '');
  }
  function stop() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    g('start').textContent = 'Start';
  }
  function tick() {
    remain -= 1;
    if (!warned && remain === 60) { warned = true; beep(1); }
    if (!ended && remain <= 0) { ended = true; beep(3); }
    update();
  }
  try {
    if (!TN.el(P + 'start')) return;
    renderSegs(); resetClock();
    TN.on(P + 'add', 'click', function () {
      TN.clearErr(ERR);
      var name = g('name').value.trim() || 'Segment ' + (segs.length + 1);
      var mins = parseFloat(g('mins').value);
      if (isNaN(mins) || mins < 0.5 || mins > 120) { TN.setErr(ERR, 'Minutes must be 0.5–120.'); return; }
      stop();
      segs.push({ name: name, mins: mins });
      g('name').value = '';
      renderSegs();
    });
    TN.on(P + 'start', 'click', function () {
      TN.clearErr(ERR);
      if (!segs.length) { TN.setErr(ERR, 'Add at least one segment.'); return; }
      beep(0); // unlock audio on user gesture
      if (timerId) { stop(); return; }
      g('start').textContent = 'Pause';
      timerId = setInterval(tick, 1000);
    });
    TN.on(P + 'nextbtn', 'click', function () {
      stop();
      if (idx < segs.length - 1) { idx++; resetClock(); renderSegs(); }
      else { TN.setErr(ERR, 'That was the last segment — press Reset to run the round again.'); }
    });
    TN.on(P + 'reset', 'click', function () {
      stop(); idx = 0; resetClock(); renderSegs(); TN.clearErr(ERR);
    });
  } catch (e) { /* never throw on load */ }
})();
