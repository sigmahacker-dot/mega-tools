/* Nautical Flag Reference — ICS maritime signal flags drawn on canvas with meanings. */
(function () {
  'use strict';
  var SLUG = 'nautical-flag-reference';
  var BLUE = '#1a56c4', RED = '#d43a2f', YEL = '#f5c518', WHT = '#ffffff', BLK = '#222222';

  var FLAGS = [
    { l: 'A', n: 'Alfa', m: 'I have a diver down; keep well clear at slow speed.', d: function (c, w, h) { c.fillStyle = WHT; c.fillRect(0, 0, w, h); c.fillStyle = BLUE; c.fillRect(w / 2, 0, w / 2, h); } },
    { l: 'B', n: 'Bravo', m: 'I am taking in, discharging, or carrying dangerous goods.', d: function (c, w, h) { c.fillStyle = RED; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w * 0.62, h / 2); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill(); } },
    { l: 'C', n: 'Charlie', m: 'Yes / affirmative.', d: function (c, w, h) { var s = [BLUE, WHT, RED, WHT, BLUE]; s.forEach(function (col, i) { c.fillStyle = col; c.fillRect(0, i * h / 5, w, h / 5 + 1); }); } },
    { l: 'D', n: 'Delta', m: 'Keep clear of me; I am maneuvering with difficulty.', d: function (c, w, h) { c.fillStyle = YEL; c.fillRect(0, 0, w, h); c.fillStyle = BLUE; c.fillRect(0, 0, w / 3, h); } },
    { l: 'E', n: 'Echo', m: 'I am altering my course to starboard.', d: function (c, w, h) { c.fillStyle = RED; c.fillRect(0, 0, w, h / 2); c.fillStyle = BLUE; c.fillRect(0, h / 2, w, h / 2); } },
    { l: 'F', n: 'Foxtrot', m: 'I am disabled; communicate with me.', d: function (c, w, h) { c.fillStyle = WHT; c.fillRect(0, 0, w, h); c.fillStyle = RED; c.beginPath(); c.moveTo(w / 2, h * 0.12); c.lineTo(w * 0.88, h / 2); c.lineTo(w / 2, h * 0.88); c.lineTo(w * 0.12, h / 2); c.closePath(); c.fill(); } },
    { l: 'G', n: 'Golf', m: 'I require a pilot. (Fishing: I am hauling nets.)', d: function (c, w, h) { for (var i = 0; i < 6; i++) { c.fillStyle = i % 2 ? BLUE : YEL; c.fillRect(i * w / 6, 0, w / 6 + 1, h); } } },
    { l: 'H', n: 'Hotel', m: 'I have a pilot on board.', d: function (c, w, h) { c.fillStyle = WHT; c.fillRect(0, 0, w, h); c.fillStyle = RED; c.fillRect(w / 2, 0, w / 2, h); } },
    { l: 'I', n: 'India', m: 'I am altering my course to port.', d: function (c, w, h) { c.fillStyle = YEL; c.fillRect(0, 0, w, h); c.fillStyle = BLK; c.beginPath(); c.arc(w / 2, h / 2, h * 0.28, 0, Math.PI * 2); c.fill(); } },
    { l: 'J', n: 'Juliett', m: 'I am on fire and have dangerous cargo; keep well clear.', d: function (c, w, h) { c.fillStyle = BLUE; c.fillRect(0, 0, w, h / 3); c.fillStyle = WHT; c.fillRect(0, h / 3, w, h / 3 + 1); c.fillStyle = BLUE; c.fillRect(0, 2 * h / 3, w, h / 3 + 1); } },
    { l: 'K', n: 'Kilo', m: 'I wish to communicate with you.', d: function (c, w, h) { c.fillStyle = YEL; c.fillRect(0, 0, w, h); c.fillStyle = BLUE; c.fillRect(w / 2, 0, w / 2, h); } },
    { l: 'L', n: 'Lima', m: 'You should stop your vessel immediately.', d: function (c, w, h) { c.fillStyle = YEL; c.fillRect(0, 0, w / 2, h / 2); c.fillRect(w / 2, h / 2, w / 2, h / 2); c.fillStyle = BLK; c.fillRect(w / 2, 0, w / 2, h / 2); c.fillRect(0, h / 2, w / 2, h / 2); } },
    { l: 'M', n: 'Mike', m: 'My vessel is stopped and making no way through the water.', d: function (c, w, h) { c.fillStyle = BLUE; c.fillRect(0, 0, w, h); saltire(c, w, h, WHT); } },
    { l: 'N', n: 'November', m: 'No / negative.', d: function (c, w, h) { var n = 4; for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { c.fillStyle = (i + j) % 2 ? WHT : BLUE; c.fillRect(i * w / n, j * h / n, w / n + 1, h / n + 1); } } },
    { l: 'O', n: 'Oscar', m: 'Man overboard.', d: function (c, w, h) { c.fillStyle = RED; c.fillRect(0, 0, w, h); c.fillStyle = YEL; c.beginPath(); c.moveTo(0, h); c.lineTo(w, 0); c.lineTo(0, 0); c.closePath(); c.fill(); } },
    { l: 'P', n: 'Papa', m: 'All persons should report on board; the vessel is about to proceed to sea.', d: function (c, w, h) { c.fillStyle = BLUE; c.fillRect(0, 0, w, h); c.fillStyle = WHT; var s = h * 0.5; c.fillRect(w / 2 - s / 2, h / 2 - s / 2, s, s); } },
    { l: 'Q', n: 'Quebec', m: 'My vessel is healthy and I request free pratique.', d: function (c, w, h) { c.fillStyle = YEL; c.fillRect(0, 0, w, h); } },
    { l: 'R', n: 'Romeo', m: 'Received (acknowledgment of signal).', d: function (c, w, h) { c.fillStyle = RED; c.fillRect(0, 0, w, h); cross(c, w, h, YEL); } },
    { l: 'S', n: 'Sierra', m: 'I am operating astern propulsion. (My engines are going astern.)', d: function (c, w, h) { c.fillStyle = WHT; c.fillRect(0, 0, w, h); c.fillStyle = BLUE; var s = h * 0.5; c.fillRect(w / 2 - s / 2, h / 2 - s / 2, s, s); } },
    { l: 'T', n: 'Tango', m: 'Keep clear of me; I am engaged in pair trawling.', d: function (c, w, h) { c.fillStyle = RED; c.fillRect(0, 0, w / 3, h); c.fillStyle = WHT; c.fillRect(w / 3, 0, w / 3 + 1, h); c.fillStyle = BLUE; c.fillRect(2 * w / 3, 0, w / 3 + 1, h); } },
    { l: 'U', n: 'Uniform', m: 'You are running into danger.', d: function (c, w, h) { c.fillStyle = RED; c.fillRect(0, 0, w / 2, h / 2); c.fillRect(w / 2, h / 2, w / 2, h / 2); c.fillStyle = WHT; c.fillRect(w / 2, 0, w / 2, h / 2); c.fillRect(0, h / 2, w / 2, h / 2); } },
    { l: 'V', n: 'Victor', m: 'I require assistance.', d: function (c, w, h) { c.fillStyle = WHT; c.fillRect(0, 0, w, h); saltire(c, w, h, RED); } },
    { l: 'W', n: 'Whiskey', m: 'I require medical assistance.', d: function (c, w, h) { c.fillStyle = BLUE; c.fillRect(0, 0, w, h); c.fillStyle = RED; c.fillRect(w / 2, 0, w / 2, h); c.fillRect(0, h / 2, w, h / 2); c.fillStyle = WHT; c.fillRect(w * 0.22, h * 0.18, w * 0.56, h * 0.64); } },
    { l: 'X', n: 'X-ray', m: 'Stop carrying out your intentions and watch for my signals.', d: function (c, w, h) { c.fillStyle = WHT; c.fillRect(0, 0, w, h); cross(c, w, h, BLUE); } },
    { l: 'Y', n: 'Yankee', m: 'I am dragging my anchor.', d: function (c, w, h) { c.fillStyle = YEL; c.fillRect(0, 0, w, h); c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip(); c.strokeStyle = RED; c.lineWidth = h / 5; var k; for (k = -h; k < w + h; k += h / 2.5) { if (Math.round(k / (h / 2.5)) % 2 === 0) continue; c.beginPath(); c.moveTo(k, -2); c.lineTo(k + h + 4, h + 2); c.stroke(); } c.restore(); } },
    { l: 'Z', n: 'Zulu', m: 'I require a tug. (Fishing: I am shooting nets.)', d: function (c, w, h) { tri(c, 0, 0, w, 0, w / 2, h / 2, YEL); tri(c, w, 0, w, h, w / 2, h / 2, RED); tri(c, 0, h, w, h, w / 2, h / 2, BLUE); tri(c, 0, 0, 0, h, w / 2, h / 2, BLK); } }
  ];

  function tri(c, x1, y1, x2, y2, x3, y3, col) {
    c.fillStyle = col; c.beginPath();
    c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); c.fill();
  }
  function saltire(c, w, h, col) {
    c.strokeStyle = col; c.lineWidth = h / 5; c.lineCap = 'butt';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.stroke();
    c.beginPath(); c.moveTo(w, 0); c.lineTo(0, h); c.stroke();
  }
  function cross(c, w, h, col) {
    c.fillStyle = col;
    c.fillRect(w / 2 - w * 0.12, 0, w * 0.24, h);
    c.fillRect(0, h / 2 - h * 0.14, w, h * 0.28);
  }

  function build(filter) {
    var grid = TN.el(SLUG + '-grid');
    grid.innerHTML = '';
    var q = (filter || '').trim().toLowerCase();
    var count = 0;
    FLAGS.forEach(function (f) {
      if (q && (f.l + ' ' + f.n + ' ' + f.m).toLowerCase().indexOf(q) === -1) return;
      count++;
      var card = document.createElement('div');
      card.className = 'tool-card';
      card.style.cssText = 'padding:10px;text-align:center;margin:0;cursor:pointer';
      card.title = 'Click to copy';
      var cv = document.createElement('canvas');
      cv.width = 90; cv.height = 60;
      cv.style.cssText = 'width:120px;max-width:100%;border:1px solid #444;border-radius:4px';
      var ctx = cv.getContext('2d');
      ctx.fillStyle = WHT; ctx.fillRect(0, 0, 90, 60);
      f.d(ctx, 90, 60);
      var lab = document.createElement('div');
      lab.style.cssText = 'font-weight:700;font-size:1.05rem;margin-top:6px';
      lab.textContent = f.l + ' · ' + f.n;
      var mean = document.createElement('div');
      mean.className = 'muted';
      mean.style.cssText = 'font-size:.75rem;margin-top:2px';
      mean.textContent = f.m;
      card.appendChild(cv); card.appendChild(lab); card.appendChild(mean);
      card.addEventListener('click', function () {
        TN.copy(f.l + ' (' + f.n + '): ' + f.m);
      });
      grid.appendChild(card);
    });
    if (count === 0) grid.innerHTML = '<p class="muted">No flags match "' + TN.esc(q) + '".</p>';
  }

  function init() {
    if (!TN.el(SLUG + '-grid')) return;
    build('');
    var deb = TN.debounce(function () { build(TN.el(SLUG + '-search').value); }, 150);
    TN.el(SLUG + '-search').addEventListener('input', deb);
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
