/* Medicine dosage calculator: weight x mg/kg -> single dose + daily total. Verify with a professional! */
(function () {
  'use strict';
  var SLUG = 'medicine-dosage-calculator';
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var w = parseFloat($(SLUG + '-weight').value);
    var mgkg = parseFloat($(SLUG + '-mgkg').value);
    var per = parseInt($(SLUG + '-perday').value, 10);
    if (isNaN(w) || w < 1 || w > 300) { $(SLUG + '-error').textContent = 'Enter a valid weight (1–300 kg).'; return; }
    if (isNaN(mgkg) || mgkg <= 0 || mgkg > 1000) { $(SLUG + '-error').textContent = 'Enter the prescribed mg/kg from the label or clinician.'; return; }
    if (isNaN(per) || per < 1 || per > 12) { $(SLUG + '-error').textContent = 'Enter doses per day (1–12).'; return; }
    var single = w * mgkg;
    var daily = single * per;
    $(SLUG + '-single').textContent = (Math.round(single * 100) / 100) + ' mg';
    $(SLUG + '-daily').textContent = (Math.round(daily * 100) / 100) + ' mg';
    $(SLUG + '-out').classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
