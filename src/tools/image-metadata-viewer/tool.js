(function () {
  'use strict';
  var S = 'image-metadata-viewer';

  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  function looksLikeImage(f) {
    var t = (f.type || '').toLowerCase();
    if (t.indexOf('image/') === 0) return true;
    return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name || '');
  }

  function analyze(file) {
    TN.clearErr(S + '-error');
    TN.readAsDataURL(file).then(TN.loadImage).then(function (img) {
      var w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) throw new Error('Could not read the image dimensions.');
      // Downscale for sampling (keeps it fast on huge photos)
      var scale = Math.min(1, 200 / Math.max(w, h));
      var sw = Math.max(1, Math.round(w * scale));
      var sh = Math.max(1, Math.round(h * scale));
      var canvas = document.createElement('canvas');
      canvas.width = sw; canvas.height = sh;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, sw, sh);
      var data = ctx.getImageData(0, 0, sw, sh).data;
      var r = 0, g = 0, b = 0;
      var bins = [];
      for (var i = 0; i < 16; i++) bins.push(0);
      var n = data.length / 4;
      for (var p = 0; p < data.length; p += 4) {
        var pr = data[p], pg = data[p + 1], pb = data[p + 2];
        r += pr; g += pg; b += pb;
        var lum = 0.2126 * pr + 0.7152 * pg + 0.0722 * pb;
        var bin = Math.min(15, Math.floor(lum / 16));
        bins[bin]++;
      }
      var ar = Math.round(r / n), ag = Math.round(g / n), ab = Math.round(b / n);
      var hex = '#' + ('0' + ar.toString(16)).slice(-2) + ('0' + ag.toString(16)).slice(-2) + ('0' + ab.toString(16)).slice(-2);

      TN.el(S + '-name').textContent = file.name || 'unnamed image';
      TN.el(S + '-size').textContent = TN.fmtBytes(file.size);
      TN.el(S + '-type').textContent = file.type || 'unknown';
      TN.el(S + '-dims').textContent = w + ' × ' + h;
      TN.el(S + '-mp').textContent = (Math.round((w * h / 1000000) * 100) / 100) + ' MP';
      var d = gcd(w, h);
      TN.el(S + '-ratio').textContent = (w / d) + ':' + (h / d);
      TN.el(S + '-avg').textContent = hex + '  rgb(' + ar + ', ' + ag + ', ' + ab + ')';
      TN.el(S + '-avgswatch').style.background = hex;

      var max = 0;
      for (var k = 0; k < 16; k++) if (bins[k] > max) max = bins[k];
      var hist = TN.el(S + '-hist');
      var html = '';
      for (var q = 0; q < 16; q++) {
        var pct = max ? Math.round((bins[q] / max) * 100) : 0;
        html += '<div title="Bin ' + q + ': ' + bins[q] + ' px" style="flex:1;background:#4D7C0F;border-radius:2px 2px 0 0;min-height:2px;height:' +
          Math.max(2, pct) + '%;"></div>';
      }
      hist.innerHTML = html;
      TN.show(S + '-result');
    }).catch(function (e) {
      TN.setErr(S + '-error', 'Could not analyze that file: ' + (e && e.message ? e.message : 'unknown error'));
    });
  }

  function handleFiles(list) {
    if (!list || !list.length) return;
    var file = list[0];
    if (!looksLikeImage(file)) {
      TN.setErr(S + '-error', 'That does not look like an image file.');
      return;
    }
    analyze(file);
  }

  function init() {
    var dz = TN.el(S + '-drop');
    var input = TN.el(S + '-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      handleFiles(input.files || []);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
