(function () {
  'use strict';
  var P = 'twitter-counter-', ERR = P + 'error';
  var URL_RE = /https?:\/\/[^\s<>"']+/gi;
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var urls = t.match(URL_RE) || [];
      var weighted = t.replace(URL_RE, '12345678901234567890123').length;
      var left = 280 - weighted;
      TN.el(P + 'weighted').textContent = weighted.toLocaleString('en-US');
      var le = TN.el(P + 'left');
      le.textContent = left.toLocaleString('en-US');
      le.style.color = left < 0 ? '#dc2626' : '';
      TN.el(P + 'urls').textContent = urls.length;
      var bar = TN.el(P + 'bar');
      bar.style.width = Math.min(100, weighted / 280 * 100) + '%';
      bar.style.background = left < 0 ? '#dc2626' : (weighted > 260 ? '#d97706' : '#1d9bf0');
      if (left < 0) TN.setErr(ERR, 'Over the limit by ' + (-left) + ' characters — shorten the text or remove a URL.');
    } catch (e) { TN.setErr(ERR, 'Could not count the post. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 80));
    update();
  } catch (e) { /* never throw on load */ }
})();
