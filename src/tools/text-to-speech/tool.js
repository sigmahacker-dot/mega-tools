/* Text to Speech — browser speech synthesis */
(function () {
  'use strict';
  var supported = ('speechSynthesis' in window);
  var ui = TN.el('text-to-speech-ui');
  var unsupported = TN.el('text-to-speech-unsupported');
  if (!supported) {
    if (ui) TN.hide(ui);
    if (unsupported) TN.show(unsupported);
    return;
  }
  if (unsupported) TN.hide(unsupported);

  var textEl = TN.el('text-to-speech-text');
  var voiceEl = TN.el('text-to-speech-voice');
  var rateEl = TN.el('text-to-speech-rate');
  var pitchEl = TN.el('text-to-speech-pitch');
  var rateVal = TN.el('text-to-speech-rateval');
  var pitchVal = TN.el('text-to-speech-pitchval');
  var countEl = TN.el('text-to-speech-count');
  var statusEl = TN.el('text-to-speech-status');
  if (!textEl || !voiceEl) return;

  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

  function loadVoices() {
    try {
      var voices = window.speechSynthesis.getVoices() || [];
      voiceEl.innerHTML = '';
      if (!voices.length) {
        var o = document.createElement('option');
        o.textContent = 'No voices available';
        voiceEl.appendChild(o);
        return;
      }
      voices.forEach(function (v, i) {
        var opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = v.name + ' (' + v.lang + ')' + (v.default ? ' — default' : '');
        voiceEl.appendChild(opt);
      });
    } catch (e) { /* keep silent, voices optional */ }
  }

  loadVoices();
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  /* some browsers need a nudge */
  setTimeout(loadVoices, 800);

  TN.on('text-to-speech-text', 'input', TN.debounce(function () {
    var n = (textEl.value || '').length;
    if (countEl) countEl.textContent = '(' + n.toLocaleString('en-US') + ' characters)';
  }, 120));

  TN.on('text-to-speech-rate', 'input', function () {
    if (rateVal) rateVal.textContent = rateEl.value;
  });
  TN.on('text-to-speech-pitch', 'input', function () {
    if (pitchVal) pitchVal.textContent = pitchEl.value;
  });

  TN.on('text-to-speech-speak', 'click', function () {
    try {
      TN.clearErr('text-to-speech-error');
      var text = (textEl.value || '').trim();
      if (!text) { TN.setErr('text-to-speech-error', 'Type some text first.'); return; }
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      var voices = window.speechSynthesis.getVoices() || [];
      var idx = parseInt(voiceEl.value, 10);
      if (voices[idx]) u.voice = voices[idx];
      u.rate = parseFloat(rateEl.value) || 1;
      u.pitch = parseFloat(pitchEl.value) || 1;
      u.onend = function () { setStatus('Ready.'); };
      u.onerror = function (ev) {
        if (ev && ev.error === 'canceled') { setStatus('Ready.'); return; }
        setStatus('Ready.');
        TN.setErr('text-to-speech-error', 'Speech failed in this browser. Try a different voice.');
      };
      setStatus('Speaking...');
      window.speechSynthesis.speak(u);
    } catch (e) {
      TN.setErr('text-to-speech-error', 'Speech failed in this browser.');
    }
  });

  TN.on('text-to-speech-pause', 'click', function () {
    try { if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); setStatus('Paused.'); } } catch (e) {}
  });
  TN.on('text-to-speech-resume', 'click', function () {
    try { if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setStatus('Speaking...'); } } catch (e) {}
  });
  TN.on('text-to-speech-stop', 'click', function () {
    try { window.speechSynthesis.cancel(); setStatus('Ready.'); } catch (e) {}
  });
})();
