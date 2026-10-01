/* Image Caption Adder — caption bar top/bottom with font/color controls. */
(function () {
  'use strict';
  var SLUG = 'image-caption-adder';
  var ERR = SLUG + '-error';
  var img = null;
  var MAXW = 1600;

  function wrapText(ctx, text, maxW) {
    var words = text.split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW) { if (line) lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    return lines.slice(0, 4);
  }

  function apply() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    var textEl = document.getElementById(SLUG + '-text');
    var pos = document.getElementById(SLUG + '-pos').value;
    var size = parseInt(document.getElementById(SLUG + '-size').value, 10) || 44;
    var pad = parseInt(document.getElementById(SLUG + '-pad').value, 10) || 24;
    var fg = document.getElementById(SLUG + '-fg').value;
    var bg = document.getElementById(SLUG + '-bg').value;
    var text = textEl ? textEl.value.trim() : '';

    var meas = document.createElement('canvas').getContext('2d');
    meas.font = size + 'px Arial, sans-serif';
    var lines = text ? wrapText(meas, text, 1e9) : [];
    // measure against real width once image known
    var w = img ? Math.min(MAXW, img.naturalWidth) : 800;
    var s = img ? w / img.naturalWidth : 1;
    var ih = img ? Math.round(img.naturalHeight * s) : 500;
    meas.font = size + 'px Arial, sans-serif';
    lines = text ? wrapText(meas, text, w - pad * 4) : [];
    var barH = text ? Math.round(lines.length * size * 1.32 + pad * 2) : 0;

    canvas.width = w;
    canvas.height = ih + barH;
    var ctx = canvas.getContext('2d');
    if (img) {
      if (pos === 'top') ctx.drawImage(img, 0, barH, w, ih);
      else ctx.drawImage(img, 0, 0, w, ih);
    } else {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, pos === 'top' ? barH : 0, w, ih);
      ctx.fillStyle = '#9aa0a8';
      ctx.font = '28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Choose a photo', w / 2, (pos === 'top' ? barH : 0) + ih / 2);
    }
    if (text) {
      var by = pos === 'top' ? 0 : ih;
      ctx.fillStyle = bg;
      ctx.fillRect(0, by, w, barH);
      ctx.fillStyle = fg;
      ctx.font = size + 'px Arial, sans-serif';
      ctx.textAlign = 'center';
      lines.forEach(function (ln, i) {
        ctx.fillText(ln, w / 2, by + pad + size * 0.95 + i * size * 1.32);
      });
    }
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    apply();
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      TN.clearErr(ERR);
      TN.readAsDataURL(f).then(TN.loadImage).then(function (im) { img = im; apply(); })
        .catch(function () { TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.'); });
    });
    TN.on(SLUG + '-text', 'input', TN.debounce(apply, 120));
    TN.on(SLUG + '-pos', 'change', apply);
    TN.on(SLUG + '-fg', 'input', apply);
    TN.on(SLUG + '-bg', 'input', apply);
    [['size'], ['pad']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        var v = document.getElementById(SLUG + '-' + k[0] + '-val');
        if (v) v.textContent = this.value;
        apply();
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      var canvas = document.getElementById(SLUG + '-canvas');
      if (!img) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'captioned-image.png');
          else TN.setErr(ERR, 'Could not export the image.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the image.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
