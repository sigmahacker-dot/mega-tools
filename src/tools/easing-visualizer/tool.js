(function () {
  'use strict';
  var P = 'easing-visualizer-', ERR = P + 'error';
  var FNS = {
    linear: { f: function (t) { return t; }, css: 'linear' },
    ease: { f: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, css: 'ease' },
    easeIn: { f: function (t) { return t * t; }, css: 'ease-in' },
    easeOut: { f: function (t) { return 1 - (1 - t) * (1 - t); }, css: 'ease-out' },
    easeInOut: { f: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }, css: 'ease-in-out' },
    easeInCubic: { f: function (t) { return t * t * t; }, css: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)' },
    easeOutCubic: { f: function (t) { return 1 - Math.pow(1 - t, 3); }, css: 'cubic-bezier(0.215, 0.61, 0.355, 1)' },
    easeInOutCubic: { f: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, css: 'cubic-bezier(0.645, 0.045, 0.355, 1)' },
    easeInQuart: { f: function (t) { return t * t * t * t; }, css: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)' },
    easeOutBack: { f: function (t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }, css: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    easeInOutSine: { f: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; }, css: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)' },
    easeOutBounce: { f: function (t) { var n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; }, css: '(bounce has no single cubic-bezier — use a keyframes or JS animation)' }
  };
  var raf = null;
  function draw(fn, progress) {
    var cv = TN.el(P + 'canvas');
    if (!cv) return;
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var pad = 30, gw = W - pad * 2, gh = H - pad * 2;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      ctx.beginPath(); ctx.moveTo(pad, pad + gh * g / 4); ctx.lineTo(pad + gw, pad + gh * g / 4); ctx.stroke();
    }
    ctx.strokeStyle = '#4D7C0F'; ctx.lineWidth = 3; ctx.beginPath();
    for (var i = 0; i <= 100; i++) {
      var t = i / 100, y = fn(t);
      var x = pad + t * gw, yy = pad + gh - Math.max(-0.3, Math.min(1.3, y)) * gh;
      if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    var pt = progress == null ? 0 : progress, py = fn(pt);
    var px = pad + pt * gw, pyy = pad + gh - Math.max(-0.3, Math.min(1.3, py)) * gh;
    ctx.fillStyle = '#166534';
    ctx.beginPath(); ctx.arc(px, pyy, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.fillRect(pad, H - 14, Math.max(0, Math.min(1, py)) * gw, 8);
  }
  function play() {
    try {
      if (raf) cancelAnimationFrame(raf);
      var key = TN.el(P + 'fn').value;
      var entry = FNS[key] || FNS.linear;
      TN.el(P + 'css').value = 'transition-timing-function: ' + entry.css + ';';
      var start = null;
      function frame(ts) {
        if (!start) start = ts;
        var t = Math.min(1, (ts - start) / 1600);
        draw(entry.f, t);
        if (t < 1) raf = requestAnimationFrame(frame);
        else raf = null;
      }
      draw(entry.f, 0);
      raf = requestAnimationFrame(frame);
    } catch (e) { TN.setErr(ERR, 'Could not run the animation.'); }
  }
  try {
    TN.on(P + 'fn', 'change', play);
    TN.on(P + 'replay', 'click', play);
    TN.on(P + 'copy', 'click', function () {
      TN.clearErr(ERR);
      TN.copy(TN.el(P + 'css').value).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy CSS'; }, 1200);
      });
    });
    play();
  } catch (e) { /* never throw on load */ }
})();
