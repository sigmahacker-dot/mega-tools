/* Print Stylesheet Generator — @media print CSS builder. */
(function () {
  'use strict';
  var SLUG = 'print-stylesheet-generator';
  var ERR = SLUG + '-error';
  var HIDE = [
    ['hide-nav', 'nav, .nav, .navbar, .menu, .site-nav'],
    ['hide-ads', '.ads, .ad, .banner-ad, .advertisement'],
    ['hide-sidebar', '.sidebar, aside'],
    ['hide-footer', 'footer, .footer, .site-footer'],
    ['hide-forms', 'form, button, .btn, input, .no-print'],
    ['hide-video', 'video, iframe, .video-embed']
  ];

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function render() {
    TN.clearErr(ERR);
    try {
      var size = $('size').value;
      var orient = $('orient').value;
      var margin = $('margin').value;
      var ink = $('ink').value === 'yes';
      var sel = [];
      HIDE.forEach(function (pair) {
        if ($(pair[0]).checked) sel.push(pair[1]);
      });
      var L = [];
      L.push('@media print {');
      L.push('  @page {');
      L.push('    size: ' + size + ' ' + orient + ';');
      L.push('    margin: ' + margin + ';');
      L.push('  }');
      L.push('');
      if (sel.length) {
        L.push('  /* hidden elements */');
        L.push('  ' + sel.join(',\n  ') + ' {');
        L.push('    display: none !important;');
        L.push('  }');
        L.push('');
      }
      L.push('  /* readable body */');
      L.push('  body {');
      L.push('    font-size: 12pt;');
      L.push('    line-height: 1.5;');
      if (ink) {
        L.push('    color: #000;');
        L.push('    background: #fff !important;');
      }
      L.push('  }');
      if (ink) {
        L.push('');
        L.push('  /* ink saver */');
        L.push('  * {');
        L.push('    background: transparent !important;');
        L.push('    box-shadow: none !important;');
        L.push('    text-shadow: none !important;');
        L.push('  }');
        L.push('  a { color: #000; text-decoration: underline; }');
        L.push('  a[href^="http"]:after { content: " (" attr(href) ")"; font-size: 90%; }');
      }
      L.push('');
      L.push('  /* keep blocks together */');
      L.push('  h1, h2, h3 { page-break-after: avoid; }');
      L.push('  img, table, figure { page-break-inside: avoid; max-width: 100%; }');
      L.push('}');
      $('code').textContent = L.join('\n');
    } catch (e) {
      TN.setErr(ERR, 'Could not build the print stylesheet.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['size', 'orient', 'margin', 'ink'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'change', render);
      });
      HIDE.forEach(function (pair) {
        TN.on(SLUG + '-' + pair[0], 'change', render);
      });
      TN.on(SLUG + '-copy', 'click', function () {
        var txt = $('code').textContent;
        if (!txt) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
        TN.copy(txt).then(function (ok) {
          if (ok) TN.clearErr(ERR);
          else TN.setErr(ERR, 'Copy failed — select the code and copy manually.');
        });
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
