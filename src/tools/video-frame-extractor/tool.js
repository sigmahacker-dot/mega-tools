/* Video Frame Extractor — scrub, capture current frame to canvas on 'seeked'. */
(function () {
  'use strict';

  var SLUG = 'video-frame-extractor';
  var videoURL = '';
  var videoName = '';
  var scrubbing = false;

  function errId() { return SLUG + '-error'; }
  function video() { return TN.el(SLUG + '-video'); }
  function scrub() { return TN.el(SLUG + '-scrub'); }

  function fmtTime(s) {
    if (!isFinite(s)) return '0.0';
    return s.toFixed(1);
  }

  function syncScrub() {
    var v = video(), sc = scrub();
    if (!v || !sc || scrubbing) return;
    try {
      if (isFinite(v.duration) && v.duration > 0) {
        sc.max = String(v.duration);
        sc.value = String(v.currentTime);
      }
      var t = TN.el(SLUG + '-time');
      if (t) t.textContent = fmtTime(v.currentTime);
    } catch (e) {}
  }

  function onFile(ev) {
    TN.clearErr(errId());
    var f = ev.target && ev.target.files && ev.target.files[0];
    var res = TN.el(SLUG + '-result');
    if (!f) { if (res) TN.hide(res); return; }
    if (!/^video\//.test(f.type)) {
      TN.setErr(errId(), 'Please choose a video file.');
      return;
    }
    if (videoURL) { try { URL.revokeObjectURL(videoURL); } catch (e) {} }
    videoURL = URL.createObjectURL(f);
    videoName = f.name.replace(/\.[^.]+$/, '') || 'video';
    var v = video();
    if (!v) return;
    v.src = videoURL;
    try { v.load(); } catch (e) {}
    var wrap = TN.el(SLUG + '-preview-wrap');
    if (wrap) wrap.style.display = 'none';
    if (res) TN.show(res);
  }

  function capture() {
    TN.clearErr(errId());
    var v = video();
    if (!v || !v.src) { TN.setErr(errId(), 'Choose a video first.'); return; }
    if (v.readyState < 2 || !v.videoWidth) {
      TN.setErr(errId(), 'Video is still loading — wait a moment and try again.');
      return;
    }
    if (v.seeking) {
      // Wait for the seek to land, then capture the exact frame.
      var onSeeked = function () {
        try { v.removeEventListener('seeked', onSeeked); } catch (e) {}
        drawFrame();
      };
      v.addEventListener('seeked', onSeeked);
    } else {
      drawFrame();
    }
  }

  function drawFrame() {
    var v = video();
    var canvas = TN.el(SLUG + '-canvas');
    if (!v || !canvas) return;
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    var wrap = TN.el(SLUG + '-preview-wrap');
    if (wrap) wrap.style.display = '';
  }

  function download() {
    var canvas = TN.el(SLUG + '-canvas');
    if (!canvas || !canvas.width) { TN.setErr(errId(), 'Capture a frame first.'); return; }
    TN.clearErr(errId());
    canvas.toBlob(function (blob) {
      if (!blob) { TN.setErr(errId(), 'Could not create the PNG.'); return; }
      TN.download(blob, videoName + '-frame.png');
    }, 'image/png');
  }

  function clear() {
    TN.clearErr(errId());
    var v = video();
    if (v) { try { v.pause(); } catch (e) {} v.removeAttribute('src'); try { v.load(); } catch (e) {} }
    if (videoURL) { try { URL.revokeObjectURL(videoURL); } catch (e) {} videoURL = ''; }
    videoName = '';
    var f = TN.el(SLUG + '-file');
    if (f) f.value = '';
    var wrap = TN.el(SLUG + '-preview-wrap');
    if (wrap) wrap.style.display = 'none';
    var res = TN.el(SLUG + '-result');
    if (res) TN.hide(res);
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var f = TN.el(SLUG + '-file');
      if (f) TN.on(f, 'change', onFile);
      var v = video();
      if (v) {
        TN.on(v, 'timeupdate', syncScrub);
        TN.on(v, 'loadedmetadata', syncScrub);
        TN.on(v, 'seeked', syncScrub);
      }
      var sc = scrub();
      if (sc) {
        TN.on(sc, 'input', function () {
          var vv = video();
          if (!vv || !isFinite(vv.duration)) return;
          scrubbing = true;
          try { vv.currentTime = parseFloat(sc.value) || 0; } catch (e) {}
          var t = TN.el(SLUG + '-time');
          if (t) t.textContent = fmtTime(parseFloat(sc.value) || 0);
        });
        TN.on(sc, 'change', function () { scrubbing = false; syncScrub(); });
      }
      var cap = TN.el(SLUG + '-capture');
      if (cap) TN.on(cap, 'click', capture);
      var dl = TN.el(SLUG + '-download');
      if (dl) TN.on(dl, 'click', download);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();