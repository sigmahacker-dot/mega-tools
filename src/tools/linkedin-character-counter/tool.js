(function () {
  'use strict';
  var P = 'linkedin-character-counter-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var limit = parseInt(TN.el(P + 'field').value, 10);
      var t = TN.el(P + 'input').value || '';
      var used = t.length, left = limit - used;
      TN.el(P + 'used').textContent = used.toLocaleString('en-US') + ' / ' + limit.toLocaleString('en-US');
      var le = TN.el(P + 'left');
      le.textContent = left.toLocaleString('en-US');
      le.style.color = left < 0 ? '#dc2626' : '';
      TN.el(P + 'words').textContent = (t.match(/\S+/g) || []).length.toLocaleString('en-US');
      var bar = TN.el(P + 'bar');
      bar.style.width = Math.min(100, used / limit * 100) + '%';
      bar.style.background = left < 0 ? '#dc2626' : (used / limit > 0.9 ? '#d97706' : '#0a66c2');
      if (left < 0) TN.setErr(ERR, 'Over the limit by ' + (-left).toLocaleString('en-US') + ' characters.');
    } catch (e) { TN.setErr(ERR, 'Could not count characters. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 80));
    TN.on(P + 'field', 'change', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
