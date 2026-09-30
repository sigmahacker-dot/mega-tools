/* Video Compressor — re-encode via canvas.captureStream + MediaRecorder at a chosen bitrate */
(function () {
  'use strict';
  var SLUG = 'video-compressor';
  var QUALITY = {
    low: { bps: 500000, maxW: 640, label: 'Low' },
    medium: { bps: 1500000, maxW: 1280, label: 'Medium' },
    high: { bps: 3000000, maxW: 1920, label: 'High' }
  };
  var file = null;
  var busy = false;

  function setStatus(t) {
    var s = TN.el(SLUG + '-status');
    if (s) s.textContent = t;
  }
  function setProg(p) {
    var bar = TN.el(SLUG + '-bar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, Math.round(p * 100))) + '%';
    var pr = TN.el(SLUG + '-progress');
    if (pr) pr.classList.toggle('hidden', !(p > 0 && p < 1));
  }
  function showCompare(orig, fresh) {
    var box = TN.el(SLUG + '-compare');
    if (!box) return;
    var o = TN.el(SLUG + '-orig'), n = TN.el(SLUG + '-new'), sv = TN.el(SLUG + '-saved');
    if (o) o.textContent = TN.fmtBytes(orig);
    if (n) n.textContent = TN.fmtBytes(fresh);
    if (sv) {
      var pct = orig > 0 ? Math.round((1 - fresh / orig) * 100) : 0;
      sv.textContent = pct > 0 ? pct + '%' : (pct === 0 ? '0%' : '+' + Math.abs(pct) + '% larger');
    }
    TN.show(box);
  }

  function pickMime() {
    var cands = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    for (var i = 0; i < cands.length; i++) {
      try {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported(cands[i])) return cands[i];
      } catch (e) {}
    }
    return '';
  }

  TN.on(SLUG + '-file', 'change', function () {
    var el = TN.el(SLUG + '-file');
    file = el && el.files && el.files[0] ? el.files[0] : null;
    TN.clearErr(SLUG + '-error');
    var btn = TN.el(SLUG + '-compress');
    if (btn) btn.disabled = !file;
    TN.hide(SLUG + '-compare');
    setStatus(file ? 'Selected: ' + file.name + ' (' + TN.fmtBytes(file.size) + ')' : '');
  });

  TN.on(SLUG + '-compress', 'click', function () {
    if (busy || !file) return;
    TN.clearErr(SLUG + '-error');
    TN.hide(SLUG + '-compare');
    if (typeof MediaRecorder === 'undefined') {
      TN.setErr(SLUG + '-error', 'Your browser does not support MediaRecorder, which is required to compress videos. Try Chrome, Edge or Firefox.');
      return;
    }
    var ACtor = window.AudioContext || window.webkitAudioContext;
    if (!ACtor) {
      TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio, which is required to process the video\u2019s audio track.');
      return;
    }
    var qEl = TN.el(SLUG + '-quality');
    var q = QUALITY[qEl && qEl.value] || QUALITY.medium;

    busy = true;
    var btn = TN.el(SLUG + '-compress');
    if (btn) btn.disabled = true;
    setProg(0.02);
    setStatus('Loading video\u2026');

    var url = URL.createObjectURL(file);
    var v = document.createElement('video');
    v.playsInline = true;
    v.preload = 'auto';
    v.src = url;

    function cleanup() { URL.revokeObjectURL(url); }
    function fail(msg) {
      TN.setErr(SLUG + '-error', msg);
      setStatus('');
      busy = false;
      var b2 = TN.el(SLUG + '-compress');
      if (b2) b2.disabled = !file;
      setProg(0);
      cleanup();
    }

    var loadTimer = setTimeout(function () { fail('Timed out loading the video. It may be corrupt or unsupported.'); }, 30000);
    v.addEventListener('loadedmetadata', function () {
      clearTimeout(loadTimer);
      var vw = v.videoWidth || 1280, vh = v.videoHeight || 720;
      var scale = Math.min(1, q.maxW / vw);
      var W = Math.max(2, Math.round(vw * scale)), H = Math.max(2, Math.round(vh * scale));
      setStatus('Compressing at ' + q.label + ' quality\u2026');

      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');

      var actx = new ACtor();
      var resumeP = Promise.resolve();
      try { resumeP = actx.resume() || Promise.resolve(); } catch (e) {}

      resumeP.then(function () {
        var dest = actx.createMediaStreamDestination();
        var srcNode = null;
        try { srcNode = actx.createMediaElementSource(v); srcNode.connect(dest); } catch (e) {}
        var cstream;
        try { cstream = canvas.captureStream(30); }
        catch (e) { throw new Error('Your browser does not support canvas capture, which is required to compress videos.'); }
        var combined = new MediaStream(cstream.getVideoTracks().concat(dest.stream.getAudioTracks()));
        var mime = pickMime();
        var rec;
        try {
          rec = new MediaRecorder(combined, mime ? { mimeType: mime, videoBitsPerSecond: q.bps } : undefined);
        } catch (e) {
          throw new Error('Could not start the video recorder: ' + (e && e.message || e));
        }
        var chunks = [];
        rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) chunks.push(ev.data); };
        var stopped = new Promise(function (r) { rec.onstop = r; });
        rec.start(250);

        var done = false;
        function draw() {
          if (done) return;
          if (v.ended || (v.paused && v.duration && v.currentTime >= v.duration - 0.08)) {
            done = true;
            rec.stop();
            return;
          }
          try { ctx.drawImage(v, 0, 0, W, H); } catch (e) {}
          if (v.duration) setProg(0.03 + 0.9 * Math.min(1, v.currentTime / v.duration));
          requestAnimationFrame(draw);
        }
        v.addEventListener('ended', function () {
          if (!done) { done = true; rec.stop(); }
        });
        v.addEventListener('error', function () {
          if (!done) { done = true; try { rec.stop(); } catch (e2) {} }
          fail('Could not read the video. It may be corrupt or use an unsupported format.');
        });

        stopped.then(function () {
          var blob = new Blob(chunks, { type: rec.mimeType || mime || 'video/webm' });
          try { if (srcNode) srcNode.disconnect(); } catch (e3) {}
          try { actx.close(); } catch (e4) {}
          cleanup();
          var ext = (rec.mimeType || mime || '').indexOf('mp4') >= 0 ? 'mp4' : 'webm';
          setProg(1);
          setStatus('Done — compressed video is ' + TN.fmtBytes(blob.size) + '.');
          showCompare(file.size, blob.size);
          var name = (file.name.replace(/\.[^.]+$/, '') || 'video') + '-compressed.' + ext;
          TN.download(blob, name);
          busy = false;
          var b3 = TN.el(SLUG + '-compress');
          if (b3) b3.disabled = !file;
          setProg(0);
        });
        draw();
        var pr;
        try { pr = v.play(); } catch (e5) { fail('Playback was blocked by the browser. Please try again.'); return; }
        if (pr && pr.catch) pr.catch(function () { fail('Playback was blocked by the browser. Please interact with the page and try again.'); });
      }).catch(function (err) {
        fail((err && err.message) || String(err));
      });
    });
    v.addEventListener('error', function () {
      clearTimeout(loadTimer);
      fail('Could not load this video file. It may be corrupt or in an unsupported format.');
    });
  });
})();
