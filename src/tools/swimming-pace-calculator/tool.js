/* Swimming pace calculator: distance + time -> pace/100m, pace/100yd, m/s. */
(function () {
  'use strict';
  var SLUG = 'swimming-pace-calculator';
  function $(id) { return document.getElementById(id); }
  function fmtPace(sec) {
    if (!isFinite(sec) || sec <= 0) return '–';
    var m = Math.floor(sec / 60), s = Math.round(sec % 60);
    if (s === 60) { m++; s = 0; }
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var d = parseFloat($(SLUG + '-dist').value);
    var min = parseFloat($(SLUG + '-min').value) || 0;
    var sec = parseFloat($(SLUG + '-sec').value) || 0;
    if (isNaN(d) || d <= 0) { $(SLUG + '-error').textContent = 'Please enter a valid distance in meters.'; return; }
    if (min < 0 || sec < 0 || sec >= 60) { $(SLUG + '-error').textContent = 'Please enter a valid time.'; return; }
    var t = min * 60 + sec;
    if (t <= 0) { $(SLUG + '-error').textContent = 'Total time must be greater than zero.'; return; }
    $(SLUG + '-p100m').textContent = fmtPace(t / (d / 100)) + ' /100m';
    $(SLUG + '-p100yd').textContent = fmtPace(t / (d / 91.44)) + ' /100yd';
    $(SLUG + '-speed').textContent = (d / t).toFixed(2);
    $(SLUG + '-out').classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
