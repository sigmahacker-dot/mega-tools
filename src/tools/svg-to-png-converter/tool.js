/* SVG to PNG Converter — paste code or upload .svg, rasterize at chosen size, PNG download. */
(function () {
  'use strict';
  var SLUG = 'svg-to-png-converter';
  var rendered = false;

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function svgText() {
    var el = TN.el(SLUG + '-code');
    return el ? el.value.trim() : '';
  }

  function loadFile(f) {
    if (!f) return;
    TN.clearErr(SLUG + '-error');
    var r = new FileReader();
    r.onload = function () {
      var ta = TN.el(SLUG + '-code');
      if (ta) ta.value = String(r.result || '');
      render();
    };
    r.onerror = function () { TN.setErr(SLUG + '-error', 'Could not read that file.'); };
    r.readAsText(f);
  }

  function render() {
    var svg = svgText();
    if (!svg) { TN.setErr(SLUG + '-error', 'Paste some SVG code or upload an .svg file first.'); return; }
    var w = Math.max(16, Math.min(8192, parseInt((TN.el(SLUG + '-w') || {}).value, 10) || 1024));
    var h = Math.max(16, Math.min(8192, parseInt((TN.el(SLUG + '-h') || {}).value, 10) || 1024));
    TN.clearErr(SLUG + '-error');
    var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var im = new Image();
    im.onload = function () {
      try {
        var c = canvas();
        c.width = w; c.height = h;
        var x = c.getContext('2d');
        x.clearRect(0, 0, w, h);
        x.drawImage(im, 0, 0, w, h);
        rendered = true;
        TN.show(SLUG + '-wrap');
        TN.show(SLUG + '-download');
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    im.onerror = function () {
      URL.revokeObjectURL(url);
      TN.setErr(SLUG + '-error', 'That SVG could not be rasterized. Check the code is valid.');
    };
    im.src = url;
  }

  function download() {
    if (!rendered) { TN.setErr(SLUG + '-error', 'Render the preview first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, 'svg-converted.png');
      else TN.setErr(SLUG + '-error', 'Your browser could not encode the PNG.');
    }, 'image/png');
  }

  var dz = TN.el(SLUG + '-drop'), input = TN.el(SLUG + '-file');
  if (dz && input) {
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) loadFile(input.files[0]);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });
  }
  TN.on(SLUG + '-render', 'click', render);
  TN.on(SLUG + '-download', 'click', download);
})();
