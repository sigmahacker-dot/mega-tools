/* Mood Board Maker — collage canvas from multiple uploaded images. */
(function () {
  'use strict';
  var SLUG = 'mood-board-maker';
  var ERR = SLUG + '-error';
  var W = 1200, H = 900;
  var imgs = [];

  // layout: rows of [fraction widths] per row count
  function layout(n) {
    if (n <= 1) return [[1]];
    if (n === 2) return [[0.5, 0.5]];
    if (n === 3) return [[0.5, 0.5], [1]];
    if (n === 4) return [[0.5, 0.5], [0.5, 0.5]];
    if (n === 5) return [[0.4, 0.6], [0.34, 0.33, 0.33]];
    if (n === 6) return [[0.34, 0.33, 0.33], [0.34, 0.33, 0.33]];
    if (n === 7) return [[0.5, 0.5], [0.34, 0.33, 0.33], [0.5, 0.5]];
    if (n === 8) return [[0.34, 0.33, 0.33], [0.25, 0.25, 0.25, 0.25], [0.5, 0.5]];
    return [[0.34, 0.33, 0.33], [0.34, 0.33, 0.33], [0.34, 0.33, 0.33]];
  }

  function drawCover(ctx, im, x, y, w, h) {
    var s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    var dw = im.naturalWidth * s, dh = im.naturalHeight * s;
    ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var bgEl = document.getElementById(SLUG + '-bg');
    var titleEl = document.getElementById(SLUG + '-title');
    var bg = bgEl ? bgEl.value : '#f4f1ea';
    var title = titleEl ? titleEl.value.trim() : '';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var GAP = 14, PAD = 30, TITLE_H = title ? 110 : 20;
    var n = imgs.length;
    if (!n) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.font = '30px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Choose up to 9 images to build your mood board', W / 2, H / 2);
      return;
    }
    var rows = layout(n);
    var ay = PAD + TITLE_H, ah = H - ay - PAD;
    var rh = ah / rows.length;
    var idx = 0;
    rows.forEach(function (cols, ri) {
      var rx = PAD, rw = W - PAD * 2;
      var y = ay + ri * rh;
      cols.forEach(function (frac) {
        var w = rw * frac - GAP, h = rh - GAP;
        if (idx < n && imgs[idx]) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(rx, y, w, h);
          ctx.clip();
          drawCover(ctx, imgs[idx], rx, y, w, h);
          ctx.restore();
        }
        idx++;
        rx += rw * frac;
      });
    });

    if (title) {
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.font = 'bold 56px Georgia, serif';
      ctx.textAlign = 'left';
      var t = title;
      while (ctx.measureText(t).width > W - PAD * 2 && t.length > 4) t = t.slice(0, -1);
      ctx.fillText(t, PAD, PAD + 62);
    }
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    draw();
    TN.on(SLUG + '-file', 'change', function () {
      var files = this.files ? Array.prototype.slice.call(this.files, 0, 9) : [];
      if (!files.length) return;
      TN.clearErr(ERR);
      var loaded = 0;
      files.forEach(function (f) {
        TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
          if (imgs.length < 9) imgs.push(im);
          loaded++;
          if (loaded === files.length) draw();
        }).catch(function () {
          loaded++;
          if (loaded === files.length) draw();
        });
      });
    });
    TN.on(SLUG + '-title', 'input', TN.debounce(draw, 150));
    TN.on(SLUG + '-bg', 'input', draw);
    TN.on(SLUG + '-clear', 'click', function () {
      imgs = [];
      var f = document.getElementById(SLUG + '-file');
      if (f) f.value = '';
      draw();
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      if (!imgs.length) { TN.setErr(ERR, 'Choose at least one image first.'); return; }
      draw();
      var canvas = document.getElementById(SLUG + '-canvas');
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'mood-board.png');
          else TN.setErr(ERR, 'Could not export the board.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the board.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
