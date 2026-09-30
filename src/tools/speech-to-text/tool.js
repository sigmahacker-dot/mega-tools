/* Speech to Text — browser speech recognition */
(function () {
  'use strict';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var ui = TN.el('speech-to-text-ui');
  var unsupported = TN.el('speech-to-text-unsupported');
  if (!SR) {
    if (ui) TN.hide(ui);
    if (unsupported) TN.show(unsupported);
    return;
  }
  if (unsupported) TN.hide(unsupported);

  var langEl = TN.el('speech-to-text-lang');
  var startBtn = TN.el('speech-to-text-start');
  var stopBtn = TN.el('speech-to-text-stop');
  var interimEl = TN.el('speech-to-text-interim');
  var finalEl = TN.el('speech-to-text-final');
  if (!langEl || !startBtn || !stopBtn || !finalEl) return;

  var rec = null;
  var listening = false;

  function setButtons() {
    startBtn.disabled = listening;
    stopBtn.disabled = !listening;
  }

  function start() {
    try {
      TN.clearErr('speech-to-text-error');
      rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = langEl.value || 'en-US';

      rec.onresult = function (ev) {
        try {
          var interim = '', finalChunk = '';
          for (var i = ev.resultIndex; i < ev.results.length; i++) {
            var res = ev.results[i];
            if (res.isFinal) finalChunk += res[0].transcript;
            else interim += res[0].transcript;
          }
          if (interimEl) interimEl.textContent = interim || (listening ? 'Listening...' : 'Speak after pressing Start...');
          if (finalChunk) {
            var cur = finalEl.value;
            finalEl.value = cur + (cur && !/\s$/.test(cur) ? ' ' : '') + finalChunk.trim() + ' ';
          }
        } catch (e) {}
      };

      rec.onerror = function (ev) {
        var code = (ev && ev.error) || '';
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          TN.setErr('speech-to-text-error', 'Microphone access was denied. Allow microphone permission and try again.');
        } else if (code === 'no-speech') {
          /* harmless — user just didn't speak */
        } else if (code === 'audio-capture') {
          TN.setErr('speech-to-text-error', 'No microphone found on this device.');
        } else {
          TN.setErr('speech-to-text-error', 'Recognition error: ' + code + '. Try again.');
        }
        stop();
      };

      rec.onend = function () {
        if (listening) { stop(); }
      };

      rec.start();
      listening = true;
      setButtons();
      if (interimEl) interimEl.textContent = 'Listening...';
    } catch (e) {
      TN.setErr('speech-to-text-error', 'Could not start recognition in this browser.');
    }
  }

  function stop() {
    listening = false;
    setButtons();
    try { if (rec) rec.stop(); } catch (e) {}
    rec = null;
    if (interimEl) interimEl.textContent = 'Stopped. Press Start to dictate again.';
  }

  TN.on('speech-to-text-start', 'click', start);
  TN.on('speech-to-text-stop', 'click', stop);
  TN.on('speech-to-text-copy', 'click', function () {
    if (!finalEl.value.trim()) { TN.setErr('speech-to-text-error', 'Nothing to copy — dictate something first.'); return; }
    TN.clearErr('speech-to-text-error');
    TN.copy(finalEl.value.trim()).then(function (ok) {
      if (!ok) TN.setErr('speech-to-text-error', 'Copy failed in this browser. Select the text and press Ctrl/Cmd+C.');
    });
  });
  TN.on('speech-to-text-clear', 'click', function () {
    finalEl.value = '';
    if (interimEl) interimEl.textContent = listening ? 'Listening...' : 'Speak after pressing Start...';
    TN.clearErr('speech-to-text-error');
  });
})();
