/* Trading Card Maker — TCG-style card with art, element, rarity, stat bars. */
(function () {
  'use strict';
  var SLUG = 'trading-card-maker';
  var ERR = SLUG + '-error';
  var W = 600, H = 840;
  var img = null;

  var ELEMENTS = {
    fire:   { c1: '#7a1f0e', c2: '#e25822', emoji: '🔥', label: 'FIRE' },
    water:  { c1: '#0e3a5c', c2: '#2e9bd6', emoji: '💧', label: 'WATER' },
    earth:  { c1: '#2f4a1c', c2: '#7fae4c', emoji: '🌍', label: 'EARTH' },
    air:    { c1: '#3d5a66', c2: '#9fd8e8', emoji: '🌪️', label: 'AIR' },
    shadow: { c1: '#1c1030', c2: '#6a4fa3', emoji: '🌑', label: 'SHADOW' },
    light:  { c1: '#6b5a1e', c2: '#f2d54b', emoji: '✨', label: 'LIGHT' }
  };
  var RARITY = {
    common:    { border: '#9aa3ad', glow: 'rgba(154,163,173,0.0)', name: 'COMMON' },
    rare:      { border: '#3b82f6', glow: 'rgba(59,130,246,0.35)', name: 'RARE' },
    epic:      { border: '#a855f7', glow: 'rgba(168,85,247,0.45)', name: 'EPIC' },
    legendary: { border: '#f5b301', glow: 'rgba(245,179,1,0.55)', name: 'LEGENDARY' }
  };

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function statBar(ctx, x, y, w, label, val, max, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    rr(ctx, x, y, w, 34, 8); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 12, y + 23);
    var bw = w - 130;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    rr(ctx, x + 62, y + 9, bw, 16, 8); ctx.fill();
    ctx.fillStyle = color;
    rr(ctx, x + 62, y + 9, Math.max(16, bw * Math.min(1, val / max)), 16, 8); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(String(val), x + w - 10, y + 23);
  }

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var el = ELEMENTS[document.getElementById(SLUG + '-element').value] || ELEMENTS.fire;
    var ra = RARITY[document.getElementById(SLUG + '-rarity').value] || RARITY.common;
    var name = (document.getElementById(SLUG + '-name').value || 'Unnamed').trim() || 'Unnamed';
    var hp = parseInt(document.getElementById(SLUG + '-hp').value, 10) || 0;
    var atk = parseInt(document.getElementById(SLUG + '-atk').value, 10) || 0;
    var def = parseInt(document.getElementById(SLUG + '-def').value, 10) || 0;

    // card body
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, el.c2); g.addColorStop(1, el.c1);
    rr(ctx, 0, 0, W, H, 36);
    ctx.fillStyle = g; ctx.fill();
    if (ra.glow !== 'rgba(154,163,173,0.0)') {
      ctx.save();
      ctx.shadowColor = ra.border; ctx.shadowBlur = 40;
      rr(ctx, 6, 6, W - 12, H - 12, 32);
      ctx.strokeStyle = ra.border; ctx.lineWidth = 10; ctx.stroke();
      ctx.restore();
    }
    rr(ctx, 6, 6, W - 12, H - 12, 32);
    ctx.strokeStyle = ra.border; ctx.lineWidth = 10; ctx.stroke();

    // name plate
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    rr(ctx, 34, 34, W - 68, 64, 14); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    var nm = name.toUpperCase();
    while (ctx.measureText(nm).width > W - 160 && nm.length > 4) { nm = nm.slice(0, -1); }
    ctx.fillText(nm, W / 2 - 20, 78);
    ctx.font = '30px serif';
    ctx.fillText(el.emoji, W - 78, 78);

    // art window
    var ax = 44, ay = 120, aw = W - 88, ah = 380;
    ctx.fillStyle = '#111';
    rr(ctx, ax, ay, aw, ah, 12); ctx.fill();
    ctx.save();
    rr(ctx, ax, ay, aw, ah, 12); ctx.clip();
    if (img) {
      var s = Math.max(aw / img.naturalWidth, ah / img.naturalHeight);
      var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, ax + (aw - dw) / 2, ay + (ah - dh) / 2, dw, dh);
    } else {
      var ag = ctx.createLinearGradient(0, ay, 0, ay + ah);
      ag.addColorStop(0, 'rgba(255,255,255,0.10)');
      ag.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = ag;
      ctx.fillRect(ax, ay, aw, ah);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText('Choose artwork', ax + aw / 2, ay + ah / 2);
    }
    ctx.restore();
    rr(ctx, ax, ay, aw, ah, 12);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.stroke();

    // element + rarity ribbon
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    rr(ctx, 44, 516, W - 88, 44, 10); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText(el.label + '  •  ' + ra.name, W / 2, 545);

    // HP
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    rr(ctx, 44, 576, W - 88, 52, 12); ctx.fill();
    ctx.fillStyle = '#ff5d5d';
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('♥ HP', 62, 611);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(String(hp), W - 62, 611);

    // stat bars
    statBar(ctx, 44, 644, W - 88, 'ATK', atk, 200, '#ffb020');
    statBar(ctx, 44, 690, W - 88, 'DEF', def, 200, '#38bdf8');

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Made with ToolNest Trading Card Maker', W / 2, H - 26);
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
    TN.on(SLUG + '-element', 'change', draw);
    TN.on(SLUG + '-rarity', 'change', draw);
    [['hp'], ['atk'], ['def']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        var v = document.getElementById(SLUG + '-' + k[0] + '-val');
        if (v) v.textContent = this.value;
        draw();
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      draw();
      var canvas = document.getElementById(SLUG + '-canvas');
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'trading-card.png');
          else TN.setErr(ERR, 'Could not export the card.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the card.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
