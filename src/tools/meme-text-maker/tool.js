/* Meme Text Maker — Impact-style top/bottom captions, live preview, download. */
(function () {
  'use strict';
  var SLUG = 'meme-text-maker';
  var ERR = SLUG + '-error';
  var img = null;

  function $(id) { return document.getElementById(id); }
  function val(id) { var e = $(id); return e ? e.value : ''; }

  function wrapLines(ctx, text, maxW) {
    var words = text.toUpperCase().split(/\s+/).filter(Boolean);
    var lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawCaption(ctx, text, W, H, fontPx, top) {
    if (!text.trim()) return;
    ctx.font = '900 ' + fontPx + 'px Impact, "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = top ? 'top' : 'bottom';
    var lines = wrapLines(ctx, text, W * 0.94);
    var lineH = fontPx * 1.12;
    var y = top ? H * 0.03 : H - H * 0.03 - lineH * (lines.length - 1);
    ctx.lineWidth = Math.max(2, fontPx / 12);
    ctx.strokeStyle = '#000';
    ctx.fillStyle = val('meme-text-maker-color') || '#fff';
    lines.forEach(function (ln, i) {
      var yy = top ? y + i * lineH : y + i * lineH;
      ctx.strokeText(ln, W / 2, yy);
      ctx.fillText(ln, W / 2, yy);
    });
  }

  function render() {
    if (!img) return;
    TN.clearErr(ERR);
    var cv = $('meme-text-maker-canvas');
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    var ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var sizePct = parseInt(val('meme-text-maker-size'), 10) || 10;
    $('meme-text-maker-size-v').textContent = sizePct;
    var fontPx = Math.round(cv.width * sizePct / 100);
    drawCaption(ctx, val('meme-text-maker-top'), cv.width, cv.height, fontPx, true);
    drawCaption(ctx, val('meme-text-maker-bottom'), cv.width, cv.height, fontPx, false);
    $('meme-text-maker-result').hidden = false;
    $('meme-text-maker-dl').disabled = false;
  }

  try {
    TN.on('meme-text-maker-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () { img = im; URL.revokeObjectURL(url); render(); };
      im.onerror = function () { URL.revokeObjectURL(url); TN.setErr(ERR, 'Could not read that file as an image.'); };
      im.src = url;
    });
    ['meme-text-maker-top', 'meme-text-maker-bottom', 'meme-text-maker-size', 'meme-text-maker-color'].forEach(function (id) {
      TN.on(id, 'input', render);
      TN.on(id, 'change', render);
    });
    TN.on('meme-text-maker-dl', 'click', function () {
      $('meme-text-maker-canvas').toBlob(function (b) {
        if (!b) { TN.setErr(ERR, 'Could not export the meme.'); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'meme.png';
        document.body.appendChild(a); a.click();
        setTimeout(function () { document.body.removeChild(a); }, 100);
      }, 'image/png');
    });
  } catch (e) { /* never throw on load */ }
})();
