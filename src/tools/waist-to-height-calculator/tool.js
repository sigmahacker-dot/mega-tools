/* Waist-to-height ratio calculator: waist/height -> category. */
(function () {
  'use strict';
  var SLUG = 'waist-to-height-calculator';
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var waist = parseFloat($(SLUG + '-waist').value);
    var height = parseFloat($(SLUG + '-height').value);
    if (isNaN(waist) || waist < 20 || waist > 300) { $(SLUG + '-error').textContent = 'Enter a valid waist (20–300 cm).'; return; }
    if (isNaN(height) || height < 50 || height > 250) { $(SLUG + '-error').textContent = 'Enter a valid height (50–250 cm).'; return; }
    var r = waist / height;
    var cat, tip;
    if (r < 0.4) { cat = 'Very lean'; tip = 'Your ratio is below 0.40. If unintentional weight loss occurred, consider a check-up.'; }
    else if (r < 0.5) { cat = '✅ Healthy'; tip = 'Great — your waist is under half your height. Keep it up with activity and balanced eating.'; }
    else if (r < 0.6) { cat = '⚠️ Increased risk'; tip = 'Above 0.50 is linked with higher cardiometabolic risk. Small, steady lifestyle changes help most.'; }
    else { cat = '🔴 High risk'; tip = 'At 0.60+, health risks rise notably. Consider talking to a healthcare professional about a plan.'; }
    $(SLUG + '-ratio').textContent = r.toFixed(3);
    $(SLUG + '-cat').textContent = cat;
    $(SLUG + '-tip').textContent = tip;
    $(SLUG + '-out').classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
