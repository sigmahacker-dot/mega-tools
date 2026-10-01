/* CSS Filter Playground — 8 real CSS filter functions on a canvas sample. */
(function () {
  'use strict';
  var SLUG = 'css-filter-playground';
  var ERR = SLUG + '-error';
  var KEYS = ['grayscale', 'sepia', 'blur', 'brightness', 'contrast', 'hue', 'saturate', 'invert'];

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  /* Draw a colorful sample scene so filters are visible without any network. */
  function drawSample(cv) {
    var ctx = cv.getContext('2d');
    var w = cv.width, h = cv.height;
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#0ea5e9'); g.addColorStop(0.5, '#7c3aed'); g.addColorStop(1, '#e11d48');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(w * 0.72, h * 0.32, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(w * 0.35, h * 0.45); ctx.lineTo(w * 0.65, h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText('Aa', w * 0.12, h * 0.42);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
    ctx.strokeRect(w * 0.06, h * 0.58, w * 0.5, h * 0.3);
    ctx.fillStyle = '#fff';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Sample image', w * 0.10, h * 0.76);
  }

  function filterValue() {
    var f = 'grayscale(' + $('grayscale').value + '%)'
      + ' sepia(' + $('sepia').value + '%)'
      + ' blur(' + $('blur').value + 'px)'
      + ' brightness(' + $('brightness').value + '%)'
      + ' contrast(' + $('contrast').value + '%)'
      + ' hue-rotate(' + $('hue').value + 'deg)'
      + ' saturate(' + $('saturate').value + '%)'
      + ' invert(' + $('invert').value + '%)';
    return f;
  }

  function render() {
    TN.clearErr(ERR);
    try {
      $('grayscale-v').textContent = $('grayscale').value + '%';
      $('sepia-v').textContent = $('sepia').value + '%';
      $('blur-v').textContent = $('blur').value + 'px';
      $('brightness-v').textContent = $('brightness').value + '%';
      $('contrast-v').textContent = $('contrast').value + '%';
      $('hue-v').textContent = $('hue').value + '°';
      $('saturate-v').textContent = $('saturate').value + '%';
      $('invert-v').textContent = $('invert').value + '%';
      var f = filterValue();
      $('demo').style.filter = f;
      $('code').textContent = '.filtered-image {\n  filter: ' + f + ';\n}';
    } catch (e) {
      TN.setErr(ERR, 'Could not apply the filters.');
    }
  }

  function reset() {
    var def = { grayscale: 0, sepia: 0, blur: 0, brightness: 100, contrast: 100, hue: 0, saturate: 100, invert: 0 };
    KEYS.forEach(function (k) { $(k).value = def[k]; });
    render();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      drawSample($('orig'));
      drawSample($('demo'));
      KEYS.forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
      });
      TN.on(SLUG + '-reset', 'click', reset);
      TN.on(SLUG + '-copy', 'click', function () {
        var txt = $('code').textContent;
        if (!txt) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
        TN.copy(txt).then(function (ok) {
          if (ok) TN.clearErr(ERR);
          else TN.setErr(ERR, 'Copy failed — select the code and copy manually.');
        });
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
