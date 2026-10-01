/* Twitter Card Generator — summary/large-image card meta tags + preview. */
(function () {
  'use strict';

  var SLUG = 'twitter-card-generator';
  var lastTags = '';

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function escAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var type = TN.el(SLUG + '-type').value;
    var title = v('title'), desc = v('desc'), img = v('img'), site = v('site');
    if (!title) { TN.setErr(SLUG + '-error', 'Enter a card title.'); return; }
    if (!img) { TN.setErr(SLUG + '-error', 'Enter an image URL.'); return; }
    try { new URL(img); } catch (e) { TN.setErr(SLUG + '-error', 'That image URL looks invalid.'); return; }

    var tags = [
      '<meta name="twitter:card" content="' + type + '">',
      '<meta name="twitter:title" content="' + escAttr(title) + '">'
    ];
    if (desc) tags.push('<meta name="twitter:description" content="' + escAttr(desc) + '">');
    tags.push('<meta name="twitter:image" content="' + escAttr(img) + '">');
    if (site) tags.push('<meta name="twitter:site" content="' + escAttr(site.charAt(0) === '@' ? site : '@' + site) + '">');
    // og fallbacks, genuinely useful
    tags.push('<meta property="og:title" content="' + escAttr(title) + '">');
    if (desc) tags.push('<meta property="og:description" content="' + escAttr(desc) + '">');
    tags.push('<meta property="og:image" content="' + escAttr(img) + '">');

    lastTags = tags.join('\n');
    TN.el(SLUG + '-out').textContent = lastTags;

    var large = type === 'summary_large_image';
    var pv = TN.el(SLUG + '-preview');
    pv.innerHTML =
      '<div style="border:1px solid #333;border-radius:16px;overflow:hidden;background:#000;max-width:520px">' +
      (large
        ? '<img src="' + escAttr(img) + '" alt="card image" style="width:100%;display:block;aspect-ratio:1.91/1;object-fit:cover" onerror="this.style.display=\'none\'">' +
          '<div style="padding:12px"><div style="color:#fff;font-weight:bold">' + TN.esc(title) + '</div>' +
          (desc ? '<div style="color:#71767b;font-size:14px;margin-top:4px">' + TN.esc(desc) + '</div>' : '') + '</div>'
        : '<div style="display:flex;padding:12px;gap:12px">' +
          '<img src="' + escAttr(img) + '" alt="card image" style="width:120px;height:120px;object-fit:cover;border-radius:8px" onerror="this.style.display=\'none\'">' +
          '<div><div style="color:#fff;font-weight:bold">' + TN.esc(title) + '</div>' +
          (desc ? '<div style="color:#71767b;font-size:14px;margin-top:4px">' + TN.esc(desc) + '</div>' : '') + '</div></div>') +
      '</div>';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastTags) { TN.setErr(SLUG + '-error', 'Generate the tags first.'); return; }
        TN.copy(lastTags).catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();