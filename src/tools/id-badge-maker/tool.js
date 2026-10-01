/* ID Badge Maker — photo ID badge with clip slot, details, decorative code. */
(function () {
  'use strict';
  var SLUG = 'id-badge-maker';
  var ERR = SLUG + '-error';
  var W = 640, H = 1000;
  var img = null;

  function v(id) {
    var el = document.getElementById(SLUG + '-' + id);
    return el ? el.value : '';
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var theme = v('color') || '#166534';

    // card
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#eef1f4');
    rr(ctx, 0, 0, W, H, 40);
    ctx.fillStyle = g; ctx.fill();

    // clip slot
    ctx.fillStyle = '#c9ced4';
    rr(ctx, W / 2 - 90, 26, 180, 34, 17); ctx.fill();
    ctx.fillStyle = '#8f959c';
    rr(ctx, W / 2 - 70, 32, 140, 10, 5); ctx.fill();

    // header band
    ctx.fillStyle = theme;
    rr(ctx, 0, 78, W, 130, 0);
    ctx.fillRect(0, 78 + 0, W, 130);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.textAlign = 'center';
    var co = (v('company') || '').toUpperCase();
    while (ctx.measureText(co).width > W - 80 && co.length > 3) co = co.slice(0, -1);
    ctx.fillText(co, W / 2, 162);

    // photo
    var px = 170, py = 250, pw = W - 340, ph = 330;
    ctx.save();
    rr(ctx, px, py, pw, ph, 18);
    ctx.clip();
    if (img) {
      var s = Math.max(pw / img.naturalWidth, ph / img.naturalHeight);
      var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = '#dde2e8';
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = '#8f959c';
      ctx.font = '28px Arial, sans-serif';
      ctx.fillText('Choose a photo', W / 2, py + ph / 2);
    }
    ctx.restore();
    rr(ctx, px, py, pw, ph, 18);
    ctx.strokeStyle = theme; ctx.lineWidth = 6; ctx.stroke();

    // details
    var y = 660;
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 52px Arial, sans-serif';
    var nm = v('name') || 'Your Name';
    while (ctx.measureText(nm).width > W - 80 && nm.length > 3) nm = nm.slice(0, -1);
    ctx.fillText(nm, W / 2, y);
    y += 58;
    ctx.fillStyle = theme;
    ctx.font = 'bold 34px Arial, sans-serif';
    ctx.fillText(v('role') || 'Role', W / 2, y);
    y += 66;
    ctx.fillStyle = '#555b63';
    ctx.font = '30px monospace';
    ctx.fillText(v('idnum') || 'ID-000000', W / 2, y);

    // decorative striped code
    var cw = 320, ch = 84, cx = (W - cw) / 2, cy = H - 170;
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx, cy, cw, ch);
    ctx.fillStyle = '#111';
    var seed = 42, bx = cx + 10;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    while (bx < cx + cw - 10) {
      var bw = 1 + Math.floor(rnd() * 4);
      if (rnd() < 0.55) ctx.fillRect(bx, cy + 8, bw, ch - 16);
      bx += bw + 1 + Math.floor(rnd() * 3);
    }
    ctx.strokeStyle = '#c9ced4';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);

    ctx.fillStyle = '#8f959c';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('NOVELTY BADGE — NOT AN OFFICIAL ID', W / 2, H - 44);
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
    ['name', 'role', 'idnum', 'company'].forEach(function (k) {
      TN.on(SLUG + '-' + k, 'input', TN.debounce(draw, 120));
    });
    TN.on(SLUG + '-color', 'input', draw);
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      draw();
      var canvas = document.getElementById(SLUG + '-canvas');
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'id-badge.png');
          else TN.setErr(ERR, 'Could not export the badge.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the badge.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
