/* Google SERP Preview — pixel-aware snippet preview, desktop + mobile. */
(function () {
  'use strict';

  var SLUG = 'serp-preview-tool';
  var TITLE_LIMIT = 600;   // px
  var DESC_LIMIT = 920;    // px
  var measCtx = null;

  function errId() { return SLUG + '-error'; }
  function set(id, v) { var e = TN.el(id); if (e) e.innerHTML = v; }

  function measure(text, font) {
    try {
      if (!measCtx) measCtx = document.createElement('canvas').getContext('2d');
      measCtx.font = font;
      return Math.round(measCtx.measureText(text || '').width);
    } catch (e) { return 0; }
  }

  function niceUrl(url) {
    var u = (url || '').trim();
    u = u.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    if (u.length > 60) u = u.slice(0, 57) + '…';
    return u || 'example.com';
  }

  function snippet(title, url, desc) {
    var t = TN.esc(title || 'Your page title');
    var d = TN.esc(desc || 'Your meta description will appear here. Add a compelling summary of the page in about 155 characters.');
    return '<div style="font-family:Arial,sans-serif;">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
      + '<span style="width:28px;height:28px;border-radius:50%;background:#e5e7eb;display:inline-flex;align-items:center;justify-content:center;font-size:14px;color:#6b7280;">🌐</span>'
      + '<div><div style="font-size:14px;color:#202124;">' + TN.esc(niceUrl(url).split('/')[0]) + '</div>'
      + '<div style="font-size:12px;color:#4d5156;">' + TN.esc(niceUrl(url)) + '</div></div></div>'
      + '<div style="font-size:20px;color:#1a0dab;line-height:1.3;margin:2px 0;overflow:hidden;text-overflow:ellipsis;">' + t + '</div>'
      + '<div style="font-size:14px;color:#4d5156;line-height:1.58;">' + d + '</div>'
      + '</div>';
  }

  function statLine(label, chars, px, limit, charGuide) {
    var over = px > limit;
    var cls = over ? 'color:#b91c1c;font-weight:bold;' : 'color:#166534;';
    return chars + ' chars · ~' + px + ' px / ' + limit + ' px'
      + ' <span style="' + cls + '">' + (over ? '⚠ too long — will be truncated' : '✓ within limit') + '</span>'
      + ' <span class="muted">(guide: ~' + charGuide + ' chars)</span>';
  }

  function update() {
    TN.clearErr(errId());
    var title = TN.el(SLUG + '-title') ? TN.el(SLUG + '-title').value : '';
    var url = TN.el(SLUG + '-url') ? TN.el(SLUG + '-url').value : '';
    var desc = TN.el(SLUG + '-desc') ? TN.el(SLUG + '-desc').value : '';
    var html = snippet(title, url, desc);
    var desk = TN.el(SLUG + '-desktop');
    var mob = TN.el(SLUG + '-mobile');
    if (desk) desk.innerHTML = html;
    if (mob) mob.innerHTML = html;
    var tp = measure(title, '20px Arial');
    var dp = measure(desc, '14px Arial');
    set(SLUG + '-title-stat', statLine('Title', title.length, tp, TITLE_LIMIT, '60'));
    set(SLUG + '-desc-stat', statLine('Description', desc.length, dp, DESC_LIMIT, '155–160'));
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var deb = TN.debounce(update, 150);
      ['title', 'url', 'desc'].forEach(function (k) {
        var e = TN.el(SLUG + '-' + k);
        if (e) TN.on(e, 'input', deb);
      });
      update();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();