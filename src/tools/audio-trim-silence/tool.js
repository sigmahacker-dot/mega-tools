/* Audio Trim Silence — detect leading/trailing silence by dB threshold, trim, export 16-bit PCM WAV. */
(function () {
  'use strict';
  var SLUG = 'audio-trim-silence';
  var file = null, audioBuf = null;
  var trimStart = 0, trimEnd = 0, found = false;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function fmtTime(s) {
    s = Math.max(0, s);
    var m = Math.floor(s / 60), sec = s - m * 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(2);
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

  function thresholdDb() {
    var el = TN.el(SLUG + '-threshold');
    return el ? parseFloat(el.value) || -40 : -40;
  }
  function minLen() {
    var el = TN.el(SLUG + '-minlen');
    return el ? parseFloat(el.value) || 0.5 : 0.5;
  }

  function loadFile(f) {
    file = f || null;
    audioBuf = null;
    found = false;
    TN.hide(SLUG + '-result');
    TN.hide(SLUG + '-go');
    if (!file) return;
    TN.clearErr(SLUG + '-error');
    decode(file).then(function (ab) {
      audioBuf = ab;
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not decode this file. It may be corrupt or use an audio format your browser cannot read.');
    });
  }

  function detect() {
    TN.clearErr(SLUG + '-error');
    if (!audioBuf) { TN.setErr(SLUG + '-error', 'Choose an audio file first.'); return; }
    var ab = audioBuf;
    var thr = Math.pow(10, thresholdDb() / 20);
    var winLen = Math.max(1, Math.round(0.02 * ab.sampleRate)); // 20ms windows
    var nWin = Math.ceil(ab.length / winLen);
    var loud = new Array(nWin);
    var c, w, i;
    for (w = 0; w < nWin; w++) {
      var peak = 0;
      var s0 = w * winLen, s1 = Math.min(ab.length, s0 + winLen);
      for (c = 0; c < ab.numberOfChannels; c++) {
        var d = ab.getChannelData(c);
        for (i = s0; i < s1; i++) {
          var a = Math.abs(d[i]);
          if (a > peak) peak = a;
        }
      }
      loud[w] = peak >= thr;
    }
    var minWin = Math.max(1, Math.round(minLen() / 0.02));
    // leading: first loud window, but require the silence before it to be >= minWin
    var lead = 0;
    for (w = 0; w < nWin; w++) {
      if (loud[w]) {
        lead = w >= minWin ? w * winLen : 0;
        break;
      }
    }
    // trailing: last loud window
    var trail = 0;
    for (w = nWin - 1; w >= 0; w--) {
      if (loud[w]) {
        var silenceAfter = nWin - 1 - w;
        trail = silenceAfter >= minWin ? ab.length - Math.min(ab.length, (w + 1) * winLen) : 0;
        break;
      }
    }
    trimStart = lead;
    trimEnd = trail;
    found = true;
    var rows = TN.el(SLUG + '-rows');
    if (rows) {
      rows.innerHTML =
        '<tr><td>Original duration</td><td>' + fmtTime(ab.duration) + '</td></tr>' +
        '<tr><td>Silence at start</td><td>' + fmtTime(trimStart / ab.sampleRate) + '</td></tr>' +
        '<tr><td>Silence at end</td><td>' + fmtTime(trimEnd / ab.sampleRate) + '</td></tr>' +
        '<tr><td>Trimmed duration</td><td>' + fmtTime((ab.length - trimStart - trimEnd) / ab.sampleRate) + '</td></tr>';
    }
    TN.show(SLUG + '-result');
    TN.show(SLUG + '-go');
  }

  function go() {
    if (!found || !audioBuf) { TN.setErr(SLUG + '-error', 'Detect silence first.'); return; }
    var ab = audioBuf;
    var s0 = Math.min(trimStart, ab.length);
    var s1 = Math.max(s0, ab.length - trimEnd);
    var Ctor = AC();
    var tmp = new Ctor();
    try {
      var out = tmp.createBuffer(ab.numberOfChannels, Math.max(1, s1 - s0), ab.sampleRate);
      for (var c = 0; c < ab.numberOfChannels; c++) {
        out.getChannelData(c).set(ab.getChannelData(c).subarray(s0, s1));
      }
      var name = (file.name.replace(/\.[^.]+$/, '') || 'audio') + '-trimmed.wav';
      TN.download(encodeWav(out), name);
    } finally {
      try { tmp.close(); } catch (e) {}
    }
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
  TN.on(SLUG + '-threshold', 'input', function () {
    var el = TN.el(SLUG + '-threshold'), v = TN.el(SLUG + '-threshold-val');
    if (el && v) v.textContent = el.value;
  });
  TN.on(SLUG + '-minlen', 'input', function () {
    var el = TN.el(SLUG + '-minlen'), v = TN.el(SLUG + '-minlen-val');
    if (el && v) v.textContent = parseFloat(el.value).toFixed(1);
  });
  TN.on(SLUG + '-detect', 'click', detect);
  TN.on(SLUG + '-go', 'click', go);
})();
