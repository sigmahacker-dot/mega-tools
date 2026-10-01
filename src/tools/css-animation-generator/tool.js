/* CSS Animation Generator — pick an effect, preview live, copy @keyframes + class CSS. */
(function () {
  'use strict';
  var SLUG = 'css-animation-generator';
  var ERR = SLUG + '-error';

  var KF = {
    'fade-in': 'from { opacity: 0; }\n  to { opacity: 1; }',
    'slide-in': 'from { opacity: 0; transform: translateY(40px); }\n  to { opacity: 1; transform: translateY(0); }',
    'slide-left': 'from { opacity: 0; transform: translateX(60px); }\n  to { opacity: 1; transform: translateX(0); }',
    'bounce': '0% { opacity: 0; transform: translateY(-60px); }\n  60% { opacity: 1; transform: translateY(12px); }\n  80% { transform: translateY(-6px); }\n  100% { opacity: 1; transform: translateY(0); }',
    'spin': 'from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }',
    'pulse': '0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.15); }',
    'shake': '0%, 100% { transform: translateX(0); }\n  20%, 60% { transform: translateX(-10px); }\n  40%, 80% { transform: translateX(10px); }',
    'flip': 'from { opacity: 0; transform: perspective(600px) rotateY(-90deg); }\n  to { opacity: 1; transform: perspective(600px) rotateY(0); }'
  };

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function opt(key) { return $(key).value; }
  function num(key) { return parseFloat($(key).value); }

  function kfName() { return 'anim-' + opt('type'); }

  function play() {
    TN.clearErr(ERR);
    var box = $('box');
    var dur = num('duration').toFixed(1);
    var delay = num('delay').toFixed(1);
    var anim = kfName() + ' ' + dur + 's ' + opt('timing') + ' ' + delay + 's ' + opt('iter') + ' both';
    try {
      var css = buildCss();
      var old = document.getElementById(SLUG + '-kv');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var st = document.createElement('style');
      st.id = SLUG + '-kv';
      st.textContent = '@keyframes ' + kfName() + ' {\n  ' + KF[opt('type')] + '\n}';
      document.head.appendChild(st);
      box.style.animation = 'none';
      void box.offsetWidth; /* reflow to restart animation */
      box.style.animation = anim;
      $('code').textContent = css;
    } catch (e) {
      TN.setErr(ERR, 'Could not render the preview.');
    }
  }

  function buildCss() {
    var dur = num('duration').toFixed(1);
    var delay = num('delay').toFixed(1);
    var cls = (opt('class') || 'my-animation').replace(/[^a-zA-Z0-9-_]/g, '-') || 'my-animation';
    return '@keyframes ' + kfName() + ' {\n  ' + KF[opt('type')] + '\n}\n\n.' + cls + ' {\n'
      + '  animation: ' + kfName() + ' ' + dur + 's ' + opt('timing') + ' ' + delay + 's ' + opt('iter') + ' both;\n}';
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['type', 'timing', 'duration', 'delay', 'iter', 'class'].forEach(function (k) {
        TN.on(SLUG + '-' + k, k === 'type' || k === 'timing' || k === 'iter' ? 'change' : 'input', function () {
          if (k === 'duration') $('duration-v').textContent = num('duration').toFixed(1) + 's';
          if (k === 'delay') $('delay-v').textContent = num('delay').toFixed(1) + 's';
          play();
        });
      });
      TN.on(SLUG + '-replay', 'click', play);
      TN.on(SLUG + '-copy', 'click', function () {
        var txt = $('code').textContent;
        if (!txt) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
        TN.copy(txt).then(function (ok) {
          if (ok) { TN.clearErr(ERR); }
          else TN.setErr(ERR, 'Copy failed — select the code and copy manually.');
        });
      });
      play();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
