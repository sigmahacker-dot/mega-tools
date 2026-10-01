/* YouTube Thumbnail Maker — 1280×720 canvas thumbnails, PNG download. */
(function () {
  'use strict';
  var SLUG = 'youtube-thumbnail-maker';
  var ERR = SLUG + '-error';
  var W = 1280, H = 720;

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function shade(hex, amt) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return hex;
    var c = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].map(function (v) {
      return Math.max(0, Math.min(255, v + amt)).toString(16).padStart(2, '0');
    });
    return '#' + c.join('');
  }

  function drawBackground(ctx, style, accent) {
    if (style === 'burst') {
      var g = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 800);
      g.addColorStop(0, shade(accent, -120)); g.addColorStop(1, '#0f172a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = accent; ctx.globalAlpha = 0.25; ctx.lineWidth = 3;
      for (var i = 0; i < 24; i++) {
        var a = (Math.PI * 2 * i) / 24;
        ctx.beginPath();
        ctx.moveTo(W / 2, H / 2);
        ctx.lineTo(W / 2 + Math.cos(a) * 800, H / 2 + Math.sin(a) * 800);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (style === 'diag') {
      var g2 = ctx.createLinearGradient(0, 0, W, H);
      g2.addColorStop(0, '#0f172a'); g2.addColorStop(1, shade(accent, -140));
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = accent; ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(W * 0.58, 0); ctx.lineTo(W * 0.78, 0);
      ctx.lineTo(W * 0.20, H); ctx.lineTo(0, H);
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = accent; ctx.fillRect(0, 0, 18, H);
    } else if (style === 'dark') {
      var g3 = ctx.createLinearGradient(0, 0, 0, H);
      g3.addColorStop(0, '#111827'); g3.addColorStop(1, '#030712');
      ctx.fillStyle = g3; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = accent; ctx.globalAlpha = 0.14;
      ctx.beginPath(); ctx.arc(W * 0.8, H * 0.2, 200, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W * 0.15, H * 0.85, 140, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else { /* neon */
      ctx.fillStyle = '#0b0620'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = accent; ctx.globalAlpha = 0.35; ctx.lineWidth = 2;
      var horizon = H * 0.55;
      for (var y = horizon; y < H; y += 34) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (var x = -W; x < W * 2; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, horizon); ctx.lineTo(x + (x - W / 2) * 0.9, H); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(W / 2, horizon - 120, 90, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0b0620';
      ctx.beginPath(); ctx.arc(W / 2, horizon - 120, 70, 0, Math.PI * 2); ctx.fill();
    }
  }

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
      var headline = ($('headline').value.trim() || 'YOUR HEADLINE').toUpperCase();
      var sub = $('sub').value.trim();
      var style = $('style').value;
      var accent = $('accent').value;
      var align = $('align').value;
      var baseSize = parseInt($('size').value, 10);
      $('size-v').textContent = baseSize;
      var cv = $('canvas'), ctx = cv.getContext('2d');
      drawBackground(ctx, style, accent);
      var tx = align === 'left' ? 90 : align === 'right' ? W - 90 : W / 2;
      ctx.textAlign = align;
      /* headline with stroke for pop */
      var fs = baseSize, lines;
      ctx.font = '900 ' + fs + 'px system-ui, sans-serif';
      var maxW = W - 220;
      do {
        ctx.font = '900 ' + fs + 'px system-ui, sans-serif';
        lines = wrapText(ctx, headline, maxW);
        fs -= 6;
      } while (lines.length > 3 && fs > 40);
      fs += 6;
      ctx.font = '900 ' + fs + 'px system-ui, sans-serif';
      var lh = fs * 1.12;
      var blockH = lines.length * lh + (sub ? 70 : 0);
      var startY = (H - blockH) / 2 + fs * 0.8;
      ctx.lineWidth = Math.max(6, fs / 10);
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.fillStyle = '#ffffff';
      lines.forEach(function (ln, i) {
        var y = startY + i * lh;
        ctx.strokeText(ln, tx, y);
        ctx.fillText(ln, tx, y);
      });
      /* underline accent bar */
      var barY = startY + lines.length * lh - fs * 0.25;
      var barW = Math.min(maxW, ctx.measureText(lines[0]).width);
      var barX = align === 'left' ? tx : align === 'right' ? tx - barW : tx - barW / 2;
      ctx.fillStyle = accent;
      ctx.fillRect(barX, barY, barW, 12);
      /* subtext */
      if (sub) {
        ctx.font = '700 44px system-ui, sans-serif';
        ctx.textAlign = align;
        ctx.fillStyle = accent;
        ctx.lineWidth = 4;
        var sy = barY + 70;
        ctx.strokeText(sub, tx, sy);
        ctx.fillText(sub, tx, sy);
      }
    } catch (e) {
      TN.setErr(ERR, 'Could not render the thumbnail.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['headline', 'sub', 'style', 'accent', 'align', 'size'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-download', 'click', function () {
        try {
          $('canvas').toBlob(function (blob) {
            if (blob) TN.download(blob, 'youtube-thumbnail.png');
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
