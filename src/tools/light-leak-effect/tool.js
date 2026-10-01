/* Light Leak Effect — warm gradient overlays blended in screen mode. */
(function () {
  'use strict';
  var SLUG = 'light-leak-effect';
  var ERR = SLUG + '-error';
  var srcCanvas = null;
  var MAXW = 1600;

  var MOODS = {
    amber:   [['255,140,40', 0.9], ['255,200,90', 0.55], ['255,90,30', 0.4]],
    rose:    [['255,90,120', 0.9], ['255,150,140', 0.55], ['200,60,120', 0.4]],
    gold:    [['255,190,60', 0.9], ['255,230,150', 0.6], ['255,150,40', 0.4]],
    rainbow: [['255,80,80', 0.7], ['255,200,80', 0.55], ['120,180,255', 0.5], ['180,120,255', 0.45]]
  };

  function corner(p, w, h) {
    if (p === 'tl') return [0, 0];
    if (p === 'tr') return [w, 0];
    if (p === 'bl') return [0, h];
    if (p === 'br') return [w, h];
    var cs = [[0, 0], [w, 0], [0, h], [w, h]];
    return cs[Math.floor(Math.random() * 4)];
  }

  function apply() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas || !srcCanvas) return;
    var w = srcCanvas.width, h = srcCanvas.height;
    var pos = document.getElementById(SLUG + '-pos').value;
    var mood = MOODS[document.getElementById(SLUG + '-mood').value] || MOODS.amber;
    var inten = (parseInt(document.getElementById(SLUG + '-intensity').value, 10) || 60) / 100;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(srcCanvas, 0, 0);

    var c = corner(pos, w, h);
    var diag = Math.sqrt(w * w + h * h);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = inten;
    mood.forEach(function (m, i) {
      var col = m[0], strength = m[1];
      // offset each layer slightly for an organic leak
      var ox = (Math.sin(i * 2.3) * w * 0.06), oy = (Math.cos(i * 1.7) * h * 0.06);
      var rad = diag * (0.55 - i * 0.10);
      var g = ctx.createRadialGradient(c[0] + ox, c[1] + oy, 0, c[0] + ox, c[1] + oy, rad);
      g.addColorStop(0, 'rgba(' + col + ',' + strength + ')');
      g.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    // thin bright streak across
    ctx.globalAlpha = inten * 0.35;
    var sg = ctx.createLinearGradient(c[0], c[1], w - c[0], h - c[1]);
    sg.addColorStop(0, 'rgba(255,240,200,0.8)');
    sg.addColorStop(0.4, 'rgba(255,240,200,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      TN.clearErr(ERR);
      TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
        var s = Math.min(1, MAXW / im.naturalWidth);
        srcCanvas = document.createElement('canvas');
        srcCanvas.width = Math.round(im.naturalWidth * s);
        srcCanvas.height = Math.round(im.naturalHeight * s);
        srcCanvas.getContext('2d').drawImage(im, 0, 0, srcCanvas.width, srcCanvas.height);
        apply();
      }).catch(function () {
        TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
      });
    });
    TN.on(SLUG + '-pos', 'change', apply);
    TN.on(SLUG + '-mood', 'change', apply);
    TN.on(SLUG + '-intensity', 'input', function () {
      var v = document.getElementById(SLUG + '-intensity-val');
      if (v) v.textContent = this.value;
      apply();
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      var canvas = document.getElementById(SLUG + '-canvas');
      if (!srcCanvas) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'light-leak.png');
          else TN.setErr(ERR, 'Could not export the image.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the image.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
