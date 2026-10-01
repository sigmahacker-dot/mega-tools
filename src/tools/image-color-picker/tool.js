(function () {
  'use strict';
  var ERR = 'image-color-picker-error';
  var MAXDIM = 800;
  var imgData = null;

  function toHex(r, g, b) {
    function h(v) { return ('0' + v.toString(16)).slice(-2); }
    return '#' + h(r) + h(g) + h(b);
  }

  function toHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return 'hsl(' + Math.round(h) + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%)';
  }

  function sampleAt(evt) {
    var cv = TN.el('image-color-picker-canvas');
    if (!cv || !imgData) return null;
    var rect = cv.getBoundingClientRect();
    var x = Math.floor((evt.clientX - rect.left) * (cv.width / rect.width));
    var y = Math.floor((evt.clientY - rect.top) * (cv.height / rect.height));
    if (x < 0 || y < 0 || x >= cv.width || y >= cv.height) return null;
    var i = (y * cv.width + x) * 4;
    return { r: imgData[i], g: imgData[i + 1], b: imgData[i + 2] };
  }

  function showLive(c) {
    if (!c) return;
    var hex = toHex(c.r, c.g, c.b);
    TN.el('image-color-picker-hex').textContent = hex.toUpperCase();
    TN.el('image-color-picker-rgb').textContent = 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
    TN.el('image-color-picker-hsl').textContent = toHsl(c.r, c.g, c.b);
  }

  function pin(c) {
    if (!c) return;
    var hex = toHex(c.r, c.g, c.b).toUpperCase();
    var list = TN.el('image-color-picker-picked');
    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '10px';
    row.style.marginBottom = '8px';
    var sw = document.createElement('div');
    sw.style.width = '40px';
    sw.style.height = '40px';
    sw.style.borderRadius = '8px';
    sw.style.background = hex;
    sw.style.border = '1px solid rgba(0,0,0,0.2)';
    var lab = document.createElement('div');
    lab.textContent = hex + '  ·  rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline btn-sm';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      TN.copy(hex).then(function (ok) {
        btn.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      });
    });
    row.appendChild(sw); row.appendChild(lab); row.appendChild(btn);
    list.insertBefore(row, list.firstChild);
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
      var scale = Math.min(1, MAXDIM / Math.max(img.width, img.height));
      var cv = TN.el('image-color-picker-canvas');
      cv.width = Math.max(1, Math.round(img.width * scale));
      cv.height = Math.max(1, Math.round(img.height * scale));
      var ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      imgData = ctx.getImageData(0, 0, cv.width, cv.height).data;
      TN.el('image-color-picker-picked').innerHTML = '';
      showLive({ r: 0, g: 0, b: 0 });
    }).catch(function () {
      TN.setErr(ERR, 'Could not read that image.');
    });
  }

  try {
    TN.on('image-color-picker-file', 'change', function (e) {
      var t = e.target || e.srcElement;
      if (t && t.files && t.files[0]) loadFile(t.files[0]);
    });
    var cv = TN.el('image-color-picker-canvas');
    if (cv) {
      cv.addEventListener('mousemove', function (e) { showLive(sampleAt(e)); });
      cv.addEventListener('click', function (e) { pin(sampleAt(e)); });
      cv.addEventListener('mouseleave', function () {
        TN.el('image-color-picker-hex').textContent = '–';
        TN.el('image-color-picker-rgb').textContent = '–';
        TN.el('image-color-picker-hsl').textContent = '–';
      });
    }
  } catch (e) { /* never throw on load */ }
})();
