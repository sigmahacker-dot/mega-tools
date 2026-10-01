/* Image Perspective Tilt — rotate + skew transform with auto-sized canvas. */
(function () {
  'use strict';
  var SLUG = 'image-perspective-tilt';
  var ERR = SLUG + '-error';
  var img = null;
  var MAXW = 1600;

  function params() {
    function gv(id) {
      var el = document.getElementById(SLUG + '-' + id);
      return el ? parseFloat(el.value) || 0 : 0;
    }
    return { rot: gv('rot') * Math.PI / 180, sx: gv('skewx') * Math.PI / 180, sy: gv('skewy') * Math.PI / 180 };
  }

  // transform matrix: skew applied first, then rotate (matches canvas setTransform(a,b,c,d,e,f))
  function computeMatrix(p) {
    var cr = Math.cos(p.rot), sr = Math.sin(p.rot);
    var tx = Math.tan(p.sx), ty = Math.tan(p.sy);
    // S = [[1, tx],[ty, 1]] applied first, then R
    return {
      a: cr - sr * ty,
      b: sr + cr * ty,
      c: cr * tx - sr,
      d: sr * tx + cr
    };
  }

  function apply() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    if (!img) {
      canvas.width = 800; canvas.height = 400;
      var c0 = canvas.getContext('2d');
      c0.fillStyle = '#e5e7eb';
      c0.fillRect(0, 0, 800, 400);
      c0.fillStyle = '#9aa0a8';
      c0.font = '28px Arial, sans-serif';
      c0.textAlign = 'center';
      c0.fillText('Choose a photo', 400, 200);
      return;
    }
    var s = Math.min(1, MAXW / img.naturalWidth);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    var m = computeMatrix(params());
    // bounding box of transformed corners
    var corners = [[0, 0], [w, 0], [w, h], [0, h]];
    var xs = [], ys = [];
    corners.forEach(function (pt) {
      xs.push(m.a * pt[0] + m.c * pt[1]);
      ys.push(m.b * pt[0] + m.d * pt[1]);
    });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    canvas.width = Math.ceil(maxX - minX);
    canvas.height = Math.ceil(maxY - minY);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(m.a, m.b, m.c, m.d, -minX, -minY);
    ctx.drawImage(img, 0, 0, w, h);
    try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch (e) {}
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
    [['rot', '°'], ['skewx', '°'], ['skewy', '°']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        var v = document.getElementById(SLUG + '-' + k[0] + '-val');
        if (v) v.textContent = this.value;
        apply();
      });
    });
    TN.on(SLUG + '-reset', 'click', function () {
      ['rot', 'skewx', 'skewy'].forEach(function (k) {
        var el = document.getElementById(SLUG + '-' + k);
        if (el) { el.value = 0; var v = document.getElementById(SLUG + '-' + k + '-val'); if (v) v.textContent = '0'; }
      });
      apply();
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      var canvas = document.getElementById(SLUG + '-canvas');
      if (!img) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'tilted-image.png');
          else TN.setErr(ERR, 'Could not export the image.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the image.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
