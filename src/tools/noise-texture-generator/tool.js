/* Noise Texture Generator — canvas grain, PNG download + data-URL. */
(function () {
  'use strict';
  var SLUG = 'noise-texture-generator';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function render() {
    TN.clearErr(ERR);
    try {
      var size = parseInt($('size').value, 10);
      var kind = $('kind').value;
      var grain = parseInt($('grain').value, 10);
      var opacity = parseInt($('opacity').value, 10) / 100;
      $('grain-v').textContent = grain;
      $('opacity-v').textContent = $('opacity').value + '%';
      var cv = $('canvas');
      cv.width = size; cv.height = size;
      var view = size > 512 ? 512 : size;
      cv.style.width = view + 'px'; cv.style.height = view + 'px';
      var ctx = cv.getContext('2d');
      var img = ctx.createImageData(size, size);
      var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var spread = 128 - grain;
        if (kind === 'mono') {
          var v = Math.floor(spread + Math.random() * grain * 2);
          v = Math.max(0, Math.min(255, v));
          d[i] = d[i + 1] = d[i + 2] = v;
        } else {
          d[i] = Math.max(0, Math.min(255, Math.floor(spread + Math.random() * grain * 2)));
          d[i + 1] = Math.max(0, Math.min(255, Math.floor(spread + Math.random() * grain * 2)));
          d[i + 2] = Math.max(0, Math.min(255, Math.floor(spread + Math.random() * grain * 2)));
        }
        d[i + 3] = Math.round(255 * opacity);
      }
      ctx.putImageData(img, 0, 0);
      $('dataurl').value = cv.toDataURL('image/png');
    } catch (e) {
      TN.setErr(ERR, 'Could not generate the noise texture.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['size', 'kind', 'grain', 'opacity'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-regen', 'click', render);
      TN.on(SLUG + '-download', 'click', function () {
        try {
          var cv = $('canvas');
          cv.toBlob(function (blob) {
            if (blob) TN.download(blob, 'noise-texture.png');
            else TN.setErr(ERR, 'Could not create the PNG.');
          }, 'image/png');
        } catch (e) { TN.setErr(ERR, 'Could not create the PNG.'); }
      });
      TN.on(SLUG + '-copyurl', 'click', function () {
        var txt = $('dataurl').value;
        if (!txt) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
        TN.copy(txt).then(function (ok) {
          if (ok) TN.clearErr(ERR);
          else TN.setErr(ERR, 'Copy failed — select the data-URL and copy manually.');
        });
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
