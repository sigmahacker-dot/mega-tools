/* Tone Frequency Generator — 20Hz–20kHz oscillator, 4 waveforms, live sweep. */
(function () {
  'use strict';
  var SLUG = 'tone-frequency-generator';
  var ERR = SLUG + '-error';
  var actx = null, osc = null, gain = null;
  var playing = false;

  function $(id) { return document.getElementById(id); }

  function sliderToFreq(s) { return Math.round(20 * Math.pow(1000, s / 1000)); }
  function freqToSlider(f) { return Math.round(1000 * Math.log(f / 20) / Math.log(1000)); }

  function ctx() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { TN.setErr(ERR, 'Web Audio is not supported in this browser.'); return null; }
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function setFreq(f, fromSlider) {
    f = Math.max(20, Math.min(20000, Math.round(f)));
    $('tone-frequency-generator-f-v').textContent = f.toLocaleString('en-US');
    if (!fromSlider) $('tone-frequency-generator-f').value = freqToSlider(f);
    if (fromSlider) $('tone-frequency-generator-exact').value = f;
    if (osc && actx) osc.frequency.setTargetAtTime(f, actx.currentTime, 0.01);
  }

  function start() {
    var c = ctx();
    if (!c) return;
    stop();
    osc = c.createOscillator();
    gain = c.createGain();
    osc.type = $('tone-frequency-generator-wave').value;
    osc.frequency.value = parseFloat($('tone-frequency-generator-exact').value) || 440;
    var v = (parseInt($('tone-frequency-generator-vol').value, 10) || 30) / 100;
    gain.gain.value = v * 0.4;
    osc.connect(gain); gain.connect(c.destination);
    osc.start();
    playing = true;
    $('tone-frequency-generator-toggle').textContent = '⏹ Stop';
    TN.clearErr(ERR);
  }

  function stop() {
    if (osc) {
      try { osc.stop(); } catch (e) {}
      try { osc.disconnect(); } catch (e) {}
      osc = null;
    }
    if (gain) { try { gain.disconnect(); } catch (e) {} gain = null; }
    playing = false;
    $('tone-frequency-generator-toggle').textContent = '▶ Play tone';
  }

  try {
    setFreq(440, false);
    TN.on('tone-frequency-generator-f', 'input', function () {
      setFreq(sliderToFreq(parseInt($('tone-frequency-generator-f').value, 10)), true);
    });
    TN.on('tone-frequency-generator-exact', 'input', function () {
      var f = parseFloat($('tone-frequency-generator-exact').value);
      if (f >= 20 && f <= 20000) setFreq(f, false);
    });
    TN.on('tone-frequency-generator-wave', 'change', function () {
      if (osc) osc.type = $('tone-frequency-generator-wave').value;
    });
    TN.on('tone-frequency-generator-vol', 'input', function () {
      $('tone-frequency-generator-vol-v').textContent = $('tone-frequency-generator-vol').value;
      if (gain && actx) gain.gain.setTargetAtTime((parseInt($('tone-frequency-generator-vol').value, 10) / 100) * 0.4, actx.currentTime, 0.01);
    });
    TN.on('tone-frequency-generator-toggle', 'click', function () { playing ? stop() : start(); });
  } catch (e) { /* never throw on load */ }
})();
