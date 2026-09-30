/* Meme Generator — canvas render with classic stroked captions, live preview. */
(function () {
  'use strict';
  var SLUG = 'meme-generator';
  var baseImg = null;
  var renderT = null;

  function $(id) { return document.getElementById(id); }
  function errId() { return SLUG + '-error'; }

  function setFile(f) {
    if (!f) return;
    TN.clearErr(errId());
    TN.readAsDataURL(f).then(TN.loadImage).then(function (img) {
      if (!img.naturalWidth || !img.naturalHeight) throw new Error('unreadable');
      baseImg = img;
      scheduleRender();
    }).catch(function () {
      TN.setErr(errId(), 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
    });
  }

  function wrapLines(ctx, text, maxW) {
    var words = String(text).split(/\s+/).filter(function (w) { return w.length; });
    var lines = [];
    var line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (line && ctx.measureText(t).width > maxW) {
        lines.push(line);
        line = w;
      } else {
        line = t;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawCaption(ctx, text, W, size, color, top) {
    var lines = wrapLines(ctx, text, W * 0.92);
    if (!lines.length) return;
    ctx.font = 'bold ' + size + 'px Impact, "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, Math.round(size / 9));
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = color;
    var step = size * 1.12;
    if (top) {
      ctx.textBaseline = 'top';
      var y = size * 0.25;
      lines.forEach(function (ln) {
        ctx.strokeText(ln, W / 2, y);
        ctx.fillText(ln, W / 2, y);
        y += step;
      });
    } else {
      ctx.textBaseline = 'bottom';
      var H = ctx.canvas.height;
      var yb = H - size * 0.25;
      for (var i = lines.length - 1; i >= 0; i--) {
        ctx.strokeText(lines[i], W / 2, yb);
        ctx.fillText(lines[i], W / 2, yb);
        yb -= step;
      }
    }
  }

  function render() {
    var canvas = $(SLUG + '-canvas');
    if (!canvas) return;
    var size = parseInt($(SLUG + '-size').value, 10) || 56;
    var color = $(SLUG + '-color').value || '#ffffff';
    var top = ($(SLUG + '-top').value || '').toUpperCase();
    var bottom = ($(SLUG + '-bottom').value || '').toUpperCase();
    var W, H;
    if (baseImg) {
      var scale = 1;
      var longest = Math.max(baseImg.naturalWidth, baseImg.naturalHeight);
      if (longest > 1600) scale = 1600 / longest;
      W = Math.round(baseImg.naturalWidth * scale);
      H = Math.round(baseImg.naturalHeight * scale);
    } else {
      W = 900; H = 900;
    }
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (baseImg) {
      ctx.drawImage(baseImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = $(SLUG + '-bg').value || '#1e293b';
      ctx.fillRect(0, 0, W, H);
    }
    drawCaption(ctx, top, W, size, color, true);
    drawCaption(ctx, bottom, W, size, color, false);
  }

  function scheduleRender() {
    if (renderT) clearTimeout(renderT);
    renderT = setTimeout(render, 60);
  }

  function download() {
    var canvas = $(SLUG + '-canvas');
    if (!canvas || !canvas.width) {
      TN.setErr(errId(), 'Nothing to download yet.');
      return;
    }
    TN.clearErr(errId());
    try {
      canvas.toBlob(function (b) {
        if (b) TN.download(b, 'meme.png');
        else TN.setErr(errId(), 'Could not encode the meme. Try a different browser.');
      }, 'image/png');
    } catch (e) {
      TN.setErr(errId(), 'Could not encode the meme. Try a different browser.');
    }
  }

  function init() {
    var dz = $(SLUG + '-drop');
    var input = $(SLUG + '-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      input.value = '';
      setFile(f);
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      setFile(f);
    });

    ['top', 'bottom', 'color', 'bg'].forEach(function (k) {
      TN.on(SLUG + '-' + k, 'input', scheduleRender);
    });
    var sz = $(SLUG + '-size');
    var szv = $(SLUG + '-size-val');
    if (sz) sz.addEventListener('input', function () {
      if (szv) szv.textContent = sz.value;
      scheduleRender();
    });

    TN.on(SLUG + '-download', 'click', download);
    TN.on(SLUG + '-clear', 'click', function () {
      baseImg = null;
      scheduleRender();
    });

    render();
  }

  try { init(); } catch (e) { /* never throw on page load */ }
})();
