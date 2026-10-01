/* Rail Fence Cipher Tool — zigzag transposition with 2-10 rails. */
(function () {
  'use strict';
  var SLUG = 'rail-fence-cipher-tool';

  // rail index for each position in a zigzag of `rails` rails
  function pattern(len, rails) {
    var p = [], r = 0, dir = 1;
    for (var i = 0; i < len; i++) {
      p.push(r);
      if (rails === 1) continue;
      r += dir;
      if (r === rails - 1) dir = -1;
      if (r === 0) dir = 1;
    }
    return p;
  }

  function encode(text, rails) {
    var p = pattern(text.length, rails), out = '';
    for (var r = 0; r < rails; r++) {
      for (var i = 0; i < text.length; i++) {
        if (p[i] === r) out += text[i];
      }
    }
    return out;
  }

  function decode(text, rails) {
    var p = pattern(text.length, rails);
    var slots = new Array(text.length), pos = 0;
    for (var r = 0; r < rails; r++) {
      for (var i = 0; i < text.length; i++) {
        if (p[i] === r) slots[i] = text[pos++];
      }
    }
    return slots.join('');
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    var rails = parseInt(TN.el(SLUG + '-rails').value, 10);
    if (!input) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    if (isNaN(rails) || rails < 2 || rails > 10) { TN.setErr(SLUG + '-error', 'Rails must be between 2 and 10.'); return; }
    var mode = TN.el(SLUG + '-mode').value;
    TN.el(SLUG + '-output').textContent = mode === 'encode' ? encode(input, rails) : decode(input, rails);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
