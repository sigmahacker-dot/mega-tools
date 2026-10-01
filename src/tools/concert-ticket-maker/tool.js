/* Concert Ticket Maker — ticket with perforated stub, punched notches, decorative barcode. */
(function () {
  'use strict';
  var SLUG = 'concert-ticket-maker';
  var ERR = SLUG + '-error';
  var W = 1200, H = 480;
  var STUB = 300; // stub width

  function v(id) {
    var el = document.getElementById(SLUG + '-' + id);
    return el ? el.value : '';
  }

  function drawBarcode(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#111';
    var bx = x + 8;
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    while (bx < x + w - 8) {
      var bw = 1 + Math.floor(rnd() * 4);
      if (rnd() < 0.55) ctx.fillRect(bx, y + 6, bw, h - 22);
      bx += bw + 1 + Math.floor(rnd() * 3);
    }
    ctx.fillStyle = '#111';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ADMIT ONE', x + w / 2, y + h - 6);
    ctx.restore();
  }

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var accent = v('color') || '#e11d48';

    // page backdrop (transparent corners for notches)
    ctx.clearRect(0, 0, W, H);

    // ticket body
    var g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#17171c');
    g.addColorStop(1, '#26262e');
    ctx.fillStyle = g;
    ctx.beginPath();
    var r = 26;
    ctx.moveTo(r, 0);
    ctx.lineTo(W - r, 0); ctx.arcTo(W, 0, W, r, r);
    ctx.lineTo(W, H - r); ctx.arcTo(W, H, W - r, H, r);
    ctx.lineTo(r, H); ctx.arcTo(0, H, 0, H - r, r);
    ctx.lineTo(0, r); ctx.arcTo(0, 0, r, 0, r);
    ctx.closePath(); ctx.fill();

    // accent band on top
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 26);
    // subtle diagonal texture
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 8;
    for (var dx = -H; dx < W; dx += 46) {
      ctx.beginPath(); ctx.moveTo(dx, H); ctx.lineTo(dx + H, 0); ctx.stroke();
    }

    var sx = W - STUB; // stub x

    // main fields
    ctx.textAlign = 'left';
    ctx.fillStyle = accent;
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('★ LIVE EVENT ★', 60, 96);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Arial, sans-serif';
    var ev = (v('event') || '').toUpperCase();
    while (ctx.measureText(ev).width > sx - 160 && ev.length > 4) ev = ev.slice(0, -1);
    ctx.fillText(ev, 60, 168);
    ctx.fillStyle = '#c9c9d4';
    ctx.font = '36px Arial, sans-serif';
    ctx.fillText(v('artist'), 60, 226);
    ctx.font = '28px Arial, sans-serif';
    ctx.fillStyle = '#9a9aa8';
    ctx.fillText(v('venue'), 60, 286);
    ctx.fillText(v('date'), 60, 330);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('SEAT  ' + v('seat'), 60, 392);
    ctx.fillStyle = accent;
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.fillText(v('price'), 60, 448 - 8);

    // decorative barcode on main section
    drawBarcode(ctx, sx - 250, 330, 210, 100);

    // perforation
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.moveTo(sx, 14); ctx.lineTo(sx, H - 14); ctx.stroke();
    ctx.setLineDash([]);
    // punched notches top/bottom
    ctx.fillStyle = '#0b0b0e';
    ctx.beginPath(); ctx.arc(sx, 0, 22, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(sx, H, 22, 0, 7); ctx.fill();

    // stub
    ctx.save();
    ctx.translate(sx, 0);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, STUB, 64);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADMIT ONE', STUB / 2, 43);
    ctx.fillStyle = '#e8e8ee';
    ctx.font = 'bold 30px Arial, sans-serif';
    var ev2 = (v('event') || '').toUpperCase();
    ctx.save();
    ctx.translate(STUB / 2, 210);
    ctx.rotate(-Math.PI / 2);
    while (ctx.measureText(ev2).width > 200 && ev2.length > 4) ev2 = ev2.slice(0, -1);
    ctx.fillText(ev2, 0, 0);
    ctx.restore();
    ctx.fillStyle = '#c9c9d4';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(v('date'), STUB / 2, 330);
    ctx.fillText('SEAT ' + v('seat'), STUB / 2, 366);
    ctx.fillStyle = accent;
    ctx.font = 'bold 34px Arial, sans-serif';
    ctx.fillText(v('price'), STUB / 2, 412);
    ctx.restore();
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    draw();
    ['event', 'artist', 'venue', 'date', 'seat', 'price'].forEach(function (k) {
      TN.on(SLUG + '-' + k, 'input', TN.debounce(draw, 120));
    });
    TN.on(SLUG + '-color', 'input', draw);
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      draw();
      var canvas = document.getElementById(SLUG + '-canvas');
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'concert-ticket.png');
          else TN.setErr(ERR, 'Could not export the ticket.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the ticket.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
