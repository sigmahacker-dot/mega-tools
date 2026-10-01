/* Morse Code Translator — full A-Z 0-9 + punctuation map, decode, and WebAudio playback. */
(function () {
  'use strict';
  var SLUG = 'morse-code-translator';
  var MORSE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
    G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
    M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
    S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
  };
  var REVERSE = {};
  for (var k in MORSE) { if (MORSE.hasOwnProperty(k)) REVERSE[MORSE[k]] = k; }

  function encode(text) {
    var words = text.toUpperCase().split(/\s+/);
    return words.map(function (w) {
      return w.split('').map(function (ch) { return MORSE[ch] || '?'; }).join(' ');
    }).join(' / ');
  }

  function decode(code) {
    var words = code.trim().split(/\s*\/\s*/);
    return words.map(function (w) {
      return w.trim().split(/\s+/).map(function (token) {
        return REVERSE[token] || (token === '?' ? '?' : '�');
      }).join('');
    }).join(' ');
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var mode = TN.el(SLUG + '-mode').value;
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    var out = (mode === 'encode') ? encode(input) : decode(input);
    TN.el(SLUG + '-output').textContent = out;
  }

  function play() {
    TN.clearErr(SLUG + '-error');
    var mode = TN.el(SLUG + '-mode').value;
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    var morse = (mode === 'encode') ? encode(input) : input;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { TN.setErr(SLUG + '-error', 'Web Audio is not supported in this browser.'); return; }
    var ctx = new Ctx();
    var t = ctx.currentTime + 0.1;
    var DIT = 0.08, DAH = 0.24, GAP = 0.06, LGAP = 0.18;
    function beep(dur, when) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 600;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.5, when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(when); o.stop(when + dur + 0.02);
    }
    for (var i = 0; i < morse.length; i++) {
      var ch = morse[i];
      if (ch === '.') { beep(DIT, t); t += DIT + GAP; }
      else if (ch === '-') { beep(DAH, t); t += DAH + GAP; }
      else if (ch === ' ') { t += LGAP; }
      else if (ch === '/') { t += LGAP * 2; }
    }
    setTimeout(function () { ctx.close(); }, (t - ctx.currentTime) * 1000 + 500);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-play', 'click', play);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
