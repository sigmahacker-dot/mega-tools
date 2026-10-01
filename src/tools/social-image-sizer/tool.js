/* Social Image Sizer — resize to exact social platform dimensions, cover/fit modes. */
(function () {
  'use strict';
  var SLUG = 'social-image-sizer';
  var ERR = SLUG + '-error';
  var img = null;
  var outUrl = null;

  function $(id) { return document.getElementById(id); }

  function dims() {
    var p = $('social-image-sizer-preset').value;
    if (p === 'custom') {
      var w = parseInt($('social-image-sizer-cw').value, 10);
      var h = parseInt($('social-image-sizer-ch').value, 10);
      return { w: w, h: h };
    }
    var parts = p.split('x');
    return { w: parseInt(parts[0], 10), h: parseInt(parts[1], 10) };
  }

  function render() {
    if (!img) return;
    var d = dims();
    if (!(d.w > 0 && d.h > 0 && d.w <= 8000 && d.h <= 8000)) {
      TN.setErr(ERR, 'Enter a valid custom width and height (1–8000 px).');
      return;
    }
    TN.clearErr(ERR);
    var cv = document.createElement('canvas');
    cv.width = d.w; cv.height = d.h;
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var mode = $('social-image-sizer-mode').value;
    if (mode === 'cover') {
      var s = Math.max(d.w / iw, d.h / ih);
      var dw = iw * s, dh = ih * s;
      ctx.drawImage(img, (d.w - dw) / 2, (d.h - dh) / 2, dw, dh);
    } else {
      // blurred padding background
      ctx.save();
      ctx.filter = 'blur(24px) brightness(0.85)';
      ctx.drawImage(img, 0, 0, d.w, d.h);
      ctx.restore();
      var s2 = Math.min(d.w / iw, d.h / ih);
      var dw2 = iw * s2, dh2 = ih * s2;
      ctx.drawImage(img, (d.w - dw2) / 2, (d.h - dh2) / 2, dw2, dh2);
    }
    if (outUrl) URL.revokeObjectURL(outUrl);
    cv.toBlob(function (b) {
      if (!b) { TN.setErr(ERR, 'Could not export the image.'); return; }
      outUrl = URL.createObjectURL(b);
      $('social-image-sizer-preview').src = outUrl;
      $('social-image-sizer-info').textContent = 'Output: ' + d.w + '×' + d.h + ' px (' + $('social-image-sizer-preset').selectedOptions[0].text + ')';
      $('social-image-sizer-result').hidden = false;
      $('social-image-sizer-dl').disabled = false;
    }, 'image/png');
  }

  try {
    TN.on('social-image-sizer-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () {
        img = im; URL.revokeObjectURL(url);
        $('social-image-sizer-go').disabled = false;
        TN.clearErr(ERR);
      };
      im.onerror = function () { URL.revokeObjectURL(url); TN.setErr(ERR, 'Could not read that file as an image.'); };
      im.src = url;
    });
    TN.on('social-image-sizer-preset', 'change', function () {
      var custom = $('social-image-sizer-preset').value === 'custom';
      $('social-image-sizer-cw-wrap').hidden = !custom;
      $('social-image-sizer-ch-wrap').hidden = !custom;
      if (img) render();
    });
    TN.on('social-image-sizer-mode', 'change', function () { if (img) render(); });
    TN.on('social-image-sizer-cw', 'input', function () { if (img) render(); });
    TN.on('social-image-sizer-ch', 'input', function () { if (img) render(); });
    TN.on('social-image-sizer-go', 'click', render);
    TN.on('social-image-sizer-dl', 'click', function () {
      if (!outUrl) return;
      var a = document.createElement('a');
      a.href = outUrl;
      a.download = 'social-' + dims().w + 'x' + dims().h + '.png';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 100);
    });
  } catch (e) { /* never throw on load */ }
})();
