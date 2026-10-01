/* Voice Recorder — getUserMedia + MediaRecorder, timer, playback, .webm download. */
(function () {
  'use strict';

  var SLUG = 'audio-voice-recorder';
  var recorder = null;
  var stream = null;
  var chunks = [];
  var timerId = null;
  var startTs = 0;
  var audioURL = '';
  var audioBlob = null;

  function errId() { return SLUG + '-error'; }
  function setStatus(s) { var e = TN.el(SLUG + '-status'); if (e) e.textContent = s; }
  function setTimer(t) { var e = TN.el(SLUG + '-timer'); if (e) e.textContent = t; }

  function fmtElapsed(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + ('0' + s).slice(-2);
  }

  function tick() {
    setTimer(fmtElapsed(Date.now() - startTs));
  }

  function setButtons(recording) {
    var st = TN.el(SLUG + '-start');
    var sp = TN.el(SLUG + '-stop');
    if (st) st.disabled = recording;
    if (sp) sp.disabled = !recording;
  }

  function stopTracks() {
    if (stream) {
      try {
        stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      } catch (e) {}
      stream = null;
    }
  }

  function friendlyMicError(e) {
    var name = e && e.name ? e.name : '';
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return 'Microphone access was denied. Allow microphone permission in your browser, then try again.';
    }
    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      return 'No microphone was found. Connect a microphone and try again.';
    }
    if (name === 'NotReadableError') {
      return 'Your microphone is busy (another app may be using it). Close other apps and try again.';
    }
    return 'Could not access the microphone. Use a modern browser over HTTPS (or localhost) with a working mic.';
  }

  function start() {
    TN.clearErr(errId());
    if (recorder && recorder.state === 'recording') return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      TN.setErr(errId(), 'Audio recording is not supported in this browser. Try a recent Chrome, Edge, Firefox or Safari.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      TN.setErr(errId(), 'MediaRecorder is not available in this browser. Try a recent Chrome, Edge, Firefox or Safari.');
      return;
    }
    setButtons(true);
    setStatus('Requesting mic…');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      stream = s;
      chunks = [];
      var mime = '';
      try {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mime = 'audio/webm;codecs=opus';
        else if (MediaRecorder.isTypeSupported('audio/webm')) mime = 'audio/webm';
      } catch (e) {}
      try {
        recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      } catch (e) {
        stopTracks();
        setButtons(false);
        setStatus('Ready');
        TN.setErr(errId(), 'Could not start the recorder in this browser.');
        return;
      }
      recorder.ondataavailable = function (ev) {
        if (ev.data && ev.data.size) chunks.push(ev.data);
      };
      recorder.onstop = onStopped;
      recorder.onerror = function () {
        TN.setErr(errId(), 'Recording error — please try again.');
        cleanup();
      };
      try {
        recorder.start(250);
      } catch (e) {
        stopTracks();
        setButtons(false);
        setStatus('Ready');
        TN.setErr(errId(), 'Could not start recording.');
        return;
      }
      startTs = Date.now();
      setTimer('0:00');
      timerId = setInterval(tick, 250);
      setStatus('Recording…');
    }).catch(function (e) {
      setButtons(false);
      setStatus('Ready');
      TN.setErr(errId(), friendlyMicError(e));
    });
  }

  function onStopped() {
    try { if (timerId) clearInterval(timerId); } catch (e) {}
    timerId = null;
    stopTracks();
    var type = (recorder && recorder.mimeType) || 'audio/webm';
    audioBlob = new Blob(chunks, { type: type });
    chunks = [];
    if (audioURL) { try { URL.revokeObjectURL(audioURL); } catch (e) {} }
    audioURL = URL.createObjectURL(audioBlob);
    var audio = TN.el(SLUG + '-audio');
    if (audio) audio.src = audioURL;
    var info = TN.el(SLUG + '-info');
    if (info) info.textContent = 'Recorded ' + fmtElapsed(Date.now() - startTs) + ' · ' + TN.fmtBytes(audioBlob.size) + ' · ' + type;
    var res = TN.el(SLUG + '-result');
    if (res) TN.show(res);
    setStatus('Ready');
    setTimer('0:00');
    setButtons(false);
    recorder = null;
  }

  function stop() {
    if (recorder && recorder.state === 'recording') {
      try { recorder.stop(); } catch (e) { cleanup(); }
    }
  }

  function cleanup() {
    try { if (timerId) clearInterval(timerId); } catch (e) {}
    timerId = null;
    stopTracks();
    recorder = null;
    setButtons(false);
    setStatus('Ready');
  }

  function download() {
    if (!audioBlob) { TN.setErr(errId(), 'Record something first.'); return; }
    TN.clearErr(errId());
    TN.download(audioBlob, 'voice-recording.webm');
  }

  function discard() {
    TN.clearErr(errId());
    if (audioURL) { try { URL.revokeObjectURL(audioURL); } catch (e) {} audioURL = ''; }
    audioBlob = null;
    var audio = TN.el(SLUG + '-audio');
    if (audio) audio.removeAttribute('src');
    var res = TN.el(SLUG + '-result');
    if (res) TN.hide(res);
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var st = TN.el(SLUG + '-start');
      if (st) TN.on(st, 'click', start);
      var sp = TN.el(SLUG + '-stop');
      if (sp) TN.on(sp, 'click', stop);
      var dl = TN.el(SLUG + '-download');
      if (dl) TN.on(dl, 'click', download);
      var dc = TN.el(SLUG + '-discard');
      if (dc) TN.on(dc, 'click', discard);
      setTimer('0:00');
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();