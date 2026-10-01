(function () {
  'use strict';
  var P = 'caption-counter-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var chars = t.length;
      var tags = (t.match(/#[\p{L}\p{N}_]+/gu) || []).length;
      var mentions = (t.match(/@[\p{L}\p{N}._]+/gu) || []).length;
      var words = (t.match(/\S+/g) || []).length;
      var ce = TN.el(P + 'chars');
      ce.textContent = chars.toLocaleString('en-US') + ' / 2200';
      ce.style.color = chars > 2200 ? '#dc2626' : '';
      var te = TN.el(P + 'tags');
      te.textContent = tags + ' / 30';
      te.style.color = tags > 30 ? '#dc2626' : '';
      TN.el(P + 'mentions').textContent = mentions;
      TN.el(P + 'words').textContent = words.toLocaleString('en-US');
      TN.el(P + 'preview').innerHTML = t.trim()
        ? TN.esc(t.slice(0, 125)) + (t.length > 125 ? '<span class="muted">… more</span>' : '')
        : 'Your caption preview appears here…';
      if (chars > 2200) TN.setErr(ERR, 'Caption is ' + (chars - 2200) + ' characters over Instagram\'s 2,200 limit.');
      else if (tags > 30) TN.setErr(ERR, 'Instagram allows max 30 hashtags — you have ' + tags + '.');
    } catch (e) { TN.setErr(ERR, 'Could not analyze the caption. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 100));
    update();
  } catch (e) { /* never throw on load */ }
})();
