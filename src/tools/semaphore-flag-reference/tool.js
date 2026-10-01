/* Semaphore Flag Reference — A-Z with two-arm positions drawn on canvas (observer's view). */
(function () {
  'use strict';
  var SLUG = 'semaphore-flag-reference';

  /* arm angles in degrees, 0 = up, clockwise (observer's view, facing the signaler) */
  var POS = { A: [180, 225], B: [180, 270], C: [180, 315], D: [180, 0], E: [180, 45], F: [180, 90], G: [180, 135],
    H: [225, 270], I: [225, 315], J: [0, 90], K: [225, 0], L: [225, 45], M: [225, 90], N: [225, 135],
    O: [315, 270], P: [0, 270], Q: [45, 270], R: [90, 270], S: [135, 270],
    T: [315, 0], U: [315, 45], V: [135, 0], W: [90, 45], X: [135, 45], Y: [90, 315], Z: [90, 225] };

  var NATO = { A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf',
    H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November',
    O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform',
    V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu' };

  var NAMES = { 0: 'up', 45: 'upper right', 90: 'right', 135: 'lower right', 180: 'down',
    225: 'lower left', 270: 'left', 315: 'upper left' };

  function drawSignal(canvas, angles) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, shoulderY = 58, armLen = 36;
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    /* head */
    ctx.beginPath(); ctx.arc(cx, 20, 10, 0, Math.PI * 2); ctx.stroke();
    /* body + legs */
    ctx.beginPath(); ctx.moveTo(cx, 32); ctx.lineTo(cx, 84); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 84); ctx.lineTo(cx - 14, 112); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 84); ctx.lineTo(cx + 14, 112); ctx.stroke();
    /* arms with flags */
    angles.forEach(function (deg) {
      var rad = deg * Math.PI / 180;
      var ex = cx + Math.sin(rad) * armLen;
      var ey = shoulderY - Math.cos(rad) * armLen;
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(cx, shoulderY); ctx.lineTo(ex, ey); ctx.stroke();
      /* flag: small square at hand, red/yellow diagonal halves */
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(rad);
      ctx.fillStyle = '#f5c518';
      ctx.fillRect(-8, 2, 16, 14);
      ctx.fillStyle = '#d43a2f';
      ctx.beginPath();
      ctx.moveTo(-8, 2); ctx.lineTo(8, 2); ctx.lineTo(-8, 16); ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function build(filter) {
    var grid = TN.el(SLUG + '-grid');
    grid.innerHTML = '';
    var q = (filter || '').trim().toLowerCase();
    var count = 0;
    Object.keys(POS).forEach(function (letter) {
      if (q && letter.toLowerCase().indexOf(q) === -1 && NATO[letter].toLowerCase().indexOf(q) === -1) return;
      count++;
      var card = document.createElement('div');
      card.className = 'tool-card';
      card.style.cssText = 'padding:10px;text-align:center;margin:0';
      var cv = document.createElement('canvas');
      cv.width = 110; cv.height = 124;
      cv.style.width = '110px';
      drawSignal(cv, POS[letter]);
      var lab = document.createElement('div');
      lab.style.cssText = 'font-weight:700;font-size:1.1rem;margin-top:4px';
      lab.textContent = letter + ' · ' + NATO[letter];
      var sub = document.createElement('div');
      sub.className = 'muted';
      sub.style.fontSize = '.75rem';
      sub.textContent = 'Arms: ' + NAMES[POS[letter][0]] + ' + ' + NAMES[POS[letter][1]];
      card.appendChild(cv);
      card.appendChild(lab);
      card.appendChild(sub);
      grid.appendChild(card);
    });
    if (count === 0) {
      grid.innerHTML = '<p class="muted">No letters match "' + TN.esc(q) + '".</p>';
    }
  }

  function init() {
    if (!TN.el(SLUG + '-grid')) return;
    build('');
    var deb = TN.debounce(function () { build(TN.el(SLUG + '-search').value); }, 150);
    TN.el(SLUG + '-search').addEventListener('input', deb);
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
