(function () {
  'use strict';
  var S = 'photo-collage-maker';
  var photos = []; // {img, name}

  function looksLikeImage(f) {
    var t = (f.type || '').toLowerCase();
    if (t.indexOf('image/') === 0) return true;
    return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name || '');
  }

  // Layouts as fractional cell rects {x,y,w,h}; canvas W/H in px.
  function layout(n) {
    if (n === 2) return { W: 1200, H: 600, cells: [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }] };
    if (n === 3) return {
      W: 1200, H: 800,
      cells: [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }]
    };
    if (n === 4) return {
      W: 1200, H: 1200,
      cells: [{ x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 },
              { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }]
    };
    // 5 or 6: 3 x 2 grid (5 leaves the last cell empty)
    var cells = [];
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 3; c++) {
        if (cells.length >= n) break;
        cells.push({ x: c / 3, y: r / 2, w: 1 / 3, h: 0.5 });
      }
    }
    return { W: 1200, H: 800, cells: cells };
  }

  function drawCover(ctx, img, x, y, w, h) {
    var s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function render() {
    var canvas = TN.el(S + '-canvas');
    if (!canvas) return;
    if (photos.length < 2) {
      TN.hide(S + '-result');
      return;
    }
    var L = layout(photos.length);
    var gap = parseInt(TN.el(S + '-gap').value, 10) || 0;
    var bg = TN.el(S + '-bg').value || '#ffffff';
    canvas.width = L.W; canvas.height = L.H;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, L.W, L.H);
    L.cells.forEach(function (cell, i) {
      if (i >= photos.length) return;
      var x = Math.round(cell.x * L.W + (cell.x > 0 ? gap / 2 : 0));
      var y = Math.round(cell.y * L.H + (cell.y > 0 ? gap / 2 : 0));
      var w = Math.round(cell.w * L.W - (cell.x > 0 ? gap / 2 : 0) - (cell.x + cell.w < 1 ? gap / 2 : 0));
      var h = Math.round(cell.h * L.H - (cell.y > 0 ? gap / 2 : 0) - (cell.y + cell.h < 1 ? gap / 2 : 0));
      if (w > 0 && h > 0) drawCover(ctx, photos[i].img, x, y, w, h);
    });
    TN.show(S + '-result');
    var gv = TN.el(S + '-gap-val');
    if (gv) gv.textContent = gap;
  }

  function renderList() {
    var ul = TN.el(S + '-list');
    if (!ul) return;
    var html = '';
    for (var i = 0; i < photos.length; i++) {
      html += '<li><span>' + TN.esc(photos[i].name) + '</span>' +
        '<button class="btn btn-sm btn-danger" data-rm="' + i + '">Remove</button></li>';
    }
    ul.innerHTML = html;
    var act = TN.el(S + '-actions');
    if (act) act.classList.toggle('hidden', !photos.length);
  }

  function addFiles(list) {
    var added = 0;
    for (var i = 0; i < list.length && photos.length < 6; i++) {
      if (looksLikeImage(list[i])) {
        (function (file) {
          TN.readAsDataURL(file).then(TN.loadImage).then(function (im) {
            if (im.naturalWidth && im.naturalHeight) {
              photos.push({ img: im, name: file.name || 'photo' });
              renderList();
              render();
              TN.clearErr(S + '-error');
            }
          }).catch(function () {
            TN.setErr(S + '-error', 'Could not read one of the images.');
          });
        })(list[i]);
        added++;
      }
    }
    if (photos.length >= 6 && list.length > added) {
      TN.setErr(S + '-error', 'Only the first 6 photos are used.');
    } else if (!added && photos.length < 2) {
      TN.setErr(S + '-error', 'No image files found in that selection.');
    } else {
      TN.clearErr(S + '-error');
    }
    renderList();
  }

  function download() {
    try {
      var canvas = TN.el(S + '-canvas');
      if (photos.length < 2 || !canvas || !canvas.width) {
        TN.setErr(S + '-error', 'Add at least 2 photos first.');
        return;
      }
      canvas.toBlob(function (blob) {
        try {
          if (blob) TN.download(blob, 'collage.png');
          else TN.setErr(S + '-error', 'Could not export the collage.');
        } catch (e) {}
      }, 'image/png');
    } catch (e) { TN.setErr(S + '-error', 'Could not export the collage.'); }
  }

  function init() {
    var dz = TN.el(S + '-drop');
    var input = TN.el(S + '-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      addFiles(input.files || []);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
    var list = TN.el(S + '-list');
    if (list) list.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-rm]') : null;
      if (b) {
        photos.splice(parseInt(b.getAttribute('data-rm'), 10), 1);
        renderList();
        render();
      }
    });
    TN.on(S + '-gap', 'input', render);
    TN.on(S + '-bg', 'input', render);
    TN.on(S + '-clear', 'click', function () {
      photos = [];
      renderList();
      render();
    });
    TN.on(S + '-download', 'click', download);
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
