(function () {
  'use strict';
  var P = 'open-graph-preview-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var title = TN.el(P + 'title').value || '', site = TN.el(P + 'site').value || '';
      var desc = TN.el(P + 'desc').value || '', img = TN.el(P + 'img').value.trim();
      ['fbtitle', 'xtitle'].forEach(function (k) { TN.el(P + k).textContent = title || '—'; });
      ['fbdesc', 'xdesc'].forEach(function (k) { TN.el(P + k).textContent = desc || '—'; });
      TN.el(P + 'fbsite').textContent = site || '—';
      ['fbimg', 'ximg'].forEach(function (k) {
        var box = TN.el(P + k);
        if (/^https?:\/\//i.test(img)) {
          box.style.backgroundImage = 'url("' + img.replace(/"/g, '') + '")';
          box.style.backgroundSize = 'cover'; box.style.backgroundPosition = 'center';
          box.textContent = '';
        } else {
          box.style.backgroundImage = 'none'; box.style.background = '#e5e7eb';
          box.textContent = 'No image';
        }
      });
      function aq(v) { return String(v).replace(/"/g, '&quot;'); }
      var tags =
        '<meta property="og:type" content="website">\n' +
        '<meta property="og:site_name" content="' + aq(site) + '">\n' +
        '<meta property="og:title" content="' + aq(title) + '">\n' +
        '<meta property="og:description" content="' + aq(desc) + '">\n' +
        (img ? '<meta property="og:image" content="' + img.replace(/"/g, '') + '">\n' : '') +
        '<meta name="twitter:card" content="summary_large_image">\n' +
        '<meta name="twitter:title" content="' + aq(title) + '">\n' +
        '<meta name="twitter:description" content="' + aq(desc) + '">\n' +
        (img ? '<meta name="twitter:image" content="' + img.replace(/"/g, '') + '">\n' : '');
      TN.el(P + 'tags').value = tags;
    } catch (e) { TN.setErr(ERR, 'Could not build the preview. Please try again.'); }
  }
  try {
    ['title', 'site', 'desc', 'img'].forEach(function (k) { TN.on(P + k, 'input', TN.debounce(update, 150)); });
    TN.on(P + 'copy', 'click', function () {
      TN.clearErr(ERR);
      TN.copy(TN.el(P + 'tags').value).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy tags'; }, 1200);
      });
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
