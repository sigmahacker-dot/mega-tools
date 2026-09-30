/* Video Merger — sequentially re-encode clips: canvas.captureStream + Web Audio -> one MediaRecorder */
(function () {
  'use strict';
  var SLUG = 'video-merger';
  var clips = [];
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

  function renderList() {
    var box = TN.el(SLUG + '-list');
    if (!box) return;
    if (!clips.length) {
      box.innerHTML = '<p class="muted">No clips added yet. Add at least two videos to merge.</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < clips.length; i++) {
      html += '<div class="copy-row" data-idx="' + i + '">' +
        '<span><strong>' + (i + 1) + '.</strong> ' + TN.esc(clips[i].name) +
        ' <span class="muted">(' + TN.fmtBytes(clips[i].size) + ')</span></span>' +
        '<span class="btn-row">' +
        '<button class="btn btn-sm btn-outline" type="button" data-act="up" title="Move up"' + (i === 0 ? ' disabled' : '') + '>\u2191</button>' +
        '<button class="btn btn-sm btn-outline" type="button" data-act="down" title="Move down"' + (i === clips.length - 1 ? ' disabled' : '') + '>\u2193</button>' +
        '<button class="btn btn-sm btn-danger" type="button" data-act="rm" title="Remove">\u2715</button>' +
        '</span></div>';
    }
    box.innerHTML = html;
  }

  TN.on(SLUG + '-list', 'click', function (e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var act = t.getAttribute('data-act');
    if (!act) return;
    var row = t.closest ? t.closest('[data-idx]') : null;
    if (!row) return;
    var i = parseInt(row.getAttribute('data-idx'), 10);
    if (isNaN(i) || i < 0 || i >= clips.length) return;
    if (act === 'up' && i > 0) { var a = clips[i - 1]; clips[i - 1] = clips[i]; clips[i] = a; }
    else if (act === 'down' && i < clips.length - 1) { var b = clips[i + 1]; clips[i + 1] = clips[i]; clips[i] = b; }
    else if (act === 'rm') { clips.splice(i, 1); }
    TN.clearErr(SLUG + '-error');
    renderList();
  });

  TN.on(SLUG + '-file', 'change', function () {
    var el = TN.el(SLUG + '-file');
    if (el && el.files && el.files.length) {
      for (var i = 0; i < el.files.length; i++) clips.push(el.files[i]);
      el.value = '';
      TN.clearErr(SLUG + '-error');
      renderList();
    }
  });

  TN.on(SLUG + '-clear', 'click', function () {
    clips = [];
    TN.clearErr(SLUG + '-error');
    setStatus('');
    renderList();
  });

  function pickMime() {
    var cands = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    for (var i = 0; i < cands.length; i++) {
      try {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported(cands[i])) return cands[i];
      } catch (e) {}
    }
    return '';
  }

  function probeSize(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file);
      var v = document.createElement('video');
      v.muted = true;
      v.preload = 'metadata';
      v.src = url;
      var timer = setTimeout(function () { URL.revokeObjectURL(url); rej(new Error('timeout')); }, 20000);
      v.addEventListener('loadedmetadata', function () {
        clearTimeout(timer);
        var w = v.videoWidth || 1280, h = v.videoHeight || 720;
        URL.revokeObjectURL(url);
        res({ w: w, h: h });
      });
      v.addEventListener('error', function () {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        rej(new Error('Could not read "' + file.name + '".'));
      });
    });
  }

  // Play one clip, drawing letterboxed frames to canvas and routing audio to dest.
  // Resolves when the clip ends.
  function playClip(file, canvas, ctx, actx, dest, W, H) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var v = document.createElement('video');
      v.playsInline = true;
      v.preload = 'auto';
      v.src = url;
      var srcNode = null;
      var done = false;

      function finish(ok, err) {
        if (done) return;
        done = true;
        try { if (srcNode) srcNode.disconnect(); } catch (e) {}
        URL.revokeObjectURL(url);
        if (ok) resolve(); else reject(err || new Error('Clip failed: ' + file.name));
      }

      function draw() {
        if (done) return;
        if (v.ended || (v.paused && v.duration && v.currentTime >= v.duration - 0.08)) {
          finish(true);
          return;
        }
        var vw = v.videoWidth || W, vh = v.videoHeight || H;
        var s = Math.min(W / vw, H / vh);
        var dw = Math.max(1, Math.round(vw * s)), dh = Math.max(1, Math.round(vh * s));
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        try { ctx.drawImage(v, Math.round((W - dw) / 2), Math.round((H - dh) / 2), dw, dh); } catch (e) {}
        requestAnimationFrame(draw);
      }

      v.addEventListener('loadedmetadata', function () {
        try {
          srcNode = actx.createMediaElementSource(v);
          srcNode.connect(dest); // audio goes to the recorder only, not the speakers
        } catch (e) { srcNode = null; }
        var pr;
        try { pr = v.play(); } catch (e) { finish(false, new Error('Playback was blocked by the browser. Please try again.')); return; }
        if (pr && pr.catch) {
          pr.catch(function () { finish(false, new Error('Playback was blocked by the browser. Please interact with the page and try again.')); });
        }
        draw();
      });
      v.addEventListener('ended', function () { finish(true); });
      v.addEventListener('error', function () { finish(false, new Error('Could not read "' + file.name + '". It may be corrupt or unsupported.')); });
      setTimeout(function () {
        if (!done && v.readyState < 1) finish(false, new Error('Timed out loading "' + file.name + '".'));
      }, 30000);
    });
  }

  TN.on(SLUG + '-merge', 'click', function () {
    if (busy) return;
    TN.clearErr(SLUG + '-error');
    if (clips.length < 2) {
      TN.setErr(SLUG + '-error', 'Add at least two video clips to merge.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      TN.setErr(SLUG + '-error', 'Your browser does not support MediaRecorder, which is required to merge videos. Try Chrome, Edge or Firefox.');
      return;
    }
    var ACtor = window.AudioContext || window.webkitAudioContext;
    if (!ACtor) {
      TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio, which is required to merge clip audio.');
      return;
    }
    busy = true;
    var btn = TN.el(SLUG + '-merge');
    if (btn) btn.disabled = true;
    setProg(0.02);
    setStatus('Preparing\u2026');

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    probeSize(clips[0]).then(function (size) {
      var W = size.w, H = size.h;
      canvas.width = W;
      canvas.height = H;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      var actx = new ACtor();
      var resumeP = Promise.resolve();
      try { resumeP = actx.resume() || Promise.resolve(); } catch (e) {}

      return resumeP.then(function () {
        var dest = actx.createMediaStreamDestination();
        var cstream;
        try {
          cstream = canvas.captureStream(30);
        } catch (e) {
          throw new Error('Your browser does not support canvas capture, which is required to merge videos.');
        }
        var tracks = cstream.getVideoTracks().concat(dest.stream.getAudioTracks());
        var combined = new MediaStream(tracks);
        var mime = pickMime();
        var opts = mime ? { mimeType: mime, videoBitsPerSecond: 6000000 } : undefined;
        var rec;
        try {
          rec = opts ? new MediaRecorder(combined, opts) : new MediaRecorder(combined);
        } catch (e) {
          throw new Error('Could not start the video recorder: ' + (e && e.message || e));
        }
        var chunks = [];
        rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) chunks.push(ev.data); };
        var stopped = new Promise(function (r) { rec.onstop = r; });
        rec.start(250);

        var chain = Promise.resolve();
        for (var ci = 0; ci < clips.length; ci++) {
          (function (idx) {
            chain = chain.then(function () {
              setStatus('Merging clip ' + (idx + 1) + ' of ' + clips.length + ': ' + clips[idx].name);
              setProg(0.03 + 0.9 * (idx / clips.length));
              return playClip(clips[idx], canvas, ctx, actx, dest, W, H);
            });
          })(ci);
        }
        return chain.then(function () {
          setStatus('Finalizing\u2026');
          setProg(0.95);
          rec.stop();
          return stopped.then(function () {
            var blob = new Blob(chunks, { type: rec.mimeType || mime || 'video/webm' });
            try { actx.close(); } catch (e2) {}
            var ext = (rec.mimeType || mime || '').indexOf('mp4') >= 0 ? 'mp4' : 'webm';
            setProg(1);
            setStatus('Done — merged video is ' + TN.fmtBytes(blob.size) + '.');
            TN.download(blob, 'merged-video.' + ext);
          });
        }).catch(function (err) {
          try { rec.stop(); } catch (e3) {}
          try { actx.close(); } catch (e4) {}
          throw err;
        });
      });
    }).catch(function (err) {
      TN.setErr(SLUG + '-error', (err && err.message) || String(err));
      setStatus('');
    }).then(function () {
      busy = false;
      var b2 = TN.el(SLUG + '-merge');
      if (b2) b2.disabled = false;
      setProg(0);
    });
  });

  renderList();
})();
