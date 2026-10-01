/* Hiking pace calculator: Naismith's rule (12 min/km + 10 min/100m ascent). */
(function () {
  'use strict';
  var SLUG = 'hiking-pace-calculator';
  function $(id) { return document.getElementById(id); }
  function fmt(mins) {
    var h = Math.floor(mins / 60), m = Math.round(mins % 60);
    if (m === 60) { h++; m = 0; }
    return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
  }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var d = parseFloat($(SLUG + '-dist').value);
    var a = parseFloat($(SLUG + '-ascent').value);
    var fit = parseFloat($(SLUG + '-fit').value);
    if (isNaN(d) || d <= 0) { $(SLUG + '-error').textContent = 'Enter a valid distance in km.'; return; }
    if (isNaN(a) || a < 0) { $(SLUG + '-error').textContent = 'Enter total ascent in meters (0 if flat).'; return; }
    var flatMin = d * 12;
    var climbMin = (a / 100) * 10;
    var base = flatMin + climbMin;
    var adj = base * fit;
    $(SLUG + '-time').textContent = fmt(adj);
    $(SLUG + '-pace').textContent = (adj / d).toFixed(1);
    $(SLUG + '-out').classList.remove('hidden');
    var box = $(SLUG + '-break');
    box.innerHTML = '<p><strong>Naismith breakdown:</strong> ' + fmt(flatMin) + ' for distance + ' + fmt(climbMin) +
      ' for ascent = ' + fmt(base) + ' base. Fitness adjustment ×' + fit + ' → <strong>' + fmt(adj) +
      '</strong>. Add 10–15% buffer for breaks and rough terrain.</p>';
    box.classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
