/* Plank progression timer: live hold timer + best (localStorage) + 4-week chart. */
(function () {
  'use strict';
  var SLUG = 'plank-progression-timer';
  var KEY = SLUG + '-best';
  var tick = null, startAt = 0, running = false;
  function $(id) { return document.getElementById(id); }
  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }
  function best() { var b = parseInt(localStorage.getItem(KEY), 10); return isNaN(b) ? 0 : b; }
  function showBest() {
    var b = best();
    $(SLUG + '-best').textContent = b > 0 ? fmt(b * 1000) : '–';
  }
  function chart() {
    var base = parseInt($(SLUG + '-base').value, 10);
    var box = $(SLUG + '-chart');
    if (isNaN(base) || base < 5) { box.classList.add('hidden'); return; }
    var html = '<p><strong>4-week progression</strong> — 3 holds per day, rest 60–90s between holds</p>';
    html += '<table class="data"><thead><tr><th>Week</th><th>Target per hold</th><th>Daily total</th></tr></thead><tbody>';
    for (var w = 1; w <= 4; w++) {
      var t = Math.round(base * (0.7 + w * 0.15));
      html += '<tr><td>Week ' + w + '</td><td>' + fmt(t * 1000) + '</td><td>' + fmt(t * 3 * 1000) + '</td></tr>';
    }
    html += '</tbody></table>';
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  function start() {
    $(SLUG + '-error').textContent = '';
    if (running) return;
    running = true; startAt = Date.now();
    $(SLUG + '-msg').textContent = 'Holding… press Stop when your form breaks.';
    clearInterval(tick);
    tick = setInterval(function () {
      $(SLUG + '-clock').textContent = fmt(Date.now() - startAt);
    }, 250);
  }
  function stop() {
    if (!running) return;
    running = false; clearInterval(tick);
    var held = Math.floor((Date.now() - startAt) / 1000);
    $(SLUG + '-clock').textContent = fmt(held * 1000);
    if (held > best()) {
      try { localStorage.setItem(KEY, String(held)); } catch (e) {}
      $(SLUG + '-msg').textContent = '🎉 New personal best: ' + fmt(held * 1000) + '!';
    } else {
      $(SLUG + '-msg').textContent = 'Held ' + fmt(held * 1000) + '. Best stays ' + fmt(best() * 1000) + '.';
    }
    showBest();
  }
  function reset() {
    running = false; clearInterval(tick);
    $(SLUG + '-clock').textContent = '0:00';
    $(SLUG + '-msg').textContent = '';
  }
  try {
    $(SLUG + '-start').addEventListener('click', start);
    $(SLUG + '-stop').addEventListener('click', stop);
    $(SLUG + '-reset').addEventListener('click', reset);
    $(SLUG + '-base').addEventListener('input', chart);
    showBest(); chart();
  } catch (e) { /* never throw on load */ }
})();
