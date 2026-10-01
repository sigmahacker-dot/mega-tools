/* Braille Translator — Grade 1 Unicode braille with capital + number signs. */
(function () {
  'use strict';
  var SLUG = 'braille-translator';
  // a-z in Grade 1 braille order
  var LETTERS = ['⠁', '⠃', '⠉', '⠙', '⠑', '⠋', '⠛', '⠓', '⠊', '⠚',
                 '⠅', '⠇', '⠍', '⠝', '⠕', '⠏', '⠟', '⠗', '⠎', '⠞',
                 '⠥', '⠧', '⠺', '⠭', '⠽', '⠵'];
  var CAPITAL = '⠠', NUMBER = '⠼';
  var PUNCT = { ',': '⠂', ';': '⠆', ':': '⠒', '.': '⠲', '!': '⠖', '?': '⠦', '-': '⠤', "'": '⠄', '/': '⠌' };
  var TOBRAILLE = {}, FROMBRAILLE = {};
  for (var i = 0; i < 26; i++) {
    TOBRAILLE[String.fromCharCode(97 + i)] = LETTERS[i];
    FROMBRAILLE[LETTERS[i]] = String.fromCharCode(97 + i);
  }
  var DIGITS = '⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚'; // 1-9,0 = a-j after number sign
  for (var d = 0; d < 10; d++) FROMBRAILLE[DIGITS[d]] = 'NUM' + ((d + 1) % 10);

  function encode(text) {
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === ' ') { out += ' '; continue; }
      if (ch === '\n') { out += '\n'; continue; }
      if (/[0-9]/.test(ch)) {
        out += NUMBER + DIGITS[(parseInt(ch, 10) + 9) % 10];
        continue;
      }
      if (/[A-Z]/.test(ch)) out += CAPITAL;
      var low = ch.toLowerCase();
      if (TOBRAILLE[low]) out += TOBRAILLE[low];
      else if (PUNCT[ch]) out += PUNCT[ch];
      else out += ch; // pass through anything unmapped
    }
    return out;
  }

  function decode(braille) {
    var out = '', numberMode = false, capNext = false;
    for (var i = 0; i < braille.length; i++) {
      var ch = braille[i];
      if (ch === ' ' || ch === '\n') { out += ch; numberMode = false; capNext = false; continue; }
      if (ch === NUMBER) { numberMode = true; continue; }
      if (ch === CAPITAL) { capNext = true; continue; }
      var v = FROMBRAILLE[ch];
      if (v === undefined) { out += ch; numberMode = false; capNext = false; continue; }
      var letter;
      if (v.indexOf('NUM') === 0) {
        letter = numberMode ? v.slice(3) : String.fromCharCode(97 + DIGITS.indexOf(ch));
      } else letter = v;
      if (capNext) { letter = letter.toUpperCase(); capNext = false; }
      out += letter;
      numberMode = false;
    }
    return out;
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some input first.'); return; }
    var mode = TN.el(SLUG + '-mode').value;
    TN.el(SLUG + '-output').textContent = mode === 'encode' ? encode(input) : decode(input);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
