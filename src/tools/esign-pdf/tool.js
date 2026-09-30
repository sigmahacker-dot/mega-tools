/* eSign PDF — draw a signature on canvas, stamp it onto a PDF page. Requires PDFLib (pdf-lib). */
(function () {
  'use strict';

  var SLUG = 'esign-pdf';
  var state = { buffer: null, name: '', pages: 0 };
  var sigCanvas = null, sigCtx = null, drawing = false, hasDrawn = false;

  function errId() { return SLUG + '-error'; }

  function setupPad() {
    try {
      sigCanvas = TN.el(SLUG + '-sig');
      if (!sigCanvas || !sigCanvas.getContext) return;
      sigCtx = sigCanvas.getContext('2d');
      sigCanvas.style.touchAction = 'none';
      sigCtx.lineWidth = 2.5;
      sigCtx.lineCap = 'round';
      sigCtx.lineJoin = 'round';
      sigCtx.strokeStyle = '#0f172a';
      clearPad();

      var pos = function (e) {
        var r = sigCanvas.getBoundingClientRect();
        return {
          x: (e.clientX - r.left) * (sigCanvas.width / r.width),
          y: (e.clientY - r.top) * (sigCanvas.height / r.height)
        };
      };
      sigCanvas.addEventListener('pointerdown', function (e) {
        try { e.preventDefault(); } catch (e2) {}
        drawing = true;
        hasDrawn = true;
        var p = pos(e);
        sigCtx.beginPath();
        sigCtx.moveTo(p.x, p.y);
        try { sigCanvas.setPointerCapture(e.pointerId); } catch (e3) {}
      });
      sigCanvas.addEventListener('pointermove', function (e) {
        if (!drawing) return;
        try { e.preventDefault(); } catch (e2) {}
        var p = pos(e);
        sigCtx.lineTo(p.x, p.y);
        sigCtx.stroke();
      });
      var stop = function () { drawing = false; };
      sigCanvas.addEventListener('pointerup', stop);
      sigCanvas.addEventListener('pointercancel', stop);
      sigCanvas.addEventListener('pointerleave', stop);
    } catch (e) { /* pad is optional; never throw */ }
  }

  function clearPad() {
    try {
      if (!sigCanvas || !sigCtx) return;
      sigCtx.save();
      sigCtx.fillStyle = '#ffffff';
      sigCtx.fillRect(0, 0, sigCanvas.width, sigCanvas.height);
      sigCtx.restore();
      sigCtx.lineWidth = 2.5;
      sigCtx.lineCap = 'round';
      sigCtx.lineJoin = 'round';
      sigCtx.strokeStyle = '#0f172a';
      hasDrawn = false;
    } catch (e) {}
  }

  function dataUrlToBytes(dataUrl) {
    var base64 = (dataUrl.split(',')[1] || '');
    var bin = atob(base64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function updateInfo() {
    try {
      var info = TN.el(SLUG + '-info');
      if (!info) return;
      if (state.pages > 0) {
        info.textContent = 'Loaded: ' + state.name + ' — ' + state.pages + ' page' + (state.pages === 1 ? '' : 's') + '.';
        var pageInput = TN.el(SLUG + '-page');
        if (pageInput) pageInput.max = String(state.pages);
      } else {
        info.textContent = 'No file loaded yet.';
      }
    } catch (e) {}
  }

  function onFileChosen(ev) {
    TN.clearErr(errId());
    state = { buffer: null, name: '', pages: 0 };
    updateInfo();
    var f = ev.target && ev.target.files ? ev.target.files[0] : null;
    if (!f) return;
    (async function () {
      try {
        if (typeof PDFLib === 'undefined') throw new Error('engine-missing');
        var buf = await TN.readAsArrayBuffer(f);
        var doc = await PDFLib.PDFDocument.load(buf);
        state = { buffer: buf, name: f.name, pages: doc.getPageCount() };
      } catch (e) {
        TN.setErr(errId(), e && e.message === 'engine-missing'
          ? 'PDF engine failed to load. Check your connection and reload the page.'
          : 'Could not read "' + f.name + '" — is it a valid PDF?');
        try { ev.target.value = ''; } catch (e2) {}
      }
      updateInfo();
    })();
  }

  function bindSlider(id, valId) {
    try {
      var s = TN.el(id), v = TN.el(valId);
      if (!s) return;
      var update = function () { if (v) v.textContent = s.value; };
      TN.on(s, 'input', update);
      update();
    } catch (e) {}
  }

  function num(id, def) {
    try {
      var el = TN.el(id);
      if (!el) return def;
      var n = parseFloat(el.value);
      return isNaN(n) ? def : n;
    } catch (e) { return def; }
  }

  function onSign() {
    TN.clearErr(errId());
    var res = null;
    try { res = TN.el(SLUG + '-result'); if (res) TN.hide(res); } catch (e) {}
    if (typeof PDFLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    if (!state.buffer || state.pages < 1) {
      TN.setErr(errId(), 'Choose a PDF file first.');
      return;
    }
    if (!sigCanvas || !hasDrawn) {
      TN.setErr(errId(), 'Draw your signature in the white box first.');
      return;
    }
    var pageNum = Math.floor(num(SLUG + '-page', 1));
    if (pageNum < 1 || pageNum > state.pages) {
      TN.setErr(errId(), 'Page number must be between 1 and ' + state.pages + '.');
      return;
    }
    var xPct = Math.min(100, Math.max(0, num(SLUG + '-x', 70)));
    var yPct = Math.min(100, Math.max(0, num(SLUG + '-y', 80)));
    var sigW = Math.min(300, Math.max(40, num(SLUG + '-size', 120)));
    var btn = null;
    try { btn = TN.el(SLUG + '-sign'); if (btn) btn.disabled = true; } catch (e) {}
    (async function () {
      try {
        var doc = await PDFLib.PDFDocument.load(state.buffer);
        var page = doc.getPage(pageNum - 1);
        var pw = page.getWidth(), ph = page.getHeight();
        var pngBytes = dataUrlToBytes(sigCanvas.toDataURL('image/png'));
        var img = await doc.embedPng(pngBytes);
        var aspect = sigCanvas.height / sigCanvas.width;
        var sigH = sigW * aspect;
        var x = (xPct / 100) * Math.max(0, pw - sigW);
        var y = ph - (yPct / 100) * ph - sigH;
        if (y < 0) y = 0;
        if (x < 0) x = 0;
        page.drawImage(img, { x: x, y: y, width: sigW, height: sigH });
        var bytes = await doc.save();
        TN.download(new Blob([bytes], { type: 'application/pdf' }), 'signed.pdf');
        if (res) {
          res.innerHTML = '<p class="success">Signature added to page ' + pageNum
            + ' — <strong>signed.pdf</strong> downloaded.</p>';
          TN.show(res);
        }
      } catch (e) {
        TN.setErr(errId(), 'Signing failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        if (btn) btn.disabled = false;
      }
    })();
  }

  function onClear() {
    state = { buffer: null, name: '', pages: 0 };
    clearPad();
    TN.clearErr(errId());
    try {
      var input = TN.el(SLUG + '-file');
      if (input) input.value = '';
      var res = TN.el(SLUG + '-result');
      if (res) TN.hide(res);
    } catch (e) {}
    updateInfo();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var input = TN.el(SLUG + '-file');
      if (!input) return;
      TN.on(input, 'change', onFileChosen);
      setupPad();
      var clearSig = TN.el(SLUG + '-clear-sig');
      if (clearSig) TN.on(clearSig, 'click', function () { clearPad(); TN.clearErr(errId()); });
      bindSlider(SLUG + '-x', SLUG + '-x-val');
      bindSlider(SLUG + '-y', SLUG + '-y-val');
      bindSlider(SLUG + '-size', SLUG + '-size-val');
      var signBtn = TN.el(SLUG + '-sign');
      if (signBtn) TN.on(signBtn, 'click', onSign);
      var clearBtn = TN.el(SLUG + '-clear');
      if (clearBtn) TN.on(clearBtn, 'click', onClear);
      updateInfo();
    } catch (e) { /* nothing may throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
