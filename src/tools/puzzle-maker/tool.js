/* Puzzle Maker — slice image into N×M tiles; numbered preview; ZIP or contact sheet. */
(function () {
  'use strict';
  var SLUG = 'puzzle-maker';
  var ERR = SLUG + '-error';
  var img = null;
  var MAXW = 2000;

  function dims() {
    var r = parseInt(document.getElementById(SLUG + '-rows').value, 10) || 3;
    var c = parseInt(document.getElementById(SLUG + '-cols').value, 10) || 4;
    return { rows: r, cols: c };
  }

  function tileCanvas(r, c) {
    var d = dims();
    var s = Math.min(1, MAXW / img.naturalWidth);
    var w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
    var tw = Math.floor(w / d.cols), th = Math.floor(h / d.rows);
    var tc = document.createElement('canvas');
    tc.width = tw; tc.height = th;
    var tctx = tc.getContext('2d');
    tctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,
      -c * tw / s, -r * th / s, w / s, h / s);
    return tc;
  }

  function drawPreview() {
    var canvas = document.getElementById(SLUG + '-canvas');
    var info = document.getElementById(SLUG + '-info');
    if (!canvas) return;
    if (!img) {
      canvas.width = 800; canvas.height = 400;
      var c0 = canvas.getContext('2d');
      c0.fillStyle = '#e5e7eb'; c0.fillRect(0, 0, 800, 400);
      c0.fillStyle = '#9aa0a8'; c0.font = '28px Arial, sans-serif'; c0.textAlign = 'center';
      c0.fillText('Choose a photo', 400, 200);
      if (info) info.textContent = '';
      return;
    }
    var d = dims();
    var s = Math.min(1, MAXW / img.naturalWidth);
    var w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    var tw = w / d.cols, th = h / d.rows;
    var showNums = document.getElementById(SLUG + '-numbers').checked;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 3;
    for (var r = 0; r < d.rows; r++) {
      for (var c = 0; c < d.cols; c++) {
        ctx.strokeRect(c * tw + 1.5, r * th + 1.5, tw - 3, th - 3);
        if (showNums) {
          var n = r * d.cols + c + 1;
          ctx.font = 'bold 26px Arial, sans-serif';
          ctx.textAlign = 'left';
          var label = String(n);
          var lw = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
          ctx.fillRect(c * tw + 6, r * th + 6, lw + 16, 36);
          ctx.fillStyle = '#fff';
          ctx.fillText(label, c * tw + 14, r * th + 32);
        }
      }
    }
    if (info) info.textContent = d.rows * d.cols + ' tiles · each ' + Math.floor(img.naturalWidth / d.cols) + ' × ' + Math.floor(img.naturalHeight / d.rows) + ' px';
  }

  function toBlob(canvas) {
    return new Promise(function (res, rej) {
      try { canvas.toBlob(function (b) { b ? res(b) : rej(new Error('encode')); }, 'image/png'); }
      catch (e) { rej(e); }
    });
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    drawPreview();
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      TN.clearErr(ERR);
      TN.readAsDataURL(f).then(TN.loadImage).then(function (im) { img = im; drawPreview(); })
        .catch(function () { TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.'); });
    });
    [['rows'], ['cols']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        var v = document.getElementById(SLUG + '-' + k[0] + '-val');
        if (v) v.textContent = this.value;
        drawPreview();
      });
    });
    TN.on(SLUG + '-numbers', 'change', drawPreview);

    TN.on(SLUG + '-zip', 'click', function () {
      TN.clearErr(ERR);
      if (!img) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      if (typeof JSZip === 'undefined') { TN.setErr(ERR, 'The ZIP library failed to load. Check your connection and reload.'); return; }
      var d = dims();
      var btn = document.getElementById(SLUG + '-zip');
      if (btn) btn.disabled = true;
      var zip = new JSZip();
      var jobs = [];
      for (var r = 0; r < d.rows; r++) {
        for (var c = 0; c < d.cols; c++) {
          (function (r, c) {
            jobs.push(toBlob(tileCanvas(r, c)).then(function (b) {
              zip.file('puzzle-r' + (r + 1) + '-c' + (c + 1) + '.png', b);
            }));
          })(r, c);
        }
      }
      Promise.all(jobs).then(function () {
        return zip.generateAsync({ type: 'blob' });
      }).then(function (blob) {
        TN.download(blob, 'puzzle-tiles.zip');
      }).catch(function () {
        TN.setErr(ERR, 'Could not build the ZIP file.');
      }).then(function () { if (btn) btn.disabled = false; });
    });

    TN.on(SLUG + '-sheet', 'click', function () {
      TN.clearErr(ERR);
      if (!img) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      var d = dims();
      // contact sheet: thumbnails in grid with numbers
      var cell = 220;
      var sheet = document.createElement('canvas');
      sheet.width = d.cols * cell; sheet.height = d.rows * (cell + 34);
      var sctx = sheet.getContext('2d');
      sctx.fillStyle = '#111'; sctx.fillRect(0, 0, sheet.width, sheet.height);
      var done = 0, total = d.rows * d.cols;
      for (var r = 0; r < d.rows; r++) {
        for (var c = 0; c < d.cols; c++) {
          (function (r, c) {
            var tc = tileCanvas(r, c);
            var tw = tc.width, th = tc.height;
            var k = Math.min(cell / tw, cell / th);
            var dw = Math.round(tw * k), dh = Math.round(th * k);
            sctx.drawImage(tc, c * cell + (cell - dw) / 2, r * (cell + 34) + (cell - dh) / 2, dw, dh);
            sctx.fillStyle = '#fff';
            sctx.font = 'bold 20px Arial, sans-serif';
            sctx.textAlign = 'center';
            sctx.fillText('Tile ' + (r * d.cols + c + 1), c * cell + cell / 2, r * (cell + 34) + cell + 24);
            done++;
          })(r, c);
        }
      }
      if (done === total) {
        toBlob(sheet).then(function (b) { TN.download(b, 'puzzle-contact-sheet.png'); })
          .catch(function () { TN.setErr(ERR, 'Could not export the contact sheet.'); });
      }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
