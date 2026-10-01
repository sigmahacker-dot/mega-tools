/* Audio Volume Booster — gain 100–300% with clipping report, export 16-bit PCM WAV. */
(function () {
  'use strict';
  var SLUG = 'audio-volume-booster';
  var file = null, audioBuf = null;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function fmtTime(s) {
    s = Math.max(0, s);
    var m = Math.floor(s / 60), sec = s - m * 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(1);
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
    var chans = [], c;
    for (c = 0; c < ch; c++) chans.push(ab.getChannelData(c));
    var off = 44;
    for (var i = 0; i < len; i++) {
      for (c = 0; c < ch; c++) {
        var s = Math.max(-1, Math.min(1, chans[c][i]));
        v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        off += 2;
      }
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  function decode(f) {
    var Ctor = AC();
    if (!Ctor) return Promise.reject(new Error('Your browser does not support Web Audio.'));
    var actx = new Ctor();
    return TN.readAsArrayBuffer(f).then(function (b) { return actx.decodeAudioData(b); }).then(
      function (ab) { try { actx.close(); } catch (e) {} return ab; },
      function (e) { try { actx.close(); } catch (e2) {} throw e; }
    );
  }

  function makeBuffer(ab) {
    var Ctor = AC();
    var tmp = new Ctor();
    try {
      var out = tmp.createBuffer(ab.numberOfChannels, ab.length, ab.sampleRate);
      for (var c = 0; c < ab.numberOfChannels; c++) out.getChannelData(c).set(ab.getChannelData(c));
      return out;
    } finally {
      try { tmp.close(); } catch (e) {}
    }
  }

  function gainVal() {
    var el = TN.el(SLUG + '-gain');
    return el ? (parseFloat(el.value) || 100) / 100 : 1;
  }

  function loadFile(f) {
    file = f || null;
    audioBuf = null;
    TN.hide(SLUG + '-result');
    if (!file) return;
    TN.clearErr(SLUG + '-error');
    decode(file).then(function (ab) {
      audioBuf = ab;
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not decode this file. It may be corrupt or use an audio format your browser cannot read.');
    });
  }

  function go() {
    TN.clearErr(SLUG + '-error');
    if (!audioBuf) { TN.setErr(SLUG + '-error', 'Choose an audio file first.'); return; }
    var g = gainVal();
    var ab = audioBuf;
    var out = makeBuffer(ab);
    var peak = 0, clipped = 0, c, i;
    for (c = 0; c < out.numberOfChannels; c++) {
      var d = out.getChannelData(c);
      for (i = 0; i < d.length; i++) {
        var v = d[i] * g;
        if (v > 1 || v < -1) { clipped++; v = Math.max(-1, Math.min(1, v)); }
        d[i] = v;
        var a = Math.abs(v);
        if (a > peak) peak = a;
      }
    }
    var pct = 100 * clipped / (out.length * out.numberOfChannels);
    var rows = TN.el(SLUG + '-rows');
    if (rows) {
      rows.innerHTML =
        '<tr><td>Duration</td><td>' + fmtTime(out.duration) + '</td></tr>' +
        '<tr><td>Gain applied</td><td>' + Math.round(g * 100) + '%</td></tr>' +
        '<tr><td>Peak after boost</td><td>' + (20 * Math.log10(Math.max(peak, 1e-6))).toFixed(1) + ' dBFS</td></tr>' +
        '<tr><td>Clipped samples</td><td>' + clipped + ' (' + pct.toFixed(2) + '%)' +
        (clipped > 0 ? ' — <span class="error">lower the gain to avoid distortion</span>' : '') + '</td></tr>';
    }
    TN.show(SLUG + '-result');
    var name = (file.name.replace(/\.[^.]+$/, '') || 'audio') + '-boosted.wav';
    TN.download(encodeWav(out), name);
  }

  var dz = TN.el(SLUG + '-drop'), input = TN.el(SLUG + '-file');
  if (dz && input) {
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) loadFile(input.files[0]);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });
  }
  TN.on(SLUG + '-gain', 'input', function () {
    var el = TN.el(SLUG + '-gain'), v = TN.el(SLUG + '-gain-val');
    if (el && v) v.textContent = el.value;
  });
  TN.on(SLUG + '-go', 'click', go);
})();
