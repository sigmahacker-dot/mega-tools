(function () {
  'use strict';
  var S = 'barcode-generator';
  var lastSVG = '';
  var RULES = {
    CODE128: { label: 'CODE128', test: function (v) { return /^[\x20-\x7E]*$/.test(v) && v.length > 0; }, msg: 'CODE128 accepts letters, numbers and symbols.' },
    CODE39: { label: 'CODE39', test: function (v) { return /^[A-Z0-9 \-.$/+%]*$/i.test(v) && v.length > 0; }, msg: 'CODE39 accepts A–Z, 0–9 and - . space $ / + %.' },
    EAN13: { label: 'EAN13', test: function (v) { return /^\d{12,13}$/.test(v); }, msg: 'EAN-13 needs exactly 12 or 13 digits.' },
    EAN8: { label: 'EAN8', test: function (v) { return /^\d{7,8}$/.test(v); }, msg: 'EAN-8 needs exactly 7 or 8 digits.' },
    UPC: { label: 'UPC', test: function (v) { return /^\d{11,12}$/.test(v); }, msg: 'UPC-A needs exactly 11 or 12 digits.' },
    ITF14: { label: 'ITF14', test: function (v) { return /^\d{13,14}$/.test(v); }, msg: 'ITF-14 needs exactly 13 or 14 digits.' }
  };
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function gen() {
    try {
      TN.clearErr(S + '-error');
      var val = (TN.el(S + '-text').value || '').trim();
      var fmt = TN.el(S + '-format').value;
      var rule = RULES[fmt];
      if (!val) { TN.setErr(S + '-error', 'Please enter a value to encode.'); return; }
      if (rule && !rule.test(val)) { TN.setErr(S + '-error', 'Invalid value for ' + rule.label + ': ' + rule.msg); return; }
      if (typeof JsBarcode === 'undefined') {
        TN.setErr(S + '-error', 'Barcode library failed to load. Please check your connection and reload the page.');
        return;
      }
      var wrap = TN.el(S + '-preview-wrap');
      wrap.innerHTML = '';
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      wrap.appendChild(svg);
      var height = parseInt(TN.el(S + '-height').value, 10);
      if (!(height > 0)) height = 100;
      if (height > 300) height = 300;
      try {
        JsBarcode(svg, val, {
          format: fmt, height: height, displayValue: true,
          fontSize: 18, margin: 10, background: '#ffffff', lineColor: '#000000'
        });
      } catch (e) {
        TN.setErr(S + '-error', 'Could not generate this barcode: ' + (e.message || 'invalid value.'));
        wrap.innerHTML = '';
        return;
      }
      lastSVG = new XMLSerializer().serializeToString(svg);
      TN.show(S + '-png');
      TN.show(S + '-svg');
    } catch (e) { TN.setErr(S + '-error', 'Something went wrong. Please try again.'); }
  }
  function dlPNG() {
    try {
      if (!lastSVG) { TN.setErr(S + '-error', 'Generate a barcode first.'); return; }
      var img = new Image();
      var svg64 = btoa(unescape(encodeURIComponent(lastSVG)));
      img.onload = function () {
        try {
          var c = document.createElement('canvas');
          c.width = img.width * 3; c.height = img.height * 3;
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (blob) { if (blob) TN.download(blob, 'barcode.png'); }, 'image/png');
        } catch (e) {}
      };
      img.onerror = function () { TN.setErr(S + '-error', 'Could not export PNG.'); };
      img.src = 'data:image/svg+xml;base64,' + svg64;
    } catch (e) { TN.setErr(S + '-error', 'Could not export PNG.'); }
  }
  function dlSVG() {
    try {
      if (!lastSVG) { TN.setErr(S + '-error', 'Generate a barcode first.'); return; }
      TN.downloadText(lastSVG, 'barcode.svg', 'image/svg+xml');
    } catch (e) { TN.setErr(S + '-error', 'Could not export SVG.'); }
  }
  on(S + '-generate', 'click', gen);
  on(S + '-png', 'click', dlPNG);
  on(S + '-svg', 'click', dlSVG);
})();
