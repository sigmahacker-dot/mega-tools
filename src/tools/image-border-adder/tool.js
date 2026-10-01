/* Image Border Adder — frame an image with a colored border, live preview. */
(function () {
  'use strict';
  var SLUG = 'image-border-adder';
  var ERR = SLUG + '-error';
  var img = null;

  function $(id) { return document.getElementById(id); }
  function val(id) { var e = $(id); return e ? e.value : ''; }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function render() {
    if (!img) return;
    TN.clearErr(ERR);
    var bw = parseInt(val('image-border-adder-width'), 10) || 0;
    var radius = parseInt(val('image-border-adder-radius'), 10) || 0;
    var color = val('image-border-adder-color') || '#ffffff';
    var transparent = val('image-border-adder-bg') === 'transparent';
    var cv = $('image-border-adder-canvas');
    cv.width = img.naturalWidth + bw * 2;
    cv.height = img.naturalHeight + bw * 2;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();
    if (radius > 0) { roundRect(ctx, 0, 0, cv.width, cv.height, radius); ctx.clip(); }
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, bw, bw);
    ctx.restore();
    if (transparent && radius > 0) {
      // punch transparent corners outside the rounded frame
      var tmp = document.createElement('canvas');
      tmp.width = cv.width; tmp.height = cv.height;
      var tctx = tmp.getContext('2d');
      roundRect(tctx, 0, 0, cv.width, cv.height, radius);
      tctx.clip();
      tctx.drawImage(cv, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(tmp, 0, 0);
    }
    $('image-border-adder-info').textContent = 'Output: ' + cv.width + '×' + cv.height + ' px (border ' + bw + ' px)';
    $('image-border-adder-result').hidden = false;
    $('image-border-adder-dl').disabled = false;
  }

  try {
    TN.on('image-border-adder-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () { img = im; URL.revokeObjectURL(url); render(); };
      im.onerror = function () { URL.revokeObjectURL(url); TN.setErr(ERR, 'Could not read that file as an image.'); };
      im.src = url;
    });
    ['image-border-adder-width', 'image-border-adder-color', 'image-border-adder-radius', 'image-border-adder-bg'].forEach(function (id) {
      TN.on(id, 'input', function () {
        var map = { 'image-border-adder-width': 'image-border-adder-width-v', 'image-border-adder-radius': 'image-border-adder-radius-v' };
        if (map[id]) $(map[id]).textContent = $(id).value;
        render();
      });
      TN.on(id, 'change', render);
    });
    TN.on('image-border-adder-dl', 'click', function () {
      $('image-border-adder-canvas').toBlob(function (b) {
        if (!b) { TN.setErr(ERR, 'Could not export the image.'); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'framed.png';
        document.body.appendChild(a); a.click();
        setTimeout(function () { document.body.removeChild(a); }, 100);
      }, 'image/png');
    });
  } catch (e) { /* never throw on load */ }
})();
