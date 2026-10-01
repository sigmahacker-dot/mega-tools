/* Image Contact Sheet — grid of multiple images, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-contact-sheet';
  var files = [];
  var imgs = [];

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function cols() {
    var el = TN.el(SLUG + '-cols');
    return el ? Math.max(2, parseInt(el.value, 10) || 3) : 3;
  }
  function cellSize() {
    var el = TN.el(SLUG + '-size');
    return el ? Math.max(200, parseInt(el.value, 10) || 400) : 400;
  }

  function renderList() {
    var ul = TN.el(SLUG + '-list');
    if (!ul) return;
    var html = '';
    for (var i = 0; i < files.length; i++) {
      html += '<li><span>' + TN.esc(files[i].name || 'image') +
        ' <span class="muted">(' + TN.fmtBytes(files[i].size) + ')</span></span>' +
        '<button class="btn btn-outline" data-rm="' + i + '">Remove</button></li>';
    }
    ul.innerHTML = html;
  }

  function addFiles(list) {
    var added = 0;
    for (var i = 0; i < list.length; i++) {
      if ((list[i].type || '').indexOf('image/') === 0) { files.push(list[i]); added++; }
    }
    if (!added) TN.setErr(SLUG + '-error', 'No image files found in that selection.');
    else TN.clearErr(SLUG + '-error');
    renderList();
  }

  function build() {
    TN.clearErr(SLUG + '-error');
    if (!files.length) { TN.setErr(SLUG + '-error', 'Add some images first.'); return; }
    var btn = TN.el(SLUG + '-build');
    if (btn) btn.textContent = 'Building…';
    var chain = Promise.resolve();
    imgs = [];
    files.forEach(function (f) {
      chain = chain.then(function () {
        return TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
          imgs.push({ img: im, name: f.name || 'image' });
        });
      });
    });
    chain.then(function () {
      drawSheet();
      TN.show(SLUG + '-wrap');
      TN.show(SLUG + '-download');
      if (btn) btn.textContent = 'Build contact sheet';
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not read one of the images.');
      if (btn) btn.textContent = 'Build contact sheet';
    });
  }

  function drawSheet() {
    var c = canvas(), x = c.getContext('2d');
    var n = imgs.length, nc = cols(), nr = Math.ceil(n / nc);
    var cell = cellSize(), pad = 16, labelH = 26, bg = '#18181b';
    var labelH2 = labelH;
    c.width = pad * 2 + nc * cell + (nc - 1) * pad;
    c.height = pad * 2 + nr * (cell + labelH2) - labelH2 + pad;
    x.fillStyle = bg;
    x.fillRect(0, 0, c.width, c.height);
    for (var i = 0; i < n; i++) {
      var r = Math.floor(i / nc), col = i % nc;
      var cx = pad + col * (cell + pad), cy = pad + r * (cell + labelH2 + pad);
      var im = imgs[i].img;
      var s = Math.min(cell / im.naturalWidth, cell / im.naturalHeight);
      var dw = Math.round(im.naturalWidth * s), dh = Math.round(im.naturalHeight * s);
      x.fillStyle = '#000';
      x.fillRect(cx, cy, cell, cell);
      x.drawImage(im, cx + (cell - dw) / 2, cy + (cell - dh) / 2, dw, dh);
      x.fillStyle = '#e4e4e7';
      x.font = '13px Arial, sans-serif';
      x.textAlign = 'left';
      x.textBaseline = 'middle';
      var name = imgs[i].name;
      if (name.length > 32) name = name.slice(0, 29) + '…';
      x.fillText(name, cx, cy + cell + labelH2 / 2);
    }
  }

  function download() {
    canvas().toBlob(function (b) {
      if (b) TN.download(b, 'contact-sheet.png');
      else TN.setErr(SLUG + '-error', 'Your browser could not encode the PNG.');
    }, 'image/png');
  }

  var dz = TN.el(SLUG + '-drop'), input = TN.el(SLUG + '-file');
  if (dz && input) {
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      addFiles(input.files || []);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }
  var list = TN.el(SLUG + '-list');
  if (list) list.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-rm]') : null;
    if (b) { files.splice(parseInt(b.getAttribute('data-rm'), 10), 1); renderList(); }
  });
  TN.on(SLUG + '-cols', 'change', function () { if (imgs.length) drawSheet(); });
  TN.on(SLUG + '-size', 'input', function () {
    var el = TN.el(SLUG + '-size'), v = TN.el(SLUG + '-size-val');
    if (el && v) v.textContent = el.value;
    if (imgs.length) drawSheet();
  });
  TN.on(SLUG + '-build', 'click', build);
  TN.on(SLUG + '-download', 'click', download);
})();
