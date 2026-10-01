(function () {
  'use strict';
  var S = 'wifi-qr-generator';
  function escWifi(s) {
    return String(s).replace(/([\\;,:"])/g, '\\$1');
  }
  function buildString() {
    var ssid = (TN.el(S + '-ssid').value || '').trim();
    var pass = TN.el(S + '-password').value || '';
    var enc = TN.el(S + '-encryption').value;
    var hidden = TN.el(S + '-hidden').checked;
    if (!ssid) { TN.setErr(S + '-error', 'Please enter the network name (SSID).'); return null; }
    if (enc !== 'nopass' && !pass) {
      TN.setErr(S + '-error', 'Please enter the WiFi password, or choose “Open (no password)”.');
      return null;
    }
    var str = 'WIFI:T:' + enc + ';S:' + escWifi(ssid) + ';';
    if (enc !== 'nopass') str += 'P:' + escWifi(pass) + ';';
    if (hidden) str += 'H:true;';
    str += ';';
    return str;
  }
  function generate() {
    try {
      TN.clearErr(S + '-error');
      if (typeof QRCode === 'undefined' || !QRCode.toCanvas) {
        TN.setErr(S + '-error', 'QR library failed to load. Please check your connection and reload the page.');
        return;
      }
      var str = buildString();
      if (!str) return;
      var size = parseInt(TN.el(S + '-size').value, 10) || 512;
      var canvas = TN.el(S + '-canvas');
      QRCode.toCanvas(canvas, str, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' }
      }, function (err) {
        try {
          if (err) { TN.setErr(S + '-error', 'Could not generate the QR code: ' + (err.message || 'too much data.')); return; }
          TN.el(S + '-string').value = str;
          TN.show(S + '-preview-wrap');
          TN.show(S + '-download');
        } catch (e2) { /* never throw in callback */ }
      });
    } catch (e) { TN.setErr(S + '-error', 'Something went wrong. Please try again.'); }
  }
  function dl() {
    try {
      var canvas = TN.el(S + '-canvas');
      if (!canvas || !canvas.width) { TN.setErr(S + '-error', 'Generate a QR code first.'); return; }
      canvas.toBlob(function (blob) {
        try {
          if (blob) TN.download(blob, 'wifi-qr.png');
          else TN.setErr(S + '-error', 'Could not export the image.');
        } catch (e) {}
      }, 'image/png');
    } catch (e) { TN.setErr(S + '-error', 'Could not export the image.'); }
  }
  function init() {
    TN.on(S + '-generate', 'click', generate);
    TN.on(S + '-download', 'click', dl);
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
