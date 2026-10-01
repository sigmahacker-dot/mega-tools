/* Image Cropper — drag-select crop box with aspect-ratio lock, full-res export. */
(function () {
  'use strict';
  var SLUG = 'image-cropper';
  var ERR = SLUG + '-error';
  var img = null;
  var box = null; // {x,y,w,h} in canvas CSS pixels
  var drag = null; // {mode:'new'|'move'|'resize', hx,hy, start...}
  var MAXW = 720;

  function $(id) { return document.getElementById(id); }
  function canvas() { return $('image-cropper-canvas'); }

  function fitScale() {
    var c = canvas();
    return { s: c.width / img.naturalWidth, dw: c.width, dh: c.height };
  }

  function draw() {
    var c = canvas(), ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    if (box) {
      // dim outside
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, c.width, box.y);
      ctx.fillRect(0, box.y + box.h, c.width, c.height - box.y - box.h);
      ctx.fillRect(0, box.y, box.x, box.h);
      ctx.fillRect(box.x + box.w, box.y, c.width - box.x - box.w, box.h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      // handles
      ctx.fillStyle = '#fff';
      var hs = 10;
      [[box.x, box.y], [box.x + box.w, box.y], [box.x, box.y + box.h], [box.x + box.w, box.y + box.h]].forEach(function (p) {
        ctx.fillRect(p[0] - hs / 2, p[1] - hs / 2, hs, hs);
      });
      var sc = img.naturalWidth / c.width;
      $('image-cropper-info').textContent = 'Selection: ' + Math.round(box.w * sc) + '×' + Math.round(box.h * sc) + ' px';
    } else {
      $('image-cropper-info').textContent = '';
    }
  }

  function ratioVal() {
    var v = $('image-cropper-ratio').value;
    return v === 'free' ? 0 : parseFloat(v);
  }

  function applyRatio(b) {
    var r = ratioVal();
    if (!r) return b;
    // keep width, adjust height
    b.h = b.w / r;
    return b;
  }

  function pos(e) {
    var c = canvas(), r = c.getBoundingClientRect();
    var cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    var cy = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    var scaleX = c.width / r.width, scaleY = c.height / r.height;
    return { x: (cx - r.left) * scaleX, y: (cy - r.top) * scaleY };
  }

  function clampBox(b) {
    var c = canvas();
    b.x = Math.max(0, Math.min(b.x, c.width - 4));
    b.y = Math.max(0, Math.min(b.y, c.height - 4));
    b.w = Math.max(8, Math.min(b.w, c.width - b.x));
    b.h = Math.max(8, Math.min(b.h, c.height - b.y));
    return b;
  }

  function onDown(e) {
    if (!img) return;
    e.preventDefault();
    var p = pos(e);
    var c = canvas();
    // near a corner handle?
    if (box) {
      var corners = [[box.x, box.y, 'nw'], [box.x + box.w, box.y, 'ne'], [box.x, box.y + box.h, 'sw'], [box.x + box.w, box.y + box.h, 'se']];
      for (var i = 0; i < corners.length; i++) {
        if (Math.abs(p.x - corners[i][0]) < 16 && Math.abs(p.y - corners[i][1]) < 16) {
          drag = { mode: 'resize', corner: corners[i][2], start: { x: p.x, y: p.y }, orig: { x: box.x, y: box.y, w: box.w, h: box.h } };
          return;
        }
      }
      if (p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h) {
        drag = { mode: 'move', start: { x: p.x, y: p.y }, orig: { x: box.x, y: box.y, w: box.w, h: box.h } };
        return;
      }
    }
    drag = { mode: 'new', start: { x: p.x, y: p.y } };
    box = clampBox(applyRatio({ x: p.x, y: p.y, w: 8, h: 8 }));
    draw();
  }

  function onMove(e) {
    if (!drag || !img) return;
    e.preventDefault();
    var p = pos(e);
    if (drag.mode === 'new') {
      var w = p.x - drag.start.x, h = p.y - drag.start.y;
      var b = { x: w < 0 ? p.x : drag.start.x, y: h < 0 ? p.y : drag.start.y, w: Math.abs(w), h: Math.abs(h) };
      box = clampBox(applyRatio(b));
    } else if (drag.mode === 'move') {
      var dx = p.x - drag.start.x, dy = p.y - drag.start.y;
      var c = canvas();
      var nx = Math.max(0, Math.min(drag.orig.x + dx, c.width - drag.orig.w));
      var ny = Math.max(0, Math.min(drag.orig.y + dy, c.height - drag.orig.h));
      box = { x: nx, y: ny, w: drag.orig.w, h: drag.orig.h };
    } else if (drag.mode === 'resize') {
      var o = drag.orig, r = ratioVal();
      var nw = o.w, nh = o.h, nx2 = o.x, ny2 = o.y;
      if (drag.corner.indexOf('e') >= 0) nw = Math.max(8, o.w + (p.x - drag.start.x));
      if (drag.corner.indexOf('s') >= 0) nh = Math.max(8, o.h + (p.y - drag.start.y));
      if (drag.corner.indexOf('w') >= 0) { nw = Math.max(8, o.w - (p.x - drag.start.x)); nx2 = o.x + o.w - nw; }
      if (drag.corner.indexOf('n') >= 0) { nh = Math.max(8, o.h - (p.y - drag.start.y)); ny2 = o.y + o.h - nh; }
      if (r) { // keep ratio by adjusting the secondary dimension
        if (drag.corner === 'se' || drag.corner === 'nw') { nh = nw / r; if (drag.corner === 'nw') ny2 = o.y + o.h - nh; }
        else { nw = nh * r; if (drag.corner === 'ne' || drag.corner === 'nw') nx2 = o.x + o.w - nw; }
      }
      box = clampBox({ x: nx2, y: ny2, w: nw, h: nh });
    }
    draw();
  }

  function onUp() { drag = null; }

  function crop() {
    if (!img) return;
    if (!box || box.w < 4 || box.h < 4) { TN.setErr(ERR, 'Draw a crop selection on the image first.'); return; }
    TN.clearErr(ERR);
    var c = canvas();
    var sc = img.naturalWidth / c.width;
    var sx = Math.round(box.x * sc), sy = Math.round(box.y * sc);
    var sw = Math.round(box.w * sc), sh = Math.round(box.h * sc);
    var out = document.createElement('canvas');
    out.width = sw; out.height = sh;
    out.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    out.toBlob(function (b) {
      if (!b) { TN.setErr(ERR, 'Could not export the crop.'); return; }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'cropped-' + sw + 'x' + sh + '.png';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 100);
    }, 'image/png');
  }

  try {
    TN.on('image-cropper-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () {
        img = im; URL.revokeObjectURL(url);
        box = null;
        var c = canvas();
        var s = Math.min(1, MAXW / img.naturalWidth);
        c.width = Math.round(img.naturalWidth * s);
        c.height = Math.round(img.naturalHeight * s);
        $('image-cropper-result').hidden = false;
        TN.clearErr(ERR);
        draw();
      };
      im.onerror = function () { URL.revokeObjectURL(url); TN.setErr(ERR, 'Could not read that file as an image.'); };
      im.src = url;
    });
    TN.on('image-cropper-ratio', 'change', function () { if (box) { box = clampBox(applyRatio(box)); draw(); } });
    TN.on('image-cropper-go', 'click', crop);
    TN.on('image-cropper-reset', 'click', function () { box = null; draw(); });
    var cv = $('image-cropper-canvas');
    cv.addEventListener('mousedown', onDown);
    cv.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    cv.addEventListener('touchstart', onDown, { passive: false });
    cv.addEventListener('touchmove', onMove, { passive: false });
    cv.addEventListener('touchend', onUp);
  } catch (e) { /* never throw on load */ }
})();
