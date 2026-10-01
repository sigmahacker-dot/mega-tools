(function () {
  'use strict';
  var P = 'decision-wheel-';
  var ERR = P + 'error';
  var COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#0d9488', '#b45309'];
  var TAU = Math.PI * 2;
  function g(id) { return document.getElementById(P + id); }
  var canvas = g('canvas'), ctx = canvas ? canvas.getContext('2d') : null;
  var rot = 0, spinning = false, options = [];
  function getOptions() {
    var el = g('options'), out = [];
    if (!el) return out;
    el.value.split('\n').forEach(function (l) { var t = l.trim(); if (t) out.push(t); });
    return out;
  }
  function draw() {
    if (!ctx || !canvas) return;
    var size = canvas.width, cx = size / 2, cy = size / 2, r = size / 2 - 10;
    ctx.clearRect(0, 0, size, size);
    var n = options.length;
    if (!n) {
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
      ctx.fillStyle = '#64748b'; ctx.font = '15px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Add 2–12 options', cx, cy);
      return;
    }
    var step = TAU / n, i, a0, a1, label;
    for (i = 0; i < n; i++) {
      a0 = rot + i * step; a1 = a0 + step;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(a0 + step / 2);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
      label = options[i].length > 22 ? options[i].slice(0, 21) + '…' : options[i];
      ctx.fillText(label, r - 14, 0);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, TAU); ctx.fillStyle = '#0f172a'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 13, 4); ctx.lineTo(cx + 13, 4); ctx.lineTo(cx, 30); ctx.closePath();
    ctx.fillStyle = '#0f172a'; ctx.fill();
  }
  function spin() {
    if (spinning) return;
    TN.clearErr(ERR);
    options = getOptions();
    if (options.length < 2) { TN.setErr(ERR, 'Enter at least 2 options (one per line).'); return; }
    if (options.length > 12) { TN.setErr(ERR, 'Maximum 12 options — you entered ' + options.length + '.'); return; }
    spinning = true;
    var res = g('result');
    if (res) res.innerHTML = '<p class="muted">Spinning…</p>';
    draw();
    var start = rot;
    var target = start + TAU * (5 + Math.random() * 4) + Math.random() * TAU;
    var t0 = null, DUR = 4000;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var t = Math.min(1, (ts - t0) / DUR);
      var e = 1 - Math.pow(1 - t, 3);
      rot = start + (target - start) * e;
      draw();
      if (t < 1) { requestAnimationFrame(frame); return; }
      spinning = false;
      rot = rot % TAU;
      var n = options.length, step = TAU / n;
      var a = (Math.PI * 1.5 - rot) % TAU;
      if (a < 0) a += TAU;
      var idx = Math.floor(a / step) % n;
      if (res) res.innerHTML = '<p class="dw-win">🎉 The wheel has spoken: <strong>' + TN.esc(options[idx]) + '</strong></p>';
      draw();
    }
    requestAnimationFrame(frame);
  }
  try {
    TN.on(P + 'options', 'input', function () { if (!spinning) { options = getOptions().slice(0, 12); draw(); } });
    TN.on(P + 'spin', 'click', spin);
    draw();
  } catch (e) { /* never throw on load */ }
})();
