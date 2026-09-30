/* Video to GIF Converter — seek frames, draw to canvas, encode with gif.js */
(function () {
  'use strict';
  var SLUG = 'video-to-gif';
  var WORKER_URL = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js';
  var workerPromise = null;
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

  function getWorkerScript() {
    if (!workerPromise) {
      workerPromise = fetch(WORKER_URL).then(function (r) {
        if (!r.ok) throw new Error('worker http ' + r.status);
        return r.text();
      }).then(function (src) {
        return URL.createObjectURL(new Blob([src], { type: 'application/javascript' }));
      });
    }
    return workerPromise;
  }

  function seekTo(v, t) {
    return new Promise(function (res, rej) {
      // Already at the target time: no 'seeked' event will fire
      if (v.readyState >= 2 && Math.abs(v.currentTime - t) < 0.0001) { res(); return; }
      var timer = setTimeout(function () { cleanup(); rej(new Error('seek timed out')); }, 10000);
      function cleanup() {
        clearTimeout(timer);
        v.removeEventListener('seeked', done);
        v.removeEventListener('error', onErr);
      }
      function done() { cleanup(); res(); }
      function onErr() { cleanup(); rej(new Error('seek failed')); }
      v.addEventListener('seeked', done);
      v.addEventListener('error', onErr);
      try { v.currentTime = t; } catch (e) { onErr(); }
    });
  }

  function once(el, evt) {
    return new Promise(function (res, rej) {
      function ok() { el.removeEventListener(evt, ok); el.removeEventListener('error', bad); res(); }
      function bad() { el.removeEventListener(evt, ok); el.removeEventListener('error', bad); rej(new Error('video load failed')); }
      el.addEventListener(evt, ok);
      el.addEventListener('error', bad);
    });
  }

  TN.on(SLUG + '-file', 'change', function () {
    var el = TN.el(SLUG + '-file');
    file = el && el.files && el.files[0] ? el.files[0] : null;
    TN.clearErr(SLUG + '-error');
    var btn = TN.el(SLUG + '-convert');
    if (btn) btn.disabled = !file;
    setStatus(file ? 'Selected: ' + file.name + ' (' + TN.fmtBytes(file.size) + ')' : '');
  });

  TN.on(SLUG + '-convert', 'click', function () {
    if (busy || !file) return;
    TN.clearErr(SLUG + '-error');
    if (typeof GIF === 'undefined') {
      TN.setErr(SLUG + '-error', 'The GIF encoder library failed to load. Check your internet connection and reload the page.');
      return;
    }

    var lenEl = TN.el(SLUG + '-len'), fpsEl = TN.el(SLUG + '-fps'), wEl = TN.el(SLUG + '-width');
    var clipLen = Math.min(10, Math.max(0.5, parseFloat(lenEl && lenEl.value) || 3));
    var fps = Math.min(15, Math.max(1, parseInt(fpsEl && fpsEl.value, 10) || 10));
    var width = Math.min(480, Math.max(120, parseInt(wEl && wEl.value, 10) || 320));
    if (lenEl) lenEl.value = clipLen;
    if (fpsEl) fpsEl.value = fps;

    busy = true;
    var btn = TN.el(SLUG + '-convert');
    if (btn) btn.disabled = true;
    setProg(0.02);
    setStatus('Loading video\u2026');

    var url = URL.createObjectURL(file);
    var video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;

    function cleanup() { URL.revokeObjectURL(url); }
    function finishUI() {
      busy = false;
      var b2 = TN.el(SLUG + '-convert');
      if (b2) b2.disabled = !file;
      setProg(0);
      cleanup();
    }
    function fail(msg) {
      TN.setErr(SLUG + '-error', msg);
      setStatus('');
      finishUI();
    }

    once(video, 'loadedmetadata').then(function () {
      var dur = video.duration || clipLen;
      if (!isFinite(dur) || dur <= 0) throw new Error('Could not read this video\u2019s duration.');
      var take = Math.min(clipLen, dur);
      var frames = Math.max(1, Math.round(take * fps));
      var vw = video.videoWidth || width;
      var vh = video.videoHeight || width;
      var height = Math.max(2, Math.round(width * vh / vw));
      setStatus('Preparing encoder\u2026');
      return getWorkerScript().then(function (ws) {
        return { take: take, frames: frames, height: height, ws: ws };
      });
    }).then(function (cfg) {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = cfg.height;
      var ctx = canvas.getContext('2d');
      var gif = new GIF({ workers: 2, quality: 10, width: width, height: cfg.height, workerScript: cfg.ws });
      var delay = Math.round(1000 / fps);
      var i = 0;
      setStatus('Capturing frames\u2026');

      function grab() {
        if (i >= cfg.frames) { encode(); return; }
        var t = Math.min(i / fps, cfg.take);
        seekTo(video, t).then(function () {
          ctx.drawImage(video, 0, 0, width, cfg.height);
          gif.addFrame(ctx, { copy: true, delay: delay });
          i++;
          setProg(0.02 + 0.48 * (i / cfg.frames));
          setStatus('Capturing frames\u2026 ' + i + '/' + cfg.frames);
          setTimeout(grab, 0);
        }).catch(function () {
          try { gif.abort(); } catch (e) {}
          fail('Could not read frames from this video. It may use a format your browser cannot seek through.');
        });
      }

      function encode() {
        setStatus('Encoding GIF\u2026');
        gif.on('progress', function (p) {
          setProg(0.5 + 0.5 * p);
          setStatus('Encoding GIF\u2026 ' + Math.round(p * 100) + '%');
        });
        gif.on('finished', function (blob) {
          setProg(1);
          setStatus('Done — GIF is ' + TN.fmtBytes(blob.size) + '.');
          var name = (file.name.replace(/\.[^.]+$/, '') || 'clip') + '.gif';
          TN.download(blob, name);
          finishUI();
        });
        gif.render();
      }

      grab();
    }).catch(function (err) {
      var msg = (err && err.message) || String(err);
      if (/worker/i.test(msg)) {
        fail('Could not load the GIF encoder worker script (a network connection is required). Check your connection and try again.');
      } else if (msg === 'video load failed') {
        fail('Could not load this video file. It may be corrupt or in an unsupported format.');
      } else {
        fail('Conversion failed: ' + msg);
      }
    });
  });
})();
