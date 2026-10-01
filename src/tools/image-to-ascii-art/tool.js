/* Image to ASCII Art — sample real pixel brightness into text art. */
(function () {
  'use strict';
  var SLUG = 'image-to-ascii-art';
  var ERR = SLUG + '-error';
  var img = null;
  var ascii = '';

  var RAMPS = {
    standard: ' .:-=+*#%@',
    dense: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,. ',
    inverted: '@%#*+=-:. ',
    blocks: ' ░▒▓█'
  };

  function $(id) { return document.getElementById(id); }

  function render() {
    if (!img) return;
    TN.clearErr(ERR);
    var cols = parseInt($('image-to-ascii-art-width').value, 10) || 100;
    var rampKey = $('image-to-ascii-art-ramp').value;
    var ramp = RAMPS[rampKey] || RAMPS.standard;
    var bright = parseInt($('image-to-ascii-art-bright').value, 10) || 0;
    var contrast = parseInt($('image-to-ascii-art-contrast').value, 10) || 0;
    $('image-to-ascii-art-width-v').textContent = cols;
    $('image-to-ascii-art-bright-v').textContent = bright;
    $('image-to-ascii-art-contrast-v').textContent = contrast;
    // characters are ~2x tall as wide
    var rows = Math.round(cols * (img.naturalHeight / img.naturalWidth) / 2);
    rows = Math.max(4, Math.min(400, rows));
    var cv = document.createElement('canvas');
    cv.width = cols; cv.height = rows;
    var ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0, cols, rows);
    var data;
    try { data = ctx.getImageData(0, 0, cols, rows).data; }
    catch (e) { TN.setErr(ERR, 'Could not read image pixels (CORS). Try another image.'); return; }
    var cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    var lines = [];
    for (var y = 0; y < rows; y++) {
      var line = '';
      for (var x = 0; x < cols; x++) {
        var i = (y * cols + x) * 4;
        var lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        lum = cFactor * (lum - 128) + 128 + bright;
        lum = Math.max(0, Math.min(255, lum));
        var idx = Math.floor((lum / 256) * ramp.length);
        if (idx >= ramp.length) idx = ramp.length - 1;
        line += ramp[idx];
      }
      lines.push(line);
    }
    ascii = lines.join('\n');
    $('image-to-ascii-art-out').textContent = ascii;
    $('image-to-ascii-art-result').hidden = false;
    $('image-to-ascii-art-copy').disabled = false;
    $('image-to-ascii-art-dl').disabled = false;
  }

  try {
    TN.on('image-to-ascii-art-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () { img = im; URL.revokeObjectURL(url); render(); };
      im.onerror = function () { URL.revokeObjectURL(url); TN.setErr(ERR, 'Could not read that file as an image.'); };
      im.src = url;
    });
    ['image-to-ascii-art-width', 'image-to-ascii-art-ramp', 'image-to-ascii-art-bright', 'image-to-ascii-art-contrast'].forEach(function (id) {
      TN.on(id, 'input', render);
      TN.on(id, 'change', render);
    });
    TN.on('image-to-ascii-art-copy', 'click', function () {
      if (!ascii) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ascii).then(function () { TN.clearErr(ERR); }, function () { TN.setErr(ERR, 'Copy failed — select the art and copy manually.'); });
      } else { TN.setErr(ERR, 'Clipboard not available — select the art and copy manually.'); }
    });
    TN.on('image-to-ascii-art-dl', 'click', function () {
      if (!ascii) return;
      var blob = new Blob([ascii], { type: 'text/plain' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ascii-art.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 100);
    });
  } catch (e) { /* never throw on load */ }
})();
