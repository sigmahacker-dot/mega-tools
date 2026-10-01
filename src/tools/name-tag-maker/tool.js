/* Name Tag Maker — "Hello, my name is" printable sheets of 4/6/8. */
(function () {
  'use strict';
  var SLUG = 'name-tag-maker';
  var ERR = SLUG + '-error';
  var W = 1240, H = 1754; // A4 ratio

  function v(id) {
    var el = document.getElementById(SLUG + '-' + id);
    return el ? el.value : '';
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTag(ctx, x, y, w, h, name, sub, accent) {
    ctx.save();
    rr(ctx, x, y, w, h, 28);
    ctx.clip();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, h);
    var bandH = h * 0.30;
    ctx.fillStyle = accent;
    ctx.fillRect(x, y, w, bandH);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold ' + Math.round(bandH * 0.30) + 'px Arial, sans-serif';
    ctx.fillText('HELLO', x + w / 2, y + bandH * 0.36);
    ctx.font = Math.round(bandH * 0.20) + 'px Arial, sans-serif';
    ctx.fillText('my name is', x + w / 2, y + bandH * 0.66);
    // name
    ctx.fillStyle = '#111';
    var fs = Math.round(h * 0.20);
    ctx.font = 'bold ' + fs + 'px "Comic Sans MS", "Segoe Print", cursive';
    while (ctx.measureText(name).width > w * 0.9 && fs > 20) {
      fs -= 4; ctx.font = 'bold ' + fs + 'px "Comic Sans MS", "Segoe Print", cursive';
    }
    ctx.fillText(name, x + w / 2, y + bandH + (h - bandH) * 0.52);
    if (sub) {
      ctx.fillStyle = '#555';
      ctx.font = Math.round(h * 0.075) + 'px Arial, sans-serif';
      ctx.fillText(sub, x + w / 2, y + bandH + (h - bandH) * 0.74);
    }
    ctx.restore();
    // border + cut guides
    rr(ctx, x, y, w, h, 28);
    ctx.strokeStyle = '#c9ced4'; ctx.lineWidth = 4; ctx.stroke();
  }

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var name = (v('name') || 'Your Name').trim() || 'Your Name';
    var sub = (v('sub') || '').trim();
    var accent = v('color') || '#d92b2b';
    var count = parseInt(v('count'), 10) || 6;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    var cols = count === 4 ? 2 : (count === 6 ? 2 : 2);
    var rows = count / cols;
    var mx = 60, my = 70;
    var tw = (W - mx * 2) / cols, th = (H - my * 2) / rows;
    var pad = 26;
    for (var i = 0; i < count; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      drawTag(ctx, mx + c * tw + pad, my + r * th + pad, tw - pad * 2, th - pad * 2, name, sub, accent);
    }
    // cut guides
    ctx.strokeStyle = '#d7dbe0';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    for (var gi = 1; gi < cols; gi++) {
      ctx.beginPath(); ctx.moveTo(mx + gi * tw, my); ctx.lineTo(mx + gi * tw, H - my); ctx.stroke();
    }
    for (var gj = 1; gj < rows; gj++) {
      ctx.beginPath(); ctx.moveTo(mx, my + gj * th); ctx.lineTo(W - mx, my + gj * th); ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function save() {
    try {
      localStorage.setItem('tn-' + SLUG + '-name', v('name'));
      localStorage.setItem('tn-' + SLUG + '-sub', v('sub'));
    } catch (e) {}
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    try {
      var sn = localStorage.getItem('tn-' + SLUG + '-name');
      var ss = localStorage.getItem('tn-' + SLUG + '-sub');
      if (sn !== null) document.getElementById(SLUG + '-name').value = sn;
      if (ss !== null) document.getElementById(SLUG + '-sub').value = ss;
    } catch (e) {}
    draw();
    TN.on(SLUG + '-name', 'input', TN.debounce(function () { draw(); save(); }, 150));
    TN.on(SLUG + '-sub', 'input', TN.debounce(function () { draw(); save(); }, 150));
    TN.on(SLUG + '-count', 'change', draw);
    TN.on(SLUG + '-color', 'input', draw);
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      draw();
      var canvas = document.getElementById(SLUG + '-canvas');
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'name-tags-sheet.png');
          else TN.setErr(ERR, 'Could not export the sheet.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the sheet.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
