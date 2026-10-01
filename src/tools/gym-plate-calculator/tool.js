/* Gym plate calculator: bar + target -> plates per side (greedy), loading order. */
(function () {
  'use strict';
  var SLUG = 'gym-plate-calculator';
  var PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var bar = parseFloat($(SLUG + '-bar').value);
    var target = parseFloat($(SLUG + '-target').value);
    if (isNaN(target) || target <= 0) { $(SLUG + '-error').textContent = 'Enter a valid target weight.'; return; }
    if (target < bar) { $(SLUG + '-error').textContent = 'Target must be at least the bar weight (' + bar + ' kg).'; return; }
    var perSide = (target - bar) / 2;
    var rem = Math.round(perSide * 100) / 100;
    var used = [];
    PLATES.forEach(function (p) {
      var c = 0;
      while (rem >= p - 1e-9 && c < 12) { rem = Math.round((rem - p) * 100) / 100; used.push(p); c++; }
    });
    if (rem > 0.01) {
      $(SLUG + '-error').textContent = '⚠️ ' + rem.toFixed(2) + ' kg per side cannot be made with standard plates. Closest loadable per side: ' +
        (perSide - rem).toFixed(2) + ' kg.';
      return;
    }
    var loaded = bar + 2 * used.reduce(function (a, b) { return a + b; }, 0);
    $(SLUG + '-side').textContent = perSide.toFixed(2).replace(/\.?0+$/, '') + ' kg';
    $(SLUG + '-total').textContent = loaded + ' kg';
    $(SLUG + '-out').classList.remove('hidden');
    var counts = {};
    used.forEach(function (p) { counts[p] = (counts[p] || 0) + 1; });
    var order = Object.keys(counts).map(Number).sort(function (a, b) { return b - a; });
    var html = '<p><strong>Load per side, heaviest first</strong> (mirror on both sides):</p><ol>';
    order.forEach(function (p) {
      html += '<li>' + counts[p] + ' × ' + p + ' kg plate' + (counts[p] > 1 ? 's' : '') + '</li>';
    });
    html += '</ol><p class="hint">Then add collars. Double-check both sides match before lifting.</p>';
    var box = $(SLUG + '-plates');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
