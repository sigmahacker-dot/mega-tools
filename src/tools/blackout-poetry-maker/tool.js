/* Blackout Poetry Maker — click words to black them out; survivors form the poem. */
(function () {
  'use strict';
  var SLUG = 'blackout-poetry-maker';
  var tokens = []; // {text, blacked, isSpace}

  function updatePoem() {
    var poem = tokens.filter(function (t) { return !t.isSpace && !t.blacked; })
      .map(function (t) { return t.text; }).join(' ');
    TN.el(SLUG + '-poem').textContent = poem || '— black out words above to reveal your poem —';
  }

  function load() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please paste some text first.'); return; }
    tokens = [];
    var parts = input.split(/(\s+)/);
    parts.forEach(function (p) {
      if (!p) return;
      tokens.push({ text: p, blacked: false, isSpace: /^\s+$/.test(p) });
    });
    var box = TN.el(SLUG + '-words');
    box.innerHTML = '';
    tokens.forEach(function (t) {
      if (t.isSpace) {
        box.appendChild(document.createTextNode(t.text));
        return;
      }
      var s = document.createElement('span');
      s.textContent = t.text;
      s.style.cssText = 'cursor:pointer;padding:1px 3px;border-radius:3px;transition:background .15s,color .15s';
      s.title = 'Click to black out / restore';
      s.addEventListener('click', function () {
        t.blacked = !t.blacked;
        s.style.background = t.blacked ? '#111' : '';
        s.style.color = t.blacked ? '#111' : '';
        updatePoem();
      });
      box.appendChild(s);
    });
    updatePoem();
  }

  function reset() {
    tokens.forEach(function (t) { t.blacked = false; });
    var box = TN.el(SLUG + '-words');
    var spans = box.querySelectorAll('span');
    for (var i = 0; i < spans.length; i++) {
      spans[i].style.background = '';
      spans[i].style.color = '';
    }
    updatePoem();
  }

  try {
    TN.on(SLUG + '-load', 'click', load);
    TN.on(SLUG + '-reset', 'click', reset);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-poem').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
