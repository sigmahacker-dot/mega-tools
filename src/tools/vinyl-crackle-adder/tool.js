/* Vinyl Crackle Adder — procedurally generated pops + surface hiss mixed in. */
(function () {
  'use strict';
  var SLUG = 'vinyl-crackle-adder';
  var ERR = SLUG + '-error';
  var audioBuf = null, fileName = 'audio';
  var outBuf = null;
  var actx = null, playSrc = null;
  var busy = false;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function go() {
    if (busy) return;
    TN.clearErr(ERR);
    if (!audioBuf) { TN.setErr(ERR, 'Choose an audio file first.'); return; }
    var crackleAmt = (parseFloat(document.getElementById(SLUG + '-crackle').value) || 0) / 100;
    var popDensity = (parseFloat(document.getElementById(SLUG + '-pops').value) || 0) / 100;
    var hissAmt = (parseFloat(document.getElementById(SLUG + '-hiss').value) || 0) / 100;
    if (crackleAmt === 0 && popDensity === 0 && hissAmt === 0) {
      TN.setErr(ERR, 'Turn up at least one of crackle, pops or hiss first.');
      return;
    }
    busy = true;
    var btn = document.getElementById(SLUG + '-go');
    if (btn) btn.disabled = true;
    document.getElementById(SLUG + '-play').classList.add('hidden');
    document.getElementById(SLUG + '-download').classList.add('hidden');
    outBuf = null;

    setTimeout(function () {
      try {
        var Ctor = AC();
        var tmp = new Ctor();
        var sr = audioBuf.sampleRate, len = audioBuf.length;
        var ch = Math.min(audioBuf.numberOfChannels, 2);
        outBuf = tmp.createBuffer(ch, len, sr);

        // --- synthesize the vinyl noise bed (mono, applied to all channels) ---
        var bed = new Float32Array(len);
        // surface hiss: lowpassed white noise
        var hissGain = 0.012 * hissAmt;
        var lp = 0;
        for (var i = 0; i < len; i++) {
          var w = Math.random() * 2 - 1;
          lp = 0.94 * lp + 0.06 * w; // one-pole lowpass ≈ warm hiss
          bed[i] += lp * hissGain * 3;
        }
        // crackle: sparse tiny impulses
        var crackleRate = 0.0006 * crackleAmt; // probability per sample
        for (var j = 0; j < len; j++) {
          if (Math.random() < crackleRate) {
            var amp = (Math.random() * 0.5 + 0.1) * 0.05 * crackleAmt * (Math.random() < 0.5 ? -1 : 1);
            var dec = 20 + Math.floor(Math.random() * 60);
            for (var k = 0; k < dec && j + k < len; k++) {
              bed[j + k] += amp * Math.exp(-k / 12);
            }
          }
        }
        // pops: rarer, louder, longer decay
        var popRate = 0.00002 * popDensity;
        for (var m = 0; m < len; m++) {
          if (Math.random() < popRate) {
            var pamp = (Math.random() * 0.6 + 0.3) * 0.35 * Math.max(popDensity, 0.15) * (Math.random() < 0.5 ? -1 : 1);
            var pdec = 200 + Math.floor(Math.random() * 600);
            for (var q = 0; q < pdec && m + q < len; q++) {
              bed[m + q] += pamp * Math.exp(-q / 90);
            }
          }
        }

        // --- mix bed into audio ---
        for (var c = 0; c < ch; c++) {
          var src = audioBuf.getChannelData(c);
          var dst = outBuf.getChannelData(c);
          for (var s = 0; s < len; s++) {
            var v = src[s] + bed[s];
            dst[s] = Math.max(-1, Math.min(1, v));
          }
        }
        try { tmp.close(); } catch (e) {}
        document.getElementById(SLUG + '-play').classList.remove('hidden');
        document.getElementById(SLUG + '-download').classList.remove('hidden');
      } catch (e) {
        TN.setErr(ERR, 'Processing failed: ' + (e && e.message || e));
      }
      busy = false;
      if (btn) btn.disabled = false;
    }, 30);
  }

  function encodeWav(ab) {
    var ch = Math.min(ab.numberOfChannels, 2), sr = ab.sampleRate, len = ab.length;
    var bytes = 44 + len * ch * 2;
    var buf = new ArrayBuffer(bytes), v = new DataView(buf);
    function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    ws(0, 'RIFF'); v.setUint32(4, bytes - 8, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true);
    v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, len * ch * 2, true);
    var chans = [];
    for (var c = 0; c < ch; c++) chans.push(ab.getChannelData(c));
    var off = 44;
    for (var i = 0; i < len; i++) {
      for (var cc = 0; cc < ch; cc++) {
        var s = Math.max(-1, Math.min(1, chans[cc][i]));
        v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        off += 2;
      }
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  function stopPlay() {
    try { if (playSrc) playSrc.stop(); } catch (e) {}
    playSrc = null;
  }

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      stopPlay();
      audioBuf = null; outBuf = null;
      document.getElementById(SLUG + '-play').classList.add('hidden');
      document.getElementById(SLUG + '-download').classList.add('hidden');
      if (!f) return;
      TN.clearErr(ERR);
      fileName = (f.name || 'audio').replace(/\.[^.]+$/, '') || 'audio';
      var Ctor = AC();
      if (!Ctor) { TN.setErr(ERR, 'Your browser does not support Web Audio.'); return; }
      var tmp = new Ctor();
      TN.readAsArrayBuffer(f).then(function (b) { return tmp.decodeAudioData(b); }).then(function (ab) {
        audioBuf = ab;
        try { tmp.close(); } catch (e) {}
      }).catch(function () {
        try { tmp.close(); } catch (e2) {}
        TN.setErr(ERR, 'Could not decode this file. It may use a format your browser cannot read.');
      });
    });
    [['crackle'], ['pops'], ['hiss']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        document.getElementById(SLUG + '-' + k[0] + '-val').textContent = this.value;
      });
    });
    TN.on(SLUG + '-go', 'click', go);
    TN.on(SLUG + '-play', 'click', function () {
      if (!outBuf) return;
      stopPlay();
      var Ctor = AC();
      actx = actx || new Ctor();
      if (actx.state === 'suspended') actx.resume();
      playSrc = actx.createBufferSource();
      playSrc.buffer = outBuf;
      playSrc.connect(actx.destination);
      playSrc.start();
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!outBuf) return;
      TN.download(encodeWav(outBuf), fileName + '-vinyl.wav');
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
