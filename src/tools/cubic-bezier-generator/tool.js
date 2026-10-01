(function () {
  'use strict';
  var P = 'cubic-bezier-generator-', ERR = P + 'error';
  var raf = null;
  function vals() {
    return [parseFloat(TN.el(P + 'x1').value), parseFloat(TN.el(P + 'y1').value),
            parseFloat(TN.el(P + 'x2').value), parseFloat(TN.el(P + 'y2').value)];
  }
  function bez(t, x1, y1, x2, y2) {
    var u = 1 - t;
    return [3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t,
            3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t];
  }
  function draw(progress) {
    var cv = TN.el(P + 'canvas');
    if (!cv) return;
    var v = vals(), x1 = v[0], y1 = v[1], x2 = v[2], y2 = v[3];
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var pad = 36, gw = W - pad * 2, gh = H - pad * 2 - 26;
    function X(x) { return pad + x * gw; }
    function Y(y) { return pad + gh - y * gh; }
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, gw, gh);
    ctx.strokeStyle = '#9ca3af'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(x1), Y(y1)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(1), Y(1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#4D7C0F'; ctx.lineWidth = 3; ctx.beginPath();
    for (var i = 0; i <= 120; i++) {
      var pt = bez(i / 120, x1, y1, x2, y2);
      if (i === 0) ctx.moveTo(X(pt[0]), Y(pt[1])); else ctx.lineTo(X(pt[0]), Y(pt[1]));
    }
    ctx.stroke();
    ctx.fillStyle = '#166534';
    [[0, 0], [x1, y1], [x2, y2], [1, 1]].forEach(function (q) {
      ctx.beginPath(); ctx.arc(X(q[0]), Y(q[1]), 7, 0, Math.PI * 2); ctx.fill();
    });
    var t = progress == null ? 0 : progress;
    var bp = bez(t, x1, y1, x2, y2);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(X(bp[0]), Y(bp[1]), 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.fillRect(pad, H - 20, Math.max(0, Math.min(1, bp[1])) * gw, 8);
  }
  function update(readout) {
    var v = vals();
    TN.el(P + 'x1-v').textContent = v[0].toFixed(2);
    TN.el(P + 'y1-v').textContent = v[1].toFixed(2);
    TN.el(P + 'x2-v').textContent = v[2].toFixed(2);
    TN.el(P + 'y2-v').textContent = v[3].toFixed(2);
    TN.el(P + 'css').value = 'cubic-bezier(' + v[0].toFixed(2) + ', ' + v[1].toFixed(2) + ', ' + v[2].toFixed(2) + ', ' + v[3].toFixed(2) + ');';
    if (readout !== false) play();
  }
  function play() {
    try {
      if (raf) cancelAnimationFrame(raf);
      var start = null;
      function frame(ts) {
        if (!start) start = ts;
        var t = Math.min(1, (ts - start) / 1500);
        draw(t);
        if (t < 1) raf = requestAnimationFrame(frame);
        else raf = null;
      }
      raf = requestAnimationFrame(frame);
    } catch (e) { TN.setErr(ERR, 'Could not run the preview.'); }
  }
  try {
    ['x1', 'y1', 'x2', 'y2'].forEach(function (k) { TN.on(P + k, 'input', function () { update(false); draw(0); }); });
    TN.on(P + 'preset', 'change', function () {
      var v = TN.el(P + 'preset').value;
      if (!v) return;
      var parts = v.split(',');
      TN.el(P + 'x1').value = parts[0]; TN.el(P + 'y1').value = parts[1];
      TN.el(P + 'x2').value = parts[2]; TN.el(P + 'y2').value = parts[3];
      update();
    });
    TN.on(P + 'replay', 'click', play);
    TN.on(P + 'copy', 'click', function () {
      TN.clearErr(ERR);
      TN.copy(TN.el(P + 'css').value).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy CSS'; }, 1200);
      });
    });
    update(false); draw(0);
  } catch (e) { /* never throw on load */ }
})();
