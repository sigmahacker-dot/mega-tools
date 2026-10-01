/* Rounded Corners Tool — round image corners with adjustable radius. */
(function () {
  'use strict';
  var SLUG = 'rounded-corners-tool';
  var ERR = SLUG + '-error';
  var img = null;

  function $(id) { return document.getElementById(id); }

  function render() {
    if (!img) return;
    TN.clearErr(ERR);
    var pct = parseInt($('rounded-corners-tool-radius').value, 10) || 0;
    $('rounded-corners-tool-radius-v').textContent = pct;
    var bg = $('rounded-corners-tool-bg').value;
    var cv = $('rounded-corners-tool-canvas');
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    var r = Math.min(cv.width, cv.height) * pct / 100;
    if (bg !== 'transparent') { ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height); }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(cv.width, 0, cv.width, cv.height, r);
    ctx.arcTo(cv.width, cv.height, 0, cv.height, r);
    ctx.arcTo(0, cv.height, 0, 0, r);
    ctx.arcTo(0, 0, cv.width, 0, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    ctx.restore();
    // checkerboard behind canvas to show transparency
    cv.style.background = bg === 'transparent'
      ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 20px 20px'
      : 'none';
    $('rounded-corners-tool-result').hidden = false;
    $('rounded-corners-tool-dl').disabled = false;
  }

  try {
    TN.on('rounded-corners-tool-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () { img = im; URL.revokeObjectURL(url); render(); };
      im.onerror = function () { URL.revokeObjectURL(url); TN.setErr(ERR, 'Could not read that file as an image.'); };
      im.src = url;
    });
    TN.on('rounded-corners-tool-radius', 'input', render);
    TN.on('rounded-corners-tool-bg', 'change', render);
    TN.on('rounded-corners-tool-dl', 'click', function () {
      $('rounded-corners-tool-canvas').toBlob(function (b) {
        if (!b) { TN.setErr(ERR, 'Could not export the image.'); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'rounded-corners.png';
        document.body.appendChild(a); a.click();
        setTimeout(function () { document.body.removeChild(a); }, 100);
      }, 'image/png');
    });
  } catch (e) { /* never throw on load */ }
})();
