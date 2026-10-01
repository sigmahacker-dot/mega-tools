/* Ideal weight calculator: Robinson, Miller, Devine, Hamwi from height + sex. */
(function () {
  'use strict';
  var SLUG = 'ideal-weight-calculator';
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var cm = parseFloat($(SLUG + '-height').value);
    var sex = $(SLUG + '-sex').value;
    if (isNaN(cm) || cm < 100 || cm > 250) { $(SLUG + '-error').textContent = 'Enter a valid height (100–250 cm).'; return; }
    var inch = cm / 2.54;
    var over = inch - 60; // inches over 5 ft
    var F;
    if (sex === 'm') {
      F = [
        ['Robinson', 52 + 1.9 * over],
        ['Miller', 56.2 + 1.41 * over],
        ['Devine', 50 + 2.3 * over],
        ['Hamwi', 48 + 2.7 * over]
      ];
    } else {
      F = [
        ['Robinson', 49 + 1.7 * over],
        ['Miller', 53.1 + 1.36 * over],
        ['Devine', 45.5 + 2.3 * over],
        ['Hamwi', 45.5 + 2.2 * over]
      ];
    }
    var vals = F.map(function (f) { return f[1]; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    $(SLUG + '-range').textContent = lo.toFixed(1) + ' – ' + hi.toFixed(1);
    $(SLUG + '-out').classList.remove('hidden');
    var html = '<table class="data"><thead><tr><th>Formula</th><th>Ideal weight (kg)</th></tr></thead><tbody>';
    F.forEach(function (f) {
      html += '<tr><td>' + f[0] + '</td><td>' + f[1].toFixed(1) + ' kg</td></tr>';
    });
    html += '</tbody></table>';
    if (inch < 60) html = '<p class="hint">⚠️ Below 5 ft (152 cm) these formulas extrapolate and are less reliable.</p>' + html;
    var box = $(SLUG + '-table');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
