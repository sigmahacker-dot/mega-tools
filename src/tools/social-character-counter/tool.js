(function () {
  'use strict';
  var P = 'social-character-counter-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var limit = parseInt(TN.el(P + 'platform').value, 10);
      var t = TN.el(P + 'input').value || '';
      var chars = t.length, words = (t.match(/\S+/g) || []).length, left = limit - chars;
      TN.el(P + 'chars').textContent = chars.toLocaleString('en-US');
      TN.el(P + 'words').textContent = words.toLocaleString('en-US');
      var leftEl = TN.el(P + 'left');
      leftEl.textContent = left.toLocaleString('en-US');
      leftEl.style.color = left < 0 ? '#dc2626' : '';
      var bar = TN.el(P + 'bar');
      var pct = Math.min(100, chars / limit * 100);
      bar.style.width = pct + '%';
      bar.style.background = left < 0 ? '#dc2626' : (pct > 90 ? '#d97706' : '#4D7C0F');
    } catch (e) { TN.setErr(ERR, 'Could not count characters. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 80));
    TN.on(P + 'platform', 'change', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
