/* Breadcrumb Schema Generator — trail → BreadcrumbList JSON-LD. */
(function () {
  'use strict';

  var SLUG = 'breadcrumb-schema-generator';
  var crumbs = [];
  var lastJson = '';

  function renderTrail() {
    var box = TN.el(SLUG + '-trail');
    if (!crumbs.length) { box.innerHTML = '<p class="muted">No crumbs yet — add from Home onward.</p>'; return; }
    box.innerHTML = '<p>' + crumbs.map(function (c, i) {
      return '<span class="muted">' + (i + 1) + '.</span> <strong>' + TN.esc(c.label) + '</strong>';
    }).join(' <span class="muted">›</span> ') + '</p>' +
      crumbs.map(function (c, i) {
        return '<div style="margin:4px 0"><span class="muted">' + (i + 1) + '.</span> ' + TN.esc(c.label) +
          ' — ' + TN.esc(c.url) + ' <button class="btn btn-sm btn-outline" data-del="' + i + '">×</button></div>';
      }).join('');
    var dels = box.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          crumbs.splice(parseInt(b.getAttribute('data-del'), 10), 1);
          renderTrail();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var label = TN.el(SLUG + '-label').value.trim();
    var url = TN.el(SLUG + '-url').value.trim();
    if (!label) { TN.setErr(SLUG + '-error', 'Enter a crumb label.'); return; }
    if (!url) { TN.setErr(SLUG + '-error', 'Enter the crumb URL.'); return; }
    try { new URL(url); } catch (e) { TN.setErr(SLUG + '-error', 'That URL looks invalid.'); return; }
    crumbs.push({ label: label, url: url });
    TN.el(SLUG + '-label').value = '';
    TN.el(SLUG + '-url').value = '';
    renderTrail();
  }

  function generate() {
    TN.clearErr(SLUG + '-error');
    if (!crumbs.length) { TN.setErr(SLUG + '-error', 'Add at least one crumb first.'); return; }
    var obj = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(function (c, i) {
        return {
          '@type': 'ListItem',
          position: i + 1,
          name: c.label,
          item: c.url
        };
      })
    };
    lastJson = JSON.stringify(obj, null, 2);
    TN.el(SLUG + '-out').textContent = lastJson;
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-clear', 'click', function () { crumbs = []; renderTrail(); });
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.copy(lastJson).catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
      TN.on(SLUG + '-dl', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.downloadText(lastJson, 'breadcrumb-schema.json', 'application/ld+json');
      });
      renderTrail();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();