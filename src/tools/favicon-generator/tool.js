/* Favicon Generator — 16/32/48/180/192/512 PNG set via canvas, ZIP via JSZip. */
(function () {
  'use strict';
  var SLUG = 'favicon-generator';
  var SIZES = [
    { s: 16, name: 'favicon-16x16.png' },
    { s: 32, name: 'favicon-32x32.png' },
    { s: 48, name: 'favicon-48x48.png' },
    { s: 180, name: 'apple-touch-icon.png' },
    { s: 192, name: 'android-chrome-192x192.png' },
    { s: 512, name: 'android-chrome-512x512.png' }
  ];
  var logo = null;
  var outputs = []; // {blob, name, size, url}

  function $(id) { return document.getElementById(id); }
  function errId() { return SLUG + '-error'; }

  function snippet() {
    return [
      '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
      '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
      '<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">',
      '<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">'
    ].join('\n');
  }

  function setFile(f) {
    if (!f) return;
    TN.clearErr(errId());
    TN.readAsDataURL(f).then(TN.loadImage).then(function (img) {
      if (!img.naturalWidth || !img.naturalHeight) throw new Error('unreadable');
      logo = img;
      var go = $(SLUG + '-go');
      if (go) go.disabled = false;
    }).catch(function () {
      TN.setErr(errId(), 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
    });
  }

  function makeOne(img, s) {
    return new Promise(function (resolve, reject) {
      try {
        var canvas = document.createElement('canvas');
        canvas.width = s;
        canvas.height = s;
        var ctx = canvas.getContext('2d');
        var iw = img.naturalWidth, ih = img.naturalHeight;
        var k = Math.min(s / iw, s / ih);
        var dw = Math.max(1, Math.round(iw * k));
        var dh = Math.max(1, Math.round(ih * k));
        var dx = Math.round((s - dw) / 2), dy = Math.round((s - dh) / 2);
        ctx.clearRect(0, 0, s, s);
        ctx.drawImage(img, dx, dy, dw, dh);
        canvas.toBlob(function (b) {
          if (b) resolve(b);
          else reject(new Error('Could not encode PNG.'));
        }, 'image/png');
      } catch (e) { reject(e); }
    });
  }

  function generate() {
    if (!logo) {
      TN.setErr(errId(), 'Upload a logo first.');
      return;
    }
    TN.clearErr(errId());
    var btn = $(SLUG + '-go');
    if (btn) { btn.disabled = true; btn.textContent = 'Generating…'; }
    outputs.forEach(function (o) { try { URL.revokeObjectURL(o.url); } catch (e) {} });
    outputs = [];
    var chain = Promise.resolve();
    SIZES.forEach(function (sz) {
      chain = chain.then(function () {
        return makeOne(logo, sz.s).then(function (blob) {
          outputs.push({ blob: blob, name: sz.name, size: sz.s, url: URL.createObjectURL(blob) });
        });
      });
    });
    chain.then(function () {
      renderGrid();
      var ta = $(SLUG + '-snippet');
      if (ta) ta.value = snippet();
      $(SLUG + '-result').classList.remove('hidden');
      if (btn) { btn.disabled = false; btn.textContent = 'Generate favicons'; }
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Generate favicons'; }
      TN.setErr(errId(), 'Generation failed: ' + (e && e.message ? e.message : 'unknown error'));
    });
  }

  function renderGrid() {
    var grid = $(SLUG + '-grid');
    if (!grid) return;
    var html = '';
    outputs.forEach(function (o) {
      html += '<div class="stat-card"><img src="' + o.url + '" alt="' + TN.esc(o.name) + '" ' +
        'style="width:48px;height:48px;image-rendering:auto">' +
        '<div class="v" style="font-size:1rem">' + o.size + '×' + o.size + '</div>' +
        '<div class="l">' + TN.esc(o.name) + '</div></div>';
    });
    grid.innerHTML = html;
  }

  function downloadZip() {
    if (typeof JSZip === 'undefined') {
      TN.setErr(errId(), 'The ZIP library failed to load. Check your connection and reload the page.');
      return;
    }
    if (!outputs.length) return;
    try {
      var zip = new JSZip();
      outputs.forEach(function (o) { zip.file(o.name, o.blob); });
      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        TN.download(blob, 'favicons.zip');
      }).catch(function () { TN.setErr(errId(), 'Could not build the ZIP file.'); });
    } catch (e) { TN.setErr(errId(), 'Could not build the ZIP file.'); }
  }

  function copySnippet() {
    var ok = $(SLUG + '-success');
    TN.copy(snippet()).then(function (done) {
      if (ok) {
        ok.textContent = done ? 'HTML snippet copied to clipboard.' : 'Copy failed — select the text and copy it manually.';
        ok.classList.add('show');
        setTimeout(function () { ok.classList.remove('show'); }, 3000);
      }
    });
  }

  function init() {
    var dz = $(SLUG + '-drop');
    var input = $(SLUG + '-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      input.value = '';
      setFile(f);
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      setFile(f);
    });

    TN.on(SLUG + '-go', 'click', generate);
    TN.on(SLUG + '-zip', 'click', downloadZip);
    TN.on(SLUG + '-copy', 'click', copySnippet);
  }

  try { init(); } catch (e) { /* never throw on page load */ }
})();
