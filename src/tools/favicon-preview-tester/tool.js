/* Favicon Preview Tester — PNG upload → 16/32/48/180px previews;
   builds a REAL .ico (ICONDIR header + PNG-compressed entries) via canvas. */
(function () {
  'use strict';
  var SLUG = 'favicon-preview-tester';
  var SIZES = [16, 32, 48];
  var current = null; // { img, canvases: {16,32,48,180} }

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function drawTo(img, size) {
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    // cover-fit the source into the square
    var s = Math.max(size / img.width, size / img.height);
    var w = img.width * s, h = img.height * s;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return c;
  }

  function canvasBlob(c) {
    return new Promise(function (res, rej) {
      c.toBlob(function (b) { b ? res(b) : rej(new Error('Canvas export failed')); }, 'image/png');
    });
  }

  function loadFile(file) {
    clear();
    TN.hide(SLUG + '-result');
    current = null;
    if (!file) return;
    if (!/^image\//.test(file.type)) { fail('Please upload an image file.'); return; }
    TN.readAsDataURL(file).then(TN.loadImage).then(function (img) {
      var canvases = {};
      [16, 32, 48, 180].forEach(function (s) {
        canvases[s] = drawTo(img, s);
        el(SLUG + '-p' + s).src = canvases[s].toDataURL('image/png');
      });
      current = { img: img, canvases: canvases };
      TN.show(SLUG + '-result');
    }).catch(function (e) { fail('Could not load that image: ' + e.message); });
  }

  function buildIco() {
    if (!current) { fail('Upload an image first.'); return; }
    var jobs = SIZES.map(function (s) { return canvasBlob(current.canvases[s]); });
    Promise.all(jobs).then(function (blobs) {
      return Promise.all(blobs.map(function (b) {
        return new Promise(function (res, rej) {
          var r = new FileReader();
          r.onload = function () { res(new Uint8Array(r.result)); };
          r.onerror = function () { rej(r.error); };
          r.readAsArrayBuffer(b);
        });
      }));
    }).then(function (pngs) {
      var n = pngs.length;
      var headerSize = 6 + 16 * n;
      var total = headerSize + pngs.reduce(function (a, p) { return a + p.length; }, 0);
      var buf = new ArrayBuffer(total);
      var dv = new DataView(buf);
      dv.setUint16(0, 0, true);      // reserved
      dv.setUint16(2, 1, true);      // type: icon
      dv.setUint16(4, n, true);      // count
      var offset = headerSize;
      pngs.forEach(function (png, i) {
        var o = 6 + 16 * i, size = SIZES[i];
        dv.setUint8(o, size >= 256 ? 0 : size);   // width
        dv.setUint8(o + 1, size >= 256 ? 0 : size); // height
        dv.setUint8(o + 2, 0);                    // color count
        dv.setUint8(o + 3, 0);                    // reserved
        dv.setUint16(o + 4, 1, true);             // planes
        dv.setUint16(o + 6, 32, true);            // bit count
        dv.setUint32(o + 8, png.length, true);    // bytes in resource
        dv.setUint32(o + 12, offset, true);       // image offset
        new Uint8Array(buf, offset, png.length).set(png);
        offset += png.length;
      });
      TN.download(new Blob([buf], { type: 'image/x-icon' }), 'favicon.ico');
    }).catch(function (e) { fail('ICO build failed: ' + e.message); });
  }

  try {
    TN.on(SLUG + '-file', 'change', function () {
      loadFile(el(SLUG + '-file').files[0]);
    });
    TN.on(SLUG + '-ico', 'click', buildIco);
    TN.on(SLUG + '-png180', 'click', function () {
      if (!current) { fail('Upload an image first.'); return; }
      canvasBlob(current.canvases[180]).then(function (b) {
        TN.download(b, 'apple-touch-icon.png');
      }).catch(function (e) { fail('Export failed: ' + e.message); });
    });
  } catch (e) { /* never throw on load */ }
})();
