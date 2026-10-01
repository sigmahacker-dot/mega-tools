/* Running cadence calculator: 30s step count -> spm + rating vs 170-180. */
(function () {
  'use strict';
  var SLUG = 'running-cadence-calculator';
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var s = parseInt($(SLUG + '-steps').value, 10);
    if (isNaN(s) || s < 1 || s > 200) { $(SLUG + '-error').textContent = 'Enter steps counted in 30 seconds (1–200).'; return; }
    var spm = s * 2;
    var rating, tip;
    if (spm < 160) {
      rating = '🔴 Low';
      tip = 'Under 160 spm often means overstriding. Try shortening your stride and aiming for quicker, lighter steps — add ~5 spm at a time.';
    } else if (spm < 170) {
      rating = '🟡 Moderate';
      tip = 'Decent cadence. Nudging toward 170 spm with slightly shorter strides can reduce impact forces.';
    } else if (spm <= 180) {
      rating = '🟢 Optimal';
      tip = 'Right in the efficient 170–180 zone — nice running! Keep strides short and relaxed.';
    } else {
      rating = '🔵 High';
      tip = 'Above 180 spm is quick — great for racing, but make sure you are not sacrificing stride power on easy runs.';
    }
    $(SLUG + '-spm').textContent = spm + ' spm';
    $(SLUG + '-rating').textContent = rating;
    $(SLUG + '-tip').textContent = tip;
    $(SLUG + '-out').classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
