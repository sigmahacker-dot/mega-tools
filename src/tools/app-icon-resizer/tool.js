/* App Icon Resizer — generate 16/32/48/180/192/512 px icons from one image. */
(function () {
  'use strict';
  var SLUG = 'app-icon-resizer';
  var ERR = SLUG + '-error';
  var SIZES = [16, 32, 48, 180, 192, 512];
  var img = null;
  var cache = {}; // size -> dataURL

  function $(id) { return document.getElementById(id); }

  function render() {
    var grid = $('app-icon-resizer-grid');
    grid.innerHTML = '';
    cache = {};
    if (!img) { $('app-icon-resizer-result').hidden = true; return; }
    var side = Math.min(img.naturalWidth, img.naturalHeight);
    var sx = (img.naturalWidth - side) / 2;
    var sy = (img.naturalHeight - side) / 2;
    SIZES.forEach(function (s) {
      var cv = document.createElement('canvas');
      cv.width = s; cv.height = s;
      var ctx = cv.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, side, side, 0, 0, s, s);
      var url = cv.toDataURL('image/png');
      cache[s] = url;
      var card = document.createElement('div');
      card.style.cssText = 'text-align:center;border:1px solid #ddd;border-radius:10px;padding:10px;background:#fff';
      var im = document.createElement('img');
      im.src = url;
      im.alt = s + 'x' + s + ' icon';
      var disp = Math.min(s, 128);
      im.style.cssText = 'width:' + disp + 'px;height:' + disp + 'px;image-rendering:auto';
      var lab = document.createElement('div');
      lab.style.cssText = 'font-size:12px;margin:6px 0';
      lab.innerHTML = '<b>' + s + '×' + s + '</b>';
      var b = document.createElement('button');
      b.className = 'btn btn-sm btn-outline';
      b.textContent = 'Download PNG';
      b.onclick = function () {
        var a = document.createElement('a');
        a.href = url; a.download = 'icon-' + s + 'x' + s + '.png';
        document.body.appendChild(a); a.click();
        setTimeout(function () { document.body.removeChild(a); }, 100);
      };
      card.appendChild(im); card.appendChild(lab); card.appendChild(b);
      grid.appendChild(card);
    });
    $('app-icon-resizer-result').hidden = false;
    $('app-icon-resizer-all').disabled = false;
    TN.clearErr(ERR);
  }

  try {
    TN.on('app-icon-resizer-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () { img = im; render(); URL.revokeObjectURL(url); };
      im.onerror = function () { URL.revokeObjectURL(url); TN.setErr(ERR, 'Could not read that file as an image.'); };
      im.src = url;
    });
    TN.on('app-icon-resizer-all', 'click', function () {
      var i = 0;
      SIZES.forEach(function (s) {
        if (!cache[s]) return;
        setTimeout(function () {
          var a = document.createElement('a');
          a.href = cache[s]; a.download = 'icon-' + s + 'x' + s + '.png';
          document.body.appendChild(a); a.click();
          setTimeout(function () { document.body.removeChild(a); }, 100);
        }, i * 350);
        i++;
      });
    });
  } catch (e) { /* never throw on load */ }
})();
