/* Character Counter — live counts + Twitter gauge + SMS segments */
(function () {
  'use strict';
  var input = TN.el('character-counter-input');
  if (!input) return;

  var GSM7_BASE = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
  var GSM7_EXT = "^{}\\[~]|€";
  function isGsm7(s) {
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (GSM7_BASE.indexOf(ch) !== -1) continue;
      if (GSM7_EXT.indexOf(ch) !== -1) continue;
      if (ch === ' ' || ch === '\t') continue;
      return false;
    }
    return true;
  }

  function update() {
    try {
      var t = input.value || '';
      var chars = t.length;
      var charsNoSpace = t.replace(/\s/g, '').length;
      var words = (t.match(/\S+/g) || []).length;
      var lines = t ? t.split('\n').length : 0;

      TN.el('character-counter-chars').textContent = chars.toLocaleString('en-US');
      TN.el('character-counter-charsns').textContent = charsNoSpace.toLocaleString('en-US');
      TN.el('character-counter-words').textContent = words.toLocaleString('en-US');
      TN.el('character-counter-lines').textContent = lines.toLocaleString('en-US');

      /* X/Twitter 280 */
      var limit = 280;
      var left = limit - chars;
      var tw = TN.el('character-counter-twitter');
      tw.textContent = left >= 0 ? left + ' left' : (-left) + ' over limit';
      tw.style.color = left < 0 ? '#dc2626' : '';
      var bar = TN.el('character-counter-twitterbar');
      if (bar) {
        bar.style.width = Math.min(100, (chars / limit) * 100) + '%';
        bar.style.background = left < 0 ? '#dc2626' : '';
      }

      /* SMS segments */
      var gsm = isGsm7(t);
      var single = gsm ? 160 : 70;
      var multi = gsm ? 153 : 67;
      var segs = 0, inSeg = 0;
      if (chars > 0) {
        if (chars <= single) { segs = 1; inSeg = chars; }
        else { segs = 1 + Math.ceil((chars - single) / multi); inSeg = chars - single - (segs - 2) * multi; }
      }
      TN.el('character-counter-sms').textContent = segs + (segs === 1 ? ' segment' : ' segments');
      TN.el('character-counter-smsdetail').textContent =
        chars + ' chars total · ' + inSeg + ' / ' + (chars > single ? multi : single) +
        ' in current segment' + (gsm ? ' (GSM-7)' : ' (Unicode — emoji/non-Latin detected)');
      TN.clearErr('character-counter-error');
    } catch (e) {
      TN.setErr('character-counter-error', 'Could not count the text. Please try again.');
    }
  }

  var debounced = TN.debounce(update, 150);
  TN.on('character-counter-input', 'input', debounced);
  TN.on('character-counter-clear', 'click', function () {
    input.value = '';
    TN.clearErr('character-counter-error');
    update();
    input.focus();
  });
  update();
})();
