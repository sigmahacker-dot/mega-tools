(function () {
  'use strict';
  var S = 'qr-code-generator';
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function gen() {
    try {
      TN.clearErr(S + '-error');
      var text = (TN.el(S + '-text').value || '').trim();
      if (!text) { TN.setErr(S + '-error', 'Please enter some text or a URL first.'); return; }
      if (typeof QRCode === 'undefined' || !QRCode.toCanvas) {
        TN.setErr(S + '-error', 'QR library failed to load. Please check your connection and reload the page.');
        return;
      }
      var size = parseInt(TN.el(S + '-size').value, 10) || 512;
      var canvas = TN.el(S + '-canvas');
      QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: TN.el(S + '-ecc').value || 'M',
        color: { dark: TN.el(S + '-dark').value || '#000000', light: TN.el(S + '-light').value || '#ffffff' }
      }, function (err) {
        try {
          if (err) { TN.setErr(S + '-error', 'Could not generate the QR code: ' + (err.message || 'too much data.')); return; }
          TN.show(S + '-preview-wrap');
          TN.show(S + '-download');
        } catch (e2) {}
      });
    } catch (e) { TN.setErr(S + '-error', 'Something went wrong. Please try again.'); }
  }
  function dl() {
    try {
      var canvas = TN.el(S + '-canvas');
      if (!canvas || !canvas.width) { TN.setErr(S + '-error', 'Generate a QR code first.'); return; }
      canvas.toBlob(function (blob) {
        try {
          if (blob) TN.download(blob, 'qr-code.png');
          else TN.setErr(S + '-error', 'Could not export the image.');
        } catch (e) {}
      }, 'image/png');
    } catch (e) { TN.setErr(S + '-error', 'Could not export the image.'); }
  }
  on(S + '-generate', 'click', gen);
  on(S + '-download', 'click', dl);
})();
