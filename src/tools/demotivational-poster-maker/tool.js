/* Demotivational Poster Maker — black poster, bordered photo, serif title + italic caption. */
(function () {
  'use strict';
  var SLUG = 'demotivational-poster-maker';
  var ERR = SLUG + '-error';
  var W = 900, H = 1150;
  var img = null;

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // photo area
    var m = 60, bw = 4; // margin, border
    var areaW = W - m * 2, areaH = 660;
    if (img) {
      var s = Math.min(areaW / img.naturalWidth, areaH / img.naturalHeight);
      var dw = Math.round(img.naturalWidth * s), dh = Math.round(img.naturalHeight * s);
      var dx = Math.round((W - dw) / 2), dy = m + Math.round((areaH - dh) / 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(dx - bw, dy - bw, dw + bw * 2, dh + bw * 2);
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(m, m, areaW, areaH);
      ctx.fillStyle = '#666';
      ctx.font = '28px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Choose an image to begin', W / 2, m + areaH / 2);
    }

    // title
    var titleEl = document.getElementById(SLUG + '-title');
    var sizeEl = document.getElementById(SLUG + '-size');
    var title = titleEl ? titleEl.value.trim() : '';
    var size = sizeEl ? parseInt(sizeEl.value, 10) || 72 : 72;
    ctx.fillStyle = '#f5f5f5';
    ctx.textAlign = 'center';
    try { ctx.letterSpacing = '8px'; } catch (e) {}
    ctx.font = size + 'px Georgia, "Times New Roman", serif';
    var ty = m + areaH + 110;
    // shrink to fit
    while (ctx.measureText(title).width > W - 120 && size > 24) {
      size -= 2;
      ctx.font = size + 'px Georgia, "Times New Roman", serif';
    }
    ctx.fillText(title, W / 2, ty);
    try { ctx.letterSpacing = '0px'; } catch (e) {}

    // caption
    var capEl = document.getElementById(SLUG + '-caption');
    var cap = capEl ? capEl.value.trim() : '';
    if (cap) {
      ctx.fillStyle = '#cfcfcf';
      ctx.font = 'italic 30px Georgia, serif';
      var words = cap.split(/\s+/), lines = [], line = '';
      words.forEach(function (w) {
        var t = line ? line + ' ' + w : w;
        if (ctx.measureText(t).width > W - 160) { lines.push(line); line = w; }
        else line = t;
      });
      if (line) lines.push(line);
      lines.slice(0, 3).forEach(function (ln, i) {
        ctx.fillText(ln, W / 2, ty + 70 + i * 44);
      });
    }
  }

  function canvasToBlob(canvas) {
    return new Promise(function (res, rej) {
      try {
        canvas.toBlob(function (b) { b ? res(b) : rej(new Error('encode failed')); }, 'image/png');
      } catch (e) { rej(e); }
    });
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    draw();
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      TN.clearErr(ERR);
      TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
        img = im;
        draw();
      }).catch(function () {
        TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
      });
    });
    TN.on(SLUG + '-title', 'input', TN.debounce(draw, 120));
    TN.on(SLUG + '-caption', 'input', TN.debounce(draw, 120));
    TN.on(SLUG + '-size', 'input', function () {
      var v = document.getElementById(SLUG + '-size-val');
      if (v) v.textContent = this.value;
      draw();
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      if (!img) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      draw();
      canvasToBlob(document.getElementById(SLUG + '-canvas')).then(function (b) {
        TN.download(b, 'demotivational-poster.png');
      }).catch(function () {
        TN.setErr(ERR, 'Could not export the poster. Try a different browser.');
      });
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
