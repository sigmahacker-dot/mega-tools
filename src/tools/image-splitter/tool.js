/* Image Splitter — slice an image into a rows×cols tile grid, download tiles. */
(function () {
  'use strict';
  var SLUG = 'image-splitter';
  var ERR = SLUG + '-error';
  var img = null;
  var tiles = []; // {url, name, w, h}

  function $(id) { return document.getElementById(id); }
  function errId() { return ERR; }

  function loadImage(file) {
    TN.clearErr(errId());
    var url = URL.createObjectURL(file);
    var im = new Image();
    im.onload = function () {
      img = im;
      tiles.forEach(function (t) { URL.revokeObjectURL(t.url); });
      tiles = [];
      TN.clearErr(errId());
    };
    im.onerror = function () {
      URL.revokeObjectURL(url);
      TN.setErr(errId(), 'Could not read that file as an image.');
    };
    im.src = url;
  }

  function download(url, name) {
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); }, 100);
  }

  function split() {
    if (!img) { TN.setErr(errId(), 'Upload an image first.'); return; }
    var rows = Math.max(1, Math.min(10, parseInt($('image-splitter-rows').value, 10) || 2));
    var cols = Math.max(1, Math.min(10, parseInt($('image-splitter-cols').value, 10) || 2));
    tiles.forEach(function (t) { URL.revokeObjectURL(t.url); });
    tiles = [];
    var tw = Math.floor(img.naturalWidth / cols);
    var th = Math.floor(img.naturalHeight / rows);
    var grid = $('image-splitter-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cw = (c === cols - 1) ? img.naturalWidth - tw * c : tw;
        var ch = (r === rows - 1) ? img.naturalHeight - th * r : th;
        var cv = document.createElement('canvas');
        cv.width = cw; cv.height = ch;
        cv.getContext('2d').drawImage(img, tw * c, th * r, cw, ch, 0, 0, cw, ch);
        (function (canvas, idx) {
          canvas.toBlob(function (b) {
            if (!b) return;
            var url = URL.createObjectURL(b);
            tiles[idx] = { url: url, name: 'tile-' + (idx + 1) + '.png', w: canvas.width, h: canvas.height };
            var cell = $('image-splitter-cell-' + idx);
            if (cell) {
              var btn = cell.querySelector('button');
              if (btn) { btn.disabled = false; btn.onclick = function () { download(url, 'tile-' + (idx + 1) + '.png'); }; }
            }
          }, 'image/png');
        })(cv, r * cols + c);
        var cell = document.createElement('div');
        cell.id = 'image-splitter-cell-' + (r * cols + c);
        cell.style.cssText = 'border:1px solid #ddd;border-radius:8px;overflow:hidden;background:#f8f8f8';
        var im2 = document.createElement('img');
        im2.src = cv.toDataURL('image/png');
        im2.alt = 'Tile ' + (r * cols + c + 1);
        im2.style.cssText = 'display:block;width:100%;height:auto';
        var cap = document.createElement('div');
        cap.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 8px;font-size:12px';
        cap.innerHTML = '<span class="muted">Tile ' + (r * cols + c + 1) + ' · ' + cw + '×' + ch + '</span>';
        var b = document.createElement('button');
        b.className = 'btn btn-sm btn-outline';
        b.textContent = 'Download';
        b.disabled = true;
        cap.appendChild(b);
        cell.appendChild(im2);
        cell.appendChild(cap);
        grid.appendChild(cell);
      }
    }
    $('image-splitter-info').textContent = img.naturalWidth + '×' + img.naturalHeight + ' px split into ' + (rows * cols) + ' tiles.';
    $('image-splitter-result').hidden = false;
    $('image-splitter-all').disabled = false;
    TN.clearErr(errId());
  }

  try {
    TN.on('image-splitter-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) loadImage(f);
    });
    TN.on('image-splitter-split', 'click', split);
    TN.on('image-splitter-all', 'click', function () {
      var i = 0;
      tiles.forEach(function (t) {
        if (!t) return;
        setTimeout(function () { download(t.url, t.name); }, i * 350);
        i++;
      });
    });
  } catch (e) { /* never throw on load */ }
})();
