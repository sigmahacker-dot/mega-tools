/* Before/After Comparison Slider Snippet — live demo + copyable HTML/CSS/JS. */
(function () {
  'use strict';
  var SLUG = 'image-comparison-slider-snippet';
  var ERR = SLUG + '-error';
  var pos = 50;

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function placeholder(label, c1, c2) {
    var cv = document.createElement('canvas');
    cv.width = 640; cv.height = 360;
    var ctx = cv.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 640, 360);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 360);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 320, 195);
    return cv.toDataURL('image/png');
  }

  function paint() {
    TN.clearErr(ERR);
    try {
      var color = $('handle').value;
      pos = parseInt($('start').value, 10);
      $('start-v').textContent = pos + '%';
      $('img-b').style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
      $('line').style.left = pos + '%';
      $('line').style.background = color;
      $('knob').style.left = pos + '%';
      $('knob').style.background = color;

      var css = '.ba-wrap { position: relative; width: 100%; max-width: 900px; aspect-ratio: 16/9; overflow: hidden; border-radius: 10px; user-select: none; cursor: ew-resize; }\n'
        + '.ba-wrap img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }\n'
        + '.ba-before { clip-path: inset(0 ' + (100 - pos) + '% 0 0); }\n'
        + '.ba-line { position: absolute; top: 0; bottom: 0; left: ' + pos + '%; width: 3px; background: ' + color + '; transform: translateX(-50%); pointer-events: none; }\n'
        + '.ba-knob { position: absolute; top: 50%; left: ' + pos + '%; transform: translate(-50%, -50%); width: 44px; height: 44px; border-radius: 50%;\n'
        + '  background: ' + color + '; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 2px 10px rgba(0,0,0,.35); pointer-events: none; }\n'
        + '.ba-tag { position: absolute; top: 10px; padding: 4px 10px; border-radius: 999px; background: rgba(0,0,0,.55); color: #fff; font-size: 12px; pointer-events: none; }\n'
        + '.ba-tag.left { left: 10px; } .ba-tag.right { right: 10px; }';
      var js = '(function () {\n'
        + '  var wrap = document.querySelector(\'.ba-wrap\');\n'
        + '  if (!wrap) return;\n'
        + '  var before = wrap.querySelector(\'.ba-before\');\n'
        + '  var line = wrap.querySelector(\'.ba-line\');\n'
        + '  var knob = wrap.querySelector(\'.ba-knob\');\n'
        + '  function setPos(pct) {\n'
        + '    pct = Math.max(2, Math.min(98, pct));\n'
        + '    before.style.clipPath = \'inset(0 \' + (100 - pct) + \'% 0 0)\';\n'
        + '    line.style.left = pct + \'%\';\n'
        + '    knob.style.left = pct + \'%\';\n'
        + '  }\n'
        + '  function fromEvent(e) {\n'
        + '    var r = wrap.getBoundingClientRect();\n'
        + '    setPos(((e.clientX - r.left) / r.width) * 100);\n'
        + '  }\n'
        + '  var dragging = false;\n'
        + '  wrap.addEventListener(\'pointerdown\', function (e) { dragging = true; fromEvent(e); try { wrap.setPointerCapture(e.pointerId); } catch (x) {} });\n'
        + '  wrap.addEventListener(\'pointermove\', function (e) { if (dragging) fromEvent(e); });\n'
        + '  wrap.addEventListener(\'pointerup\', function () { dragging = false; });\n'
        + '  wrap.addEventListener(\'pointercancel\', function () { dragging = false; });\n'
        + '})();';
      var html = '<div class="ba-wrap">\n'
        + '  <img src="after.jpg" alt="After">\n'
        + '  <img src="before.jpg" alt="Before" class="ba-before">\n'
        + '  <div class="ba-line"></div>\n'
        + '  <div class="ba-knob">&harr;</div>\n'
        + '  <span class="ba-tag left">Before</span>\n'
        + '  <span class="ba-tag right">After</span>\n'
        + '</div>';
      $('code').textContent = '<!-- 1) HTML — replace before.jpg / after.jpg with your images -->\n' + html
        + '\n\n<!-- 2) CSS -->\n<style>\n' + css + '\n</style>'
        + '\n\n<!-- 3) JS (drag support) -->\n<script>\n' + js + '\n<\/script>';
    } catch (e) {
      TN.setErr(ERR, 'Could not render the demo.');
    }
  }

  function bindDrag() {
    var wrap = $('wrap');
    var dragging = false;
    function fromEvent(e) {
      var r = wrap.getBoundingClientRect();
      var pct = ((e.clientX - r.left) / r.width) * 100;
      $('start').value = Math.round(Math.max(2, Math.min(98, pct)));
      paint();
    }
    wrap.addEventListener('pointerdown', function (e) { dragging = true; try { wrap.setPointerCapture(e.pointerId); } catch (x) {} fromEvent(e); });
    wrap.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    wrap.addEventListener('pointerup', function () { dragging = false; });
    wrap.addEventListener('pointercancel', function () { dragging = false; });
  }

  function onFile(inputId) {
    return function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        if (inputId === 'before') $('img-b').src = r.result;   /* before = top layer */
        else $('img-a').src = r.result;                        /* after = bottom layer */
      };
      r.onerror = function () { TN.setErr(ERR, 'Could not read that image.'); };
      r.readAsDataURL(f);
    };
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      $('img-a').src = placeholder('AFTER', '#e11d48', '#f59e0b');
      $('img-b').src = placeholder('BEFORE', '#0ea5e9', '#7c3aed');
      bindDrag();
      TN.on(SLUG + '-before', 'change', onFile('before'));
      TN.on(SLUG + '-after', 'change', onFile('after'));
      TN.on(SLUG + '-handle', 'input', paint);
      TN.on(SLUG + '-start', 'input', paint);
      TN.on(SLUG + '-placeholder', 'click', function () {
        $('img-a').src = placeholder('AFTER', '#e11d48', '#f59e0b');
        $('img-b').src = placeholder('BEFORE', '#0ea5e9', '#7c3aed');
        TN.clearErr(ERR);
      });
      TN.on(SLUG + '-copy', 'click', function () {
        var txt = $('code').textContent;
        if (!txt) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
        TN.copy(txt).then(function (ok) {
          if (ok) TN.clearErr(ERR);
          else TN.setErr(ERR, 'Copy failed — select the code and copy manually.');
        });
      });
      paint();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
