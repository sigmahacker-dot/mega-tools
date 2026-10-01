/* Step to calorie converter: calories = steps x 0.045 x (weight/70). */
(function () {
  'use strict';
  var SLUG = 'step-to-calorie-converter';
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var s = parseFloat($(SLUG + '-steps').value);
    var w = parseFloat($(SLUG + '-weight').value);
    if (isNaN(s) || s < 0) { $(SLUG + '-error').textContent = 'Please enter a valid step count.'; return; }
    if (isNaN(w) || w <= 0 || w > 300) { $(SLUG + '-error').textContent = 'Please enter a valid body weight in kg (20-300).'; return; }
    var total = s * 0.045 * (w / 70);
    var per1k = 1000 * 0.045 * (w / 70);
    $(SLUG + '-total').textContent = Math.round(total).toLocaleString();
    $(SLUG + '-per1k').textContent = per1k.toFixed(1);
    $(SLUG + '-out').classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
