/* Quote Card Maker — 1080×1080 canvas cards, real PNG download. */
(function () {
  'use strict';
  var SLUG = 'quote-card-maker';
  var ERR = SLUG + '-error';
  var W = 1080, H = 1080;

  var THEMES = {
    midnight: { bg: ['#0f172a', '#1e1b4b'], fg: '#f8fafc', accent: '#a78bfa', mark: '“' },
    sunset: { bg: ['#7c2d12', '#b45309'], fg: '#fff7ed', accent: '#fde68a', mark: '“' },
    ocean: { bg: ['#0c4a6e', '#164e63'], fg: '#ecfeff', accent: '#67e8f9', mark: '“' },
    forest: { bg: ['#14532d', '#1a2e05'], fg: '#f7fee7', accent: '#bef264', mark: '“' },
    paper: { bg: ['#faf7f2', '#e7e0d3'], fg: '#292524', accent: '#b45309', mark: '“' },
    royal: { bg: ['#4c1d95', '#831843'], fg: '#fdf4ff', accent: '#f0abfc', mark: '“' }
  };

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function wrapText(ctx, text, maxW) {
    var words = text.split(/\s+/).filter(Boolean);
    var lines = [], line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var quote = $('quote').value.trim() || 'Your quote here.';
      var author = $('author').value.trim();
      var th = THEMES[$('theme').value] || THEMES.midnight;
      var cv = $('canvas'), ctx = cv.getContext('2d');
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      /* decorative circles */
      ctx.fillStyle = th.accent; ctx.globalAlpha = 0.12;
      ctx.beginPath(); ctx.arc(W * 0.85, H * 0.15, 220, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W * 0.12, H * 0.88, 160, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      /* quote mark */
      ctx.fillStyle = th.accent;
      ctx.font = '700 200px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(th.mark, W / 2, 330);
      /* quote text, auto-fit */
      var fs = 64, lines;
      ctx.fillStyle = th.fg;
      do {
        ctx.font = '600 ' + fs + 'px Georgia, serif';
        lines = wrapText(ctx, quote, W - 220);
        fs -= 4;
      } while (lines.length > 6 && fs > 30);
      var lh = fs * 1.45;
      var startY = (H / 2) - ((lines.length - 1) * lh) / 2 + 40;
      lines.forEach(function (ln, i) {
        ctx.fillText(ln, W / 2, startY + i * lh);
      });
      /* divider */
      var dy = startY + lines.length * lh + 10;
      ctx.strokeStyle = th.accent; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(W / 2 - 60, dy); ctx.lineTo(W / 2 + 60, dy); ctx.stroke();
      /* author */
      if (author) {
        ctx.fillStyle = th.accent;
        ctx.font = '600 44px system-ui, sans-serif';
        ctx.fillText('— ' + author.toUpperCase(), W / 2, dy + 90);
      }
    } catch (e) {
      TN.setErr(ERR, 'Could not render the card.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['quote', 'author', 'theme'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-download', 'click', function () {
        try {
          $('canvas').toBlob(function (blob) {
            if (blob) TN.download(blob, 'quote-card.png');
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
