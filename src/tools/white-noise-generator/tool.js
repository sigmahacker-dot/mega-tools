/* White Noise Generator — white/pink/brown noise via AudioBufferSourceNode. */
(function () {
  'use strict';
  var SLUG = 'white-noise-generator';
  var ERR = SLUG + '-error';
  var type = 'white';
  var actx = null, src = null, gain = null, filter = null;
  var playing = false, timerId = null;

  function $(id) { return document.getElementById(id); }

  function ctx() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { TN.setErr(ERR, 'Web Audio is not supported in this browser.'); return null; }
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function makeBuffer(c, seconds) {
    var len = Math.floor(c.sampleRate * seconds);
    var b = c.createBuffer(1, len, c.sampleRate);
    var d = b.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (type === 'white') d[i] = w;
      else if (type === 'pink') {
        // Paul Kellet's pink noise approximation
        last = 0.997 * last + 0.029591 * w + 0.032534 * w; // simplified
        d[i] = last * 3.2;
      } else { // brown
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    return b;
  }

  function start() {
    var c = ctx();
    if (!c) return;
    stop();
    src = c.createBufferSource();
    src.buffer = makeBuffer(c, 4);
    src.loop = true;
    gain = c.createGain();
    var vol = (parseInt($('white-noise-generator-vol').value, 10) || 50) / 100;
    gain.gain.value = vol * 0.5;
    if (type !== 'white') {
      filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = type === 'pink' ? 4000 : 800;
      src.connect(filter); filter.connect(gain);
    } else {
      src.connect(gain);
    }
    gain.connect(c.destination);
    src.start();
    playing = true;
    $('white-noise-generator-toggle').textContent = '⏹ Stop';
    $('white-noise-generator-status').textContent = 'Playing ' + type + ' noise…';
    var mins = parseInt($('white-noise-generator-timer').value, 10) || 0;
    if (mins > 0) {
      $('white-noise-generator-status').textContent += ' Auto-stop in ' + mins + ' min.';
      timerId = setTimeout(stop, mins * 60 * 1000);
    }
    TN.clearErr(ERR);
  }

  function stop() {
    if (timerId) { clearTimeout(timerId); timerId = null; }
    if (src) {
      try { src.stop(); } catch (e) {}
      try { src.disconnect(); } catch (e) {}
      src = null;
    }
    if (gain) { try { gain.disconnect(); } catch (e) {} gain = null; }
    if (filter) { try { filter.disconnect(); } catch (e) {} filter = null; }
    playing = false;
    $('white-noise-generator-toggle').textContent = '▶ Play';
    $('white-noise-generator-status').textContent = '';
  }

  try {
    var btns = $('white-noise-generator-types').querySelectorAll('button');
    for (var k = 0; k < btns.length; k++) {
      (function (b) {
        b.addEventListener('click', function () {
          type = b.getAttribute('data-t');
          for (var j = 0; j < btns.length; j++) btns[j].className = 'btn' + (btns[j] === b ? '' : ' btn-outline');
          if (playing) start(); // restart with new type
        });
      })(btns[k]);
    }
    TN.on('white-noise-generator-vol', 'input', function () {
      $('white-noise-generator-vol-v').textContent = $('white-noise-generator-vol').value;
      if (gain && actx) gain.gain.value = (parseInt($('white-noise-generator-vol').value, 10) / 100) * 0.5;
    });
    TN.on('white-noise-generator-toggle', 'click', function () { playing ? stop() : start(); });
  } catch (e) { /* never throw on load */ }
})();
