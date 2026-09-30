/* Profile Picture Maker — center-crop, zoom, circle/square, ring, export sizes. */
(function () {
  'use strict';
  var SLUG = 'profile-pic-maker';
  var photo = null;
  var renderT = null;

  function $(id) { return document.getElementById(id); }
  function errId() { return SLUG + '-error'; }

  function setFile(f) {
    if (!f) return;
    TN.clearErr(errId());
    TN.readAsDataURL(f).then(TN.loadImage).then(function (img) {
      if (!img.naturalWidth || !img.naturalHeight) throw new Error('unreadable');
      photo = img;
      scheduleRender();
    }).catch(function () {
      TN.setErr(errId(), 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
    });
  }

  function render() {
    var canvas = $(SLUG + '-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var S = parseInt($(SLUG + '-size').value, 10) || 512;
    canvas.width = S;
    canvas.height = S;
    ctx.clearRect(0, 0, S, S);
    if (!photo) {
      ctx.fillStyle = '#eef0ff';
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = '#8a90b5';
      ctx.font = '600 ' + Math.round(S / 16) + 'px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload a photo to preview', S / 2, S / 2);
      return;
    }
    var zoom = parseFloat($(SLUG + '-zoom').value) || 1;
    if (zoom < 1) zoom = 1;
    var shape = $(SLUG + '-shape').value;
    var ringColor = $(SLUG + '-ring').value || '#4f46e5';
    var ring = parseInt($(SLUG + '-ringwidth').value, 10) || 0;
    ring = Math.max(0, Math.min(ring, Math.floor(S / 2) - 2));

    var w = photo.naturalWidth, h = photo.naturalHeight;
    var side = Math.min(w, h) / zoom;
    var sx = (w - side) / 2, sy = (h - side) / 2;
    var d = S - 2 * ring; // inner box size

    if (shape === 'circle') {
      if (ring > 0) {
        ctx.fillStyle = ringColor;
        ctx.beginPath();
        ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(S / 2, S / 2, S / 2 - ring, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(photo, sx, sy, side, side, ring, ring, d, d);
      ctx.restore();
    } else {
      if (ring > 0) {
        ctx.fillStyle = ringColor;
        ctx.fillRect(0, 0, S, S);
      }
      ctx.drawImage(photo, sx, sy, side, side, ring, ring, d, d);
    }
  }

  function scheduleRender() {
    if (renderT) clearTimeout(renderT);
    renderT = setTimeout(render, 60);
  }

  function download() {
    if (!photo) {
      TN.setErr(errId(), 'Upload a photo first.');
      return;
    }
    TN.clearErr(errId());
    render();
    var canvas = $(SLUG + '-canvas');
    try {
      canvas.toBlob(function (b) {
        if (b) TN.download(b, 'profile-picture.png');
        else TN.setErr(errId(), 'Could not encode the image. Try a different browser.');
      }, 'image/png');
    } catch (e) {
      TN.setErr(errId(), 'Could not encode the image. Try a different browser.');
    }
  }

  function init() {
    var dz = $(SLUG + '-drop');
    var input = $(SLUG + '-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      input.value = '';
      setFile(f);
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      setFile(f);
    });

    var z = $(SLUG + '-zoom');
    var zv = $(SLUG + '-zoom-val');
    if (z) z.addEventListener('input', function () {
      if (zv) zv.textContent = parseFloat(z.value).toFixed(1);
      scheduleRender();
    });
    var rw = $(SLUG + '-ringwidth');
    var rwv = $(SLUG + '-ringwidth-val');
    if (rw) rw.addEventListener('input', function () {
      if (rwv) rwv.textContent = rw.value;
      scheduleRender();
    });
    TN.on(SLUG + '-shape', 'change', scheduleRender);
    TN.on(SLUG + '-ring', 'input', scheduleRender);
    TN.on(SLUG + '-size', 'change', scheduleRender);
    TN.on(SLUG + '-download', 'click', download);

    render();
  }

  try { init(); } catch (e) { /* never throw on page load */ }
})();
