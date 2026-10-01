(function () {
  'use strict';
  var ERR = 'color-blindness-simulator-error';
  // Machado, Oliveira & Fernandes (2009), severity = 1
  var MATS = {
    prot: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
    deut: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
    trit: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
    achr: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]]
  };
  var CANVASES = {
    orig: 'color-blindness-simulator-orig',
    prot: 'color-blindness-simulator-prot',
    deut: 'color-blindness-simulator-deut',
    trit: 'color-blindness-simulator-trit',
    achr: 'color-blindness-simulator-achr'
  };

  function applyMat(src, dst, mat) {
    var sctx = src.getContext('2d');
    var dctx = dst.getContext('2d');
    var w = src.width, h = src.height;
    dst.width = w; dst.height = h;
    var img = sctx.getImageData(0, 0, w, h);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i + 1], b = d[i + 2];
      d[i] = Math.min(255, Math.max(0, Math.round(mat[0][0] * r + mat[0][1] * g + mat[0][2] * b)));
      d[i + 1] = Math.min(255, Math.max(0, Math.round(mat[1][0] * r + mat[1][1] * g + mat[1][2] * b)));
      d[i + 2] = Math.min(255, Math.max(0, Math.round(mat[2][0] * r + mat[2][1] * g + mat[2][2] * b)));
    }
    dctx.putImageData(img, 0, 0);
  }

  function render(sourceCanvas) {
    var orig = TN.el(CANVASES.orig);
    var octx = orig.getContext('2d');
    orig.width = sourceCanvas.width;
    orig.height = sourceCanvas.height;
    octx.drawImage(sourceCanvas, 0, 0);
    ['prot', 'deut', 'trit', 'achr'].forEach(function (k) {
      applyMat(orig, TN.el(CANVASES[k]), MATS[k]);
    });
  }

  function hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function renderColor(hex) {
    TN.clearErr(ERR);
    try {
      var rgb = hexToRgb(hex);
      var src = document.createElement('canvas');
      src.width = 320; src.height = 200;
      var ctx = src.getContext('2d');
      ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
      ctx.fillRect(0, 0, 320, 200);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hex.toUpperCase(), 160, 105);
      render(src);
    } catch (err) {
      TN.setErr(ERR, 'Could not render that color.');
    }
  }

  function renderFile(file) {
    TN.clearErr(ERR);
    if (!file || !file.type.match(/^image\//)) {
      TN.setErr(ERR, 'Please choose an image file (PNG or JPG).');
      return;
    }
    TN.readAsDataURL(file).then(function (url) {
      return TN.loadImage(url);
    }).then(function (img) {
      var maxDim = 640;
      var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      var src = document.createElement('canvas');
      src.width = Math.max(1, Math.round(img.width * scale));
      src.height = Math.max(1, Math.round(img.height * scale));
      src.getContext('2d').drawImage(img, 0, 0, src.width, src.height);
      render(src);
    }).catch(function () {
      TN.setErr(ERR, 'Could not read that image.');
    });
  }

  try {
    TN.on('color-blindness-simulator-color', 'input', function (e) {
      var t = e.target || e.srcElement;
      if (t) renderColor(t.value);
    });
    TN.on('color-blindness-simulator-file', 'change', function (e) {
      var t = e.target || e.srcElement;
      if (t && t.files && t.files[0]) renderFile(t.files[0]);
    });
    var init = TN.el('color-blindness-simulator-color');
    if (init) renderColor(init.value);
  } catch (e) { /* never throw on load */ }
})();
