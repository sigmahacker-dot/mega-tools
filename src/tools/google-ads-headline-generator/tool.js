/* Google Ads Headline Generator — 30-char RSA-style headlines from keywords. */
(function () {
  'use strict';

  var SLUG = 'google-ads-headline-generator';
  var MAX = 30;
  var lastList = [];

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function fit(s) {
    s = s.trim();
    if (s.length <= MAX) return s;
    // trim at last space within limit
    var t = s.slice(0, MAX);
    var sp = t.lastIndexOf(' ');
    return (sp > 10 ? t.slice(0, sp) : t).trim();
  }

  var TEMPLATES = {
    benefit: [
      'Get {k} Today', 'Best {k} Deals', '{k} Made Easy', 'Shop {k} Online',
      'Top Rated {k}', '{k} You\'ll Love', 'Affordable {k}', 'Premium {k} Sale'
    ],
    urgency: [
      'Limited {k} Offer', 'Sale Ends Soon: {k}', 'Last Chance: {k}', '{k} - Act Now',
      'Today Only: {k}', 'Hurry - {k} Sale', '{k} Deals End Soon', 'Don\'t Miss {k}'
    ],
    feature: [
      '{k} - Free Shipping', 'New {k} Arrivals', '{k} In Stock Now', 'All {k} On Sale',
      '{k} - All Sizes', 'Quality {k} Store', '{k} - Fast Delivery', 'Latest {k} Models'
    ],
    trust: [
      'Trusted {k} Store', '{k} - 5 Star Rated', '10k+ Happy {k} Buyers', 'Rated #1 For {k}',
      '{k} Experts', 'Shop {k} With Confidence', '{k} - Since 2010', 'Loved {k} Brand'
    ]
  };

  function generate() {
    TN.clearErr(SLUG + '-error');
    var raw = TN.el(SLUG + '-kw').value.trim();
    var tone = TN.el(SLUG + '-tone').value;
    if (!raw) { TN.setErr(SLUG + '-error', 'Enter at least one keyword.'); return; }
    var kws = raw.split(',').map(function (k) { return cap(k.trim()); }).filter(Boolean).slice(0, 4);
    var tpl = TEMPLATES[tone] || TEMPLATES.benefit;
    var out = [];
    tpl.forEach(function (t) {
      kws.forEach(function (k) {
        var h = fit(t.replace(/\{k\}/g, k));
        if (out.indexOf(h) === -1 && h.length >= 5) out.push(h);
      });
    });
    out = out.slice(0, 15);
    lastList = out;
    var box = TN.el(SLUG + '-out');
    if (!out.length) { box.innerHTML = '<p class="muted">No headlines generated — try shorter keywords.</p>'; return; }
    box.innerHTML = out.map(function (h) {
      return '<div style="display:flex;align-items:center;gap:10px;margin:6px 0">' +
        '<code style="flex:1">' + TN.esc(h) + '</code>' +
        '<span class="muted">' + h.length + '/30</span>' +
        '<button class="btn btn-sm btn-outline" data-copy="' + TN.esc(h) + '">Copy</button></div>';
    }).join('');
    var btns = box.querySelectorAll('[data-copy]');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { TN.copy(b.getAttribute('data-copy')); });
      })(btns[i]);
    }
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastList.length) { TN.setErr(SLUG + '-error', 'Generate headlines first.'); return; }
        TN.copy(lastList.join('\n')).then(function () { TN.clearErr(SLUG + '-error'); })
          .catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();