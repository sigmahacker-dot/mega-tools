/* Case Converter — six case transforms, live output, copy + download */
(function () {
  'use strict';
  var input = TN.el('case-converter-input');
  var output = TN.el('case-converter-output');
  if (!input || !output) return;

  var PLACEHOLDER = 'Your converted text will appear here...';
  var currentCase = 'upper';

  function toTitle(s) {
    return s.toLowerCase().replace(/(^|\s|[("'\-–—])(\S)/g, function (m, p, c) {
      return p + c.toUpperCase();
    });
  }
  function toSentence(s) {
    return s.toLowerCase().replace(/(^\s*\S|[.!?…]\s*\S)/g, function (m) {
      return m.toUpperCase();
    });
  }
  function toAlternating(s) {
    var out = '', up = true;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (/[a-zA-Z]/.test(c)) { out += up ? c.toUpperCase() : c.toLowerCase(); up = !up; }
      else out += c;
    }
    return out;
  }
  function toInverse(s) {
    return s.replace(/[a-zA-Z]/g, function (c) {
      return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
    });
  }

  function convert() {
    try {
      var t = input.value || '';
      var r;
      switch (currentCase) {
        case 'upper': r = t.toUpperCase(); break;
        case 'lower': r = t.toLowerCase(); break;
        case 'title': r = toTitle(t); break;
        case 'sentence': r = toSentence(t); break;
        case 'alt': r = toAlternating(t); break;
        case 'inv': r = toInverse(t); break;
        default: r = t;
      }
      output.textContent = t ? r : PLACEHOLDER;
    } catch (e) {
      TN.setErr('case-converter-error', 'Conversion failed. Please try again.');
    }
  }

  function pick(name, btn) {
    return function () {
      currentCase = name;
      var btns = TN.qsa('#case-converter-upper, #case-converter-lower, #case-converter-title, #case-converter-sentence, #case-converter-alt, #case-converter-inv');
      btns.forEach(function (b) { b.classList.remove('btn-outline'); b.classList.add('btn-primary'); });
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline');
      TN.clearErr('case-converter-error');
      convert();
    };
  }

  TN.on('case-converter-upper', 'click', pick('upper', TN.el('case-converter-upper')));
  TN.on('case-converter-lower', 'click', pick('lower', TN.el('case-converter-lower')));
  TN.on('case-converter-title', 'click', pick('title', TN.el('case-converter-title')));
  TN.on('case-converter-sentence', 'click', pick('sentence', TN.el('case-converter-sentence')));
  TN.on('case-converter-alt', 'click', pick('alt', TN.el('case-converter-alt')));
  TN.on('case-converter-inv', 'click', pick('inv', TN.el('case-converter-inv')));
  TN.on('case-converter-input', 'input', TN.debounce(convert, 120));

  function resultText() {
    return input.value ? output.textContent : '';
  }

  TN.on('case-converter-copy', 'click', function () {
    var t = resultText();
    if (!t) { TN.setErr('case-converter-error', 'Nothing to copy — type some text first.'); return; }
    TN.clearErr('case-converter-error');
    TN.copy(t).then(function (ok) {
      if (!ok) TN.setErr('case-converter-error', 'Copy failed in this browser. Select the result and press Ctrl/Cmd+C.');
    });
  });
  TN.on('case-converter-download', 'click', function () {
    var t = resultText();
    if (!t) { TN.setErr('case-converter-error', 'Nothing to download — type some text first.'); return; }
    TN.clearErr('case-converter-error');
    TN.downloadText(t, 'converted-text.txt', 'text/plain;charset=utf-8');
  });
  TN.on('case-converter-clear', 'click', function () {
    input.value = '';
    output.textContent = PLACEHOLDER;
    TN.clearErr('case-converter-error');
    input.focus();
  });

  /* mark the default button */
  var def = TN.el('case-converter-upper');
  if (def) { def.classList.remove('btn-primary'); def.classList.add('btn-outline'); }
  convert();
})();
