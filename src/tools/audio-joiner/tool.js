/* Audio Joiner — decode multiple files, concatenate, export one 16-bit PCM WAV. */
(function () {
  'use strict';
  var SLUG = 'audio-joiner';
  var files = [];
  var decoded = [];

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

  function renderList() {
    var ul = TN.el(SLUG + '-list');
    if (!ul) return;
    var html = '';
    for (var i = 0; i < files.length; i++) {
      html += '<li><span>' + TN.esc(files[i].name || 'audio') +
        ' <span class="muted">(' + TN.fmtBytes(files[i].size) + ')</span></span>' +
        '<button class="btn btn-outline" data-rm="' + i + '">Remove</button></li>';
    }
    ul.innerHTML = html;
  }

  function addFiles(list) {
    var added = 0;
    for (var i = 0; i < list.length; i++) {
      if ((list[i].type || '').indexOf('audio/') === 0 || /\.(mp3|wav|ogg|oga|m4a|aac|flac|webm)$/i.test(list[i].name || '')) {
        files.push(list[i]); added++;
      }
    }
    if (!added) TN.setErr(SLUG + '-error', 'No audio files found in that selection.');
    else TN.clearErr(SLUG + '-error');
    renderList();
  }

  function join() {
    TN.clearErr(SLUG + '-error');
    if (!files.length) { TN.setErr(SLUG + '-error', 'Add some audio files first.'); return; }
    var Ctor = AC();
    if (!Ctor) { TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio.'); return; }
    var btn = TN.el(SLUG + '-join');
    if (btn) btn.textContent = 'Decoding…';
    var actx = new Ctor();
    var chain = Promise.resolve();
    decoded = [];
    files.forEach(function (f) {
      chain = chain.then(function () {
        return TN.readAsArrayBuffer(f).then(function (b) { return actx.decodeAudioData(b); }).then(function (ab) {
          decoded.push(ab);
        });
      });
    });
    chain.then(function () {
      if (!decoded.length) throw new Error('nothing decoded');
      // Use the first file's sample rate; resample others by simple interpolation.
      var sr = decoded[0].sampleRate, ch = 1;
      decoded.forEach(function (ab) { ch = Math.max(ch, ab.numberOfChannels); });
      var totalLen = 0;
      var parts = decoded.map(function (ab) {
        var scale = sr / ab.sampleRate;
        var len = Math.round(ab.length * scale);
        totalLen += len;
        return { ab: ab, len: len, scale: scale, ch: ab.numberOfChannels };
      });
      var out = actx.createBuffer(ch, totalLen, sr);
      var offset = 0, c, i;
      parts.forEach(function (p) {
        for (c = 0; c < ch; c++) {
          var srcCh = p.ab.getChannelData(Math.min(c, p.ch - 1));
          var dst = out.getChannelData(c);
          for (i = 0; i < p.len; i++) {
            var si = i / p.scale;
            var i0 = Math.floor(si), f0 = si - i0;
            var v0 = srcCh[i0] || 0, v1 = srcCh[Math.min(i0 + 1, srcCh.length - 1)] || 0;
            dst[offset + i] = v0 + (v1 - v0) * f0;
          }
        }
        offset += p.len;
      });
      var wav = encodeWav(out);
      TN.show(SLUG + '-stats');
      TN.el(SLUG + '-count').textContent = decoded.length;
      TN.el(SLUG + '-duration').textContent = fmtTime(totalLen / sr);
      TN.download(wav, 'joined-audio.wav');
      if (btn) btn.textContent = 'Join & download WAV';
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not decode one of the files. It may be corrupt or an unsupported format.');
      if (btn) btn.textContent = 'Join & download WAV';
    }).then(function () {
      try { actx.close(); } catch (e) {}
    });
  }

  var dz = TN.el(SLUG + '-drop'), input = TN.el(SLUG + '-file');
  if (dz && input) {
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      addFiles(input.files || []);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }
  var list = TN.el(SLUG + '-list');
  if (list) list.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-rm]') : null;
    if (b) { files.splice(parseInt(b.getAttribute('data-rm'), 10), 1); renderList(); }
  });
  TN.on(SLUG + '-join', 'click', join);
})();
