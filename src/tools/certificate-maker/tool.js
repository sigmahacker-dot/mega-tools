/* Certificate Maker — 1600×1200 canvas certificates, PNG download. */
(function () {
  'use strict';
  var SLUG = 'certificate-maker';
  var ERR = SLUG + '-error';
  var W = 1600, H = 1200;

  var THEMES = {
    gold: { primary: '#b45309', dark: '#78350f', bg: '#fffbeb', seal: '#d97706' },
    navy: { primary: '#1e40af', dark: '#1e3a8a', bg: '#eff6ff', seal: '#64748b' },
    emerald: { primary: '#047857', dark: '#065f46', bg: '#ecfdf5', seal: '#10b981' },
    crimson: { primary: '#b91c1c', dark: '#7f1d1d', bg: '#fef2f2', seal: '#ef4444' }
  };

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function fitFont(ctx, text, maxW, base, family, weight) {
    var fs = base;
    ctx.font = weight + ' ' + fs + 'px ' + family;
    while (ctx.measureText(text).width > maxW && fs > 20) {
      fs -= 4;
      ctx.font = weight + ' ' + fs + 'px ' + family;
    }
    return fs;
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var recipient = $('recipient').value.trim() || 'Recipient Name';
      var title = $('title').value.trim() || 'Certificate';
      var subtitle = $('subtitle').value.trim();
      var issuer = $('issuer').value.trim();
      var date = $('date').value.trim();
      var sig = $('signature').value.trim();
      var th = THEMES[$('theme').value] || THEMES.gold;
      var cv = $('canvas'), ctx = cv.getContext('2d');
      /* paper */
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      /* borders */
      ctx.strokeStyle = th.primary; ctx.lineWidth = 14;
      ctx.strokeRect(48, 48, W - 96, H - 96);
      ctx.strokeStyle = th.dark; ctx.lineWidth = 3;
      ctx.strokeRect(80, 80, W - 160, H - 160);
      /* corner ornaments */
      ctx.fillStyle = th.primary;
      [[80, 80], [W - 80, 80], [80, H - 80], [W - 80, H - 80]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0], p[1], 16, 0, Math.PI * 2); ctx.fill();
      });
      ctx.textAlign = 'center';
      /* header */
      ctx.fillStyle = th.dark;
      fitFont(ctx, title.toUpperCase(), W - 400, 84, 'Georgia, serif', '700');
      ctx.fillText(title.toUpperCase(), W / 2, 300);
      ctx.strokeStyle = th.primary; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2 - 200, 340); ctx.lineTo(W / 2 + 200, 340); ctx.stroke();
      /* presented to */
      ctx.fillStyle = '#57534e';
      ctx.font = '400 40px Georgia, serif';
      ctx.fillText('This certificate is proudly presented to', W / 2, 430);
      /* recipient */
      ctx.fillStyle = th.dark;
      var rfs = fitFont(ctx, recipient, W - 500, 110, '"Brush Script MT", "Segoe Script", cursive', '400');
      ctx.font = 'italic ' + rfs + 'px Georgia, serif';
      ctx.fillText(recipient, W / 2, 560);
      /* subtitle */
      if (subtitle) {
        ctx.fillStyle = '#57534e';
        ctx.font = 'italic 38px Georgia, serif';
        ctx.fillText(subtitle, W / 2, 650);
      }
      /* seal */
      ctx.save();
      ctx.translate(W / 2, 800);
      ctx.fillStyle = th.seal;
      ctx.beginPath(); ctx.arc(0, 0, 64, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 44px system-ui, sans-serif';
      ctx.fillText('★', 0, 16);
      ctx.restore();
      /* footer: date + issuer + signature */
      ctx.fillStyle = '#57534e';
      ctx.font = '400 34px Georgia, serif';
      ctx.textAlign = 'left';
      if (date) ctx.fillText(date, 200, H - 200);
      if (issuer) {
        ctx.textAlign = 'center';
        ctx.fillText(issuer, W / 2, H - 200);
      }
      ctx.textAlign = 'right';
      if (sig) {
        ctx.strokeStyle = '#44403c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(W - 480, H - 240); ctx.lineTo(W - 200, H - 240); ctx.stroke();
        ctx.font = 'italic 36px Georgia, serif';
        ctx.fillStyle = '#44403c';
        ctx.fillText(sig, W - 340, H - 195);
        ctx.font = '400 26px system-ui, sans-serif';
        ctx.fillStyle = '#78716c';
        ctx.fillText('Signature', W - 340, H - 160);
      }
    } catch (e) {
      TN.setErr(ERR, 'Could not render the certificate.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['recipient', 'title', 'subtitle', 'issuer', 'date', 'signature', 'theme'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-download', 'click', function () {
        try {
          $('canvas').toBlob(function (blob) {
            if (blob) TN.download(blob, 'certificate.png');
            else TN.setErr(ERR, 'Could not create the PNG.');
          }, 'image/png');
        } catch (e) { TN.setErr(ERR, 'Could not create the PNG.'); }
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
