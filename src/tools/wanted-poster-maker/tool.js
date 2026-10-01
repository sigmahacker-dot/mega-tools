/* Wanted Poster Maker — aged western poster with sepia portrait. */
(function () {
  'use strict';
  var SLUG = 'wanted-poster-maker';
  var ERR = SLUG + '-error';
  var W = 800, H = 1100;
  var img = null;

  function paperTexture(ctx) {
    ctx.fillStyle = '#e3cfa0';
    ctx.fillRect(0, 0, W, H);
    // grain blotches
    for (var i = 0; i < 900; i++) {
      var x = Math.random() * W, y = Math.random() * H, r = 1 + Math.random() * 3;
      ctx.fillStyle = Math.random() < 0.5 ? 'rgba(120,85,40,0.05)' : 'rgba(255,245,220,0.06)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    // edge burn / vignette
    var g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.72);
    g.addColorStop(0, 'rgba(90,55,20,0)');
    g.addColorStop(1, 'rgba(90,55,20,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // border frame
    ctx.strokeStyle = '#5a3a18';
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.lineWidth = 3;
    ctx.strokeRect(44, 44, W - 88, H - 88);
  }

  function drawSepiaPhoto(ctx, px, py, pw, ph) {
    ctx.save();
    ctx.fillStyle = '#2e1f0e';
    ctx.fillRect(px - 8, py - 8, pw + 16, ph + 16);
    var off = document.createElement('canvas');
    off.width = pw; off.height = ph;
    var o = off.getContext('2d');
    if (img) {
      var s = Math.max(pw / img.naturalWidth, ph / img.naturalHeight);
      var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      o.drawImage(img, (pw - dw) / 2, (ph - dh) / 2, dw, dh);
      var d = o.getImageData(0, 0, pw, ph), px2 = d.data;
      for (var i = 0; i < px2.length; i += 4) {
        var r = px2[i], g2 = px2[i + 1], b = px2[i + 2];
        var lum = 0.299 * r + 0.587 * g2 + 0.114 * b;
        px2[i] = Math.min(255, lum * 1.05 + 22);
        px2[i + 1] = Math.min(255, lum * 0.88 + 12);
        px2[i + 2] = Math.min(255, lum * 0.68);
      }
      o.putImageData(d, 0, 0);
    } else {
      o.fillStyle = '#c9b184';
      o.fillRect(0, 0, pw, ph);
      o.fillStyle = '#5a3a18';
      o.font = '26px Georgia, serif';
      o.textAlign = 'center';
      o.fillText('Choose a photo', pw / 2, ph / 2);
    }
    ctx.drawImage(off, px, py);
    ctx.restore();
  }

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    paperTexture(ctx);
    ctx.fillStyle = '#3a2410';
    ctx.textAlign = 'center';

    ctx.font = 'bold 110px Georgia, "Times New Roman", serif';
    ctx.fillText('WANTED', W / 2, 190);

    var name = (document.getElementById(SLUG + '-name').value || '').trim();
    var status = document.getElementById(SLUG + '-status').value;
    var crime = (document.getElementById(SLUG + '-crime').value || '').trim();
    var reward = (document.getElementById(SLUG + '-reward').value || '').trim();

    drawSepiaPhoto(ctx, 200, 250, 400, 440);

    ctx.font = 'bold 44px Georgia, serif';
    var y = 790;
    ctx.fillText(status, W / 2, y);
    y += 70;
    ctx.font = 'bold 52px Georgia, serif';
    // shrink name to fit
    var ns = 52;
    ctx.font = 'bold ' + ns + 'px Georgia, serif';
    while (ctx.measureText(name).width > W - 140 && ns > 26) {
      ns -= 2; ctx.font = 'bold ' + ns + 'px Georgia, serif';
    }
    ctx.fillText(name, W / 2, y);
    y += 56;
    ctx.font = 'italic 34px Georgia, serif';
    ctx.fillText('for ' + crime, W / 2, y);
    y += 76;
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(reward + ' REWARD', W / 2, y);
    ctx.font = '28px Georgia, serif';
    ctx.fillText('— By order of the Sheriff —', W / 2, H - 90);
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    draw();
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      TN.clearErr(ERR);
      TN.readAsDataURL(f).then(TN.loadImage).then(function (im) { img = im; draw(); })
        .catch(function () { TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.'); });
    });
    TN.on(SLUG + '-name', 'input', TN.debounce(draw, 120));
    TN.on(SLUG + '-crime', 'input', TN.debounce(draw, 120));
    TN.on(SLUG + '-reward', 'input', TN.debounce(draw, 120));
    TN.on(SLUG + '-status', 'change', draw);
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      draw();
      var canvas = document.getElementById(SLUG + '-canvas');
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'wanted-poster.png');
          else TN.setErr(ERR, 'Could not export the poster.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the poster.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
