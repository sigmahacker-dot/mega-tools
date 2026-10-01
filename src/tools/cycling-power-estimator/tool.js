/* Cycling power estimator: P = aero + rolling + gravity (standard model). */
(function () {
  'use strict';
  var SLUG = 'cycling-power-estimator';
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var speed = parseFloat($(SLUG + '-speed').value);
    var rider = parseFloat($(SLUG + '-rider').value);
    var bike = parseFloat($(SLUG + '-bike').value);
    var grade = parseFloat($(SLUG + '-grade').value);
    if (isNaN(speed) || speed <= 0) { $(SLUG + '-error').textContent = 'Enter a valid speed in km/h.'; return; }
    if (isNaN(rider) || rider < 20 || rider > 250) { $(SLUG + '-error').textContent = 'Enter a valid rider weight (20–250 kg).'; return; }
    if (isNaN(bike) || bike < 1 || bike > 40) { $(SLUG + '-error').textContent = 'Enter a valid bike weight (1–40 kg).'; return; }
    if (isNaN(grade)) { $(SLUG + '-error').textContent = 'Enter a gradient in percent (0 for flat).'; return; }
    var v = speed / 3.6;             // m/s
    var m = rider + bike;            // total mass kg
    var g = 9.81;
    var pAero = 0.5 * 1.225 * 0.32 * Math.pow(v, 3);
    var pRoll = 0.005 * m * g * v;
    var pGrav = m * g * (grade / 100) * v;
    var total = Math.max(0, pAero + pRoll + pGrav);
    $(SLUG + '-watts').textContent = Math.round(total) + ' W';
    $(SLUG + '-wkg').textContent = (total / rider).toFixed(2) + ' W/kg';
    var box = $(SLUG + '-break');
    box.innerHTML = '<p><strong>Breakdown:</strong> aero drag ' + Math.round(pAero) + ' W · rolling ' +
      Math.round(pRoll) + ' W · gravity ' + Math.round(pGrav) + ' W</p>';
    box.classList.remove('hidden');
    $(SLUG + '-out').classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
