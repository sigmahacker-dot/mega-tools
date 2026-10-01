/* Business Card Maker — 1050×600 card front, PNG download. */
(function () {
  'use strict';
  var SLUG = 'business-card-maker';
  var ERR = SLUG + '-error';
  var W = 1050, H = 600;

  var THEMES = {
    slate: { bg: '#0f172a', fg: '#f8fafc', sub: '#94a3b8', accent: '#38bdf8' },
    crimson: { bg: '#7f1d1d', fg: '#fef2f2', sub: '#fecaca', accent: '#fbbf24' },
    teal: { bg: '#134e4a', fg: '#f0fdfa', sub: '#99f6e4', accent: '#fbbf24' },
    light: { bg: '#f8fafc', fg: '#0f172a', sub: '#64748b', accent: '#7c3aed' }
  };

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function render() {
    TN.clearErr(ERR);
    try {
      var name = $('name').value.trim() || 'Your Name';
      var role = $('role').value.trim();
      var company = $('company').value.trim();
      var phone = $('phone').value.trim();
      var email = $('email').value.trim();
      var web = $('web').value.trim();
      var th = THEMES[$('theme').value] || THEMES.slate;
      var layout = $('layout').value;
      var cv = $('canvas'), ctx = cv.getContext('2d');
      ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
      if (layout === 'split') {
        ctx.fillStyle = th.accent; ctx.fillRect(0, 0, 26, H);
        /* faint geometric circles */
        ctx.fillStyle = th.accent; ctx.globalAlpha = 0.10;
        ctx.beginPath(); ctx.arc(W - 120, 120, 150, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W - 60, H - 60, 90, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        var g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, th.accent); g.addColorStop(1, th.bg);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, 110);
        ctx.fillStyle = th.accent; ctx.globalAlpha = 0.10;
        ctx.beginPath(); ctx.arc(120, H - 80, 120, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
      var x0 = layout === 'split' ? 90 : 90;
      var yTop = layout === 'split' ? 130 : 200;
      /* monogram */
      var initials = name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
      ctx.fillStyle = th.accent;
      ctx.beginPath(); ctx.arc(x0 + 45, yTop + 45, 45, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = th.bg;
      ctx.font = '700 44px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(initials, x0 + 45, yTop + 60);
      /* name + role */
      ctx.textAlign = 'left';
      ctx.fillStyle = th.fg;
      ctx.font = '700 72px system-ui, sans-serif';
      ctx.fillText(name, x0 + 130, yTop + 55);
      if (role) {
        ctx.fillStyle = th.accent;
        ctx.font = '600 40px system-ui, sans-serif';
        ctx.fillText(role.toUpperCase(), x0 + 132, yTop + 115);
      }
      if (company) {
        ctx.fillStyle = th.sub;
        ctx.font = '600 38px system-ui, sans-serif';
        ctx.fillText(company, x0 + 132, yTop + 165);
      }
      /* contact block */
      var cy = H - 210;
      ctx.font = '400 36px system-ui, sans-serif';
      ctx.fillStyle = th.fg;
      var items = [];
      if (phone) items.push(['☎', phone]);
      if (email) items.push(['✉', email]);
      if (web) items.push(['🌐', web]);
      items.forEach(function (it, i) {
        var y = cy + i * 62;
        ctx.fillStyle = th.accent;
        ctx.fillText(it[0], x0, y);
        ctx.fillStyle = th.sub;
        ctx.fillText(it[1], x0 + 60, y);
      });
    } catch (e) {
      TN.setErr(ERR, 'Could not render the business card.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['name', 'role', 'company', 'phone', 'email', 'web', 'theme', 'layout'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-download', 'click', function () {
        try {
          $('canvas').toBlob(function (blob) {
            if (blob) TN.download(blob, 'business-card.png');
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
