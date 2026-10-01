/* Aim Trainer — random targets, 30s round, hits/misses/accuracy. */
(function () {
  'use strict';
  var SLUG = 'aim-trainer-game';
  var DURATION = 30;
  var running = false;
  var hits = 0, misses = 0, timeLeft = DURATION, best = 0;
  var tickId = null, targetId = null, targetEl = null, targetTimer = null;

  function $(id) { return document.getElementById(id); }
  function arena() { return $('aim-trainer-game-arena'); }

  function loadBest() {
    try { best = parseInt(localStorage.getItem('aim-best') || '0', 10) || 0; } catch (e) { best = 0; }
    $('aim-trainer-game-best').textContent = best;
  }

  function updateStats() {
    $('aim-trainer-game-score').textContent = hits;
    $('aim-trainer-game-miss').textContent = misses;
    var total = hits + misses;
    $('aim-trainer-game-acc').textContent = total ? Math.round(hits / total * 100) + '%' : '–';
    $('aim-trainer-game-time').textContent = timeLeft;
  }

  function clearTarget() {
    if (targetTimer) { clearTimeout(targetTimer); targetTimer = null; }
    if (targetEl && targetEl.parentNode) targetEl.parentNode.removeChild(targetEl);
    targetEl = null;
  }

  function spawnTarget() {
    if (!running) return;
    clearTarget();
    var a = arena();
    var progress = 1 - timeLeft / DURATION;
    var size = Math.round(64 - progress * 28); // 64px -> 36px
    var t = document.createElement('button');
    t.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
      'background:radial-gradient(circle, #ff5252 0 30%, #fff 30% 55%, #ff5252 55% 100%);' +
      'border:none;cursor:pointer;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.4)';
    t.setAttribute('aria-label', 'Target');
    var maxX = a.clientWidth - size, maxY = a.clientHeight - size;
    t.style.left = Math.max(0, Math.floor(Math.random() * maxX)) + 'px';
    t.style.top = Math.max(0, Math.floor(Math.random() * maxY)) + 'px';
    t.addEventListener('mousedown', function (e) {
      e.stopPropagation();
      if (!running) return;
      hits++;
      updateStats();
      spawnTarget();
    });
    a.appendChild(t);
    targetEl = t;
    var life = Math.max(700, 1400 - progress * 700);
    targetTimer = setTimeout(function () { if (running) spawnTarget(); }, life);
  }

  function end() {
    running = false;
    clearInterval(tickId);
    clearTarget();
    $('aim-trainer-game-msg').textContent = 'Done! ' + hits + ' hits, ' + misses + ' misses' +
      (hits + misses ? ' (' + Math.round(hits / (hits + misses) * 100) + '% accuracy)' : '') + '. Press Start to go again.';
    if (hits > best) {
      best = hits;
      try { localStorage.setItem('aim-best', String(best)); } catch (e) {}
      $('aim-trainer-game-best').textContent = best;
    }
    $('aim-trainer-game-start').disabled = false;
  }

  function start() {
    if (running) return;
    hits = 0; misses = 0; timeLeft = DURATION; running = true;
    $('aim-trainer-game-msg').textContent = 'Go! Click the targets.';
    $('aim-trainer-game-start').disabled = true;
    updateStats();
    spawnTarget();
    tickId = setInterval(function () {
      timeLeft--;
      updateStats();
      if (timeLeft <= 0) end();
    }, 1000);
  }

  try {
    loadBest();
    TN.on('aim-trainer-game-start', 'click', start);
    arena().addEventListener('mousedown', function () {
      if (running && targetEl) { misses++; updateStats(); }
    });
  } catch (e) { /* never throw on load */ }
})();
