/* Word Counter — live text statistics */
(function () {
  'use strict';
  var input = TN.el('word-counter-input');
  if (!input) return;

  function fmt(n) { return n.toLocaleString('en-US'); }

  function update() {
    try {
      var t = input.value || '';
      var words = (t.match(/\S+/g) || []).length;
      var chars = t.length;
      var charsNoSpace = t.replace(/\s/g, '').length;
      var sentences = (t.match(/[^.!?…]+[.!?…]+["'”’)\]]*/g) || []).length;
      var paras = t.split(/\n+/).filter(function (p) { return p.trim().length > 0; }).length;
      var mins = words / 200;
      var read;
      if (words === 0) read = '0 min';
      else if (mins < 1) read = Math.max(1, Math.round(mins * 60)) + ' sec';
      else read = Math.round(mins) + ' min';

      TN.el('word-counter-words').textContent = fmt(words);
      TN.el('word-counter-chars').textContent = fmt(chars);
      TN.el('word-counter-charsns').textContent = fmt(charsNoSpace);
      TN.el('word-counter-sentences').textContent = fmt(sentences);
      TN.el('word-counter-paras').textContent = fmt(paras);
      TN.el('word-counter-read').textContent = read;
    } catch (e) {
      TN.setErr('word-counter-error', 'Could not count the text. Please try again.');
    }
  }

  var debounced = TN.debounce(update, 150);
  TN.on('word-counter-input', 'input', debounced);
  TN.on('word-counter-clear', 'click', function () {
    input.value = '';
    TN.clearErr('word-counter-error');
    update();
    input.focus();
  });
  TN.on('word-counter-copy', 'click', function () {
    if (!input.value) {
      TN.setErr('word-counter-error', 'Nothing to copy yet — type some text first.');
      return;
    }
    TN.clearErr('word-counter-error');
    TN.copy(input.value).then(function (ok) {
      TN.setErr('word-counter-error', ok ? '' : 'Copy failed in this browser. Select the text and press Ctrl/Cmd+C.');
      if (ok) TN.clearErr('word-counter-error');
    });
  });
  update();
})();
