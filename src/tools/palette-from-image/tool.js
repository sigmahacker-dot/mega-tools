(function () {
  'use strict';
  var ERR = 'palette-from-image-error';

  function toHex(r, g, b) {
    function h(v) { return ('0' + Math.round(v).toString(16)).slice(-2); }
    return '#' + h(r) + h(g) + h(b);
  }

  function extract(img) {
    var S = 64;
    var cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    var ctx = cv.getContext('2d');
    // Cover-crop to a square
    var side = Math.min(img.width, img.height);
    var sx = (img.width - side) / 2, sy = (img.height - side) / 2;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, S, S);
    var data = ctx.getImageData(0, 0, S, S).data;
    var bins = {};
    for (var i = 0; i < data.length; i += 4) {
      var r = data[i], g = data[i + 1], b = data[i + 2];
      var key = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
      if (!bins[key]) bins[key] = { n: 0, r: 0, g: 0, b: 0 };
      bins[key].n++;
      bins[key].r += r; bins[key].g += g; bins[key].b += b;
    }
    var arr = Object.keys(bins).map(function (k) { return bins[k]; });
    arr.sort(function (a, b) { return b.n - a.n; });
    return arr.slice(0, 8).map(function (bin) {
      return toHex(bin.r / bin.n, bin.g / bin.n, bin.b / bin.n).toUpperCase();
    });
  }

  function loadFile(file) {
    TN.clearErr(ERR);
    if (!file || !file.type.match(/^image\//)) {
      TN.setErr(ERR, 'Please choose an image file (PNG or JPG).');
      return;
    }
    TN.readAsDataURL(file).then(function (url) {
      return TN.loadImage(url);
    }).then(function (img) {
      var colors = extract(img);
      var grid = TN.el('palette-from-image-grid');
      grid.innerHTML = '';
      colors.forEach(function (hex) {
        var sw = document.createElement('button');
        sw.type = 'button';
        sw.style.background = hex;
        sw.style.border = '1px solid rgba(0,0,0,0.2)';
        sw.style.borderRadius = '10px';
        sw.style.height = '76px';
        sw.style.cursor = 'pointer';
        sw.style.color = '#fff';
        sw.style.fontSize = '12px';
        sw.style.fontWeight = 'bold';
        sw.style.textShadow = '0 1px 3px rgba(0,0,0,0.6)';
        sw.textContent = hex;
        sw.title = 'Copy ' + hex;
        sw.addEventListener('click', function () {
          TN.copy(hex).then(function (ok) {
            sw.textContent = ok ? 'Copied!' : hex;
            setTimeout(function () { sw.textContent = hex; }, 1000);
          });
        });
        grid.appendChild(sw);
      });
    }).catch(function () {
      TN.setErr(ERR, 'Could not read that image.');
    });
  }

  try {
    TN.on('palette-from-image-file', 'change', function (e) {
      var t = e.target || e.srcElement;
      if (t && t.files && t.files[0]) loadFile(t.files[0]);
    });
  } catch (e) { /* never throw on load */ }
})();
