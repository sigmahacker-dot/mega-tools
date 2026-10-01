/* Clip Path Generator — click-to-draw polygon editor → clip-path: polygon() CSS. */
(function () {
  'use strict';
  var SLUG = 'clip-path-generator';
  var points = [];
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function drawDots() {
    var c = el(SLUG + '-canvas');
    var olds = c.querySelectorAll('.cpg-dot');
    for (var i = 0; i < olds.length; i++) olds[i].remove();
    points.forEach(function (p, i) {
      var d = document.createElement('div');
      d.className = 'cpg-dot';
      d.style.cssText = 'position:absolute;left:' + p.x + '%;top:' + p.y + '%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#84cc16;border:2px solid #18181b;pointer-events:none';
      d.title = (i + 1) + ': ' + p.x.toFixed(1) + '%, ' + p.y.toFixed(1) + '%';
      c.appendChild(d);
    });
  }

  function clipValue() {
    if (points.length < 3) return '';
    return 'polygon(' + points.map(function (p) {
      return p.x.toFixed(1) + '% ' + p.y.toFixed(1) + '%';
    }).join(', ') + ')';
  }

  function update() {
    clear();
    drawDots();
    var cp = clipValue();
    var box = el(SLUG + '-box');
    box.style.clipPath = cp || 'none';
    if (cp) {
      el(SLUG + '-output').value = '.cpg-clipped {\n  clip-path: ' + cp + ';\n}\n';
    } else {
      el(SLUG + '-output').value = '/* Add at least 3 points to generate a clip-path. */\n';
    }
  }

  function addPoint(clientX, clientY) {
    var c = el(SLUG + '-canvas');
    var r = c.getBoundingClientRect();
    var x = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    var y = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
    points.push({ x: x, y: y });
    update();
  }

  try {
    if (!el(SLUG + '-canvas')) return;
    var canvas = el(SLUG + '-canvas');
    canvas.addEventListener('click', function (e) { addPoint(e.clientX, e.clientY); });
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length) { addPoint(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }
    }, { passive: false });
    TN.on(SLUG + '-undo', 'click', function () { points.pop(); update(); });
    TN.on(SLUG + '-clear', 'click', function () { points = []; update(); });
    TN.on(SLUG + '-preset-rect', 'click', function () {
      points = [{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}]; update();
    });
    TN.on(SLUG + '-preset-tri', 'click', function () {
      points = [{x:50,y:0},{x:100,y:100},{x:0,y:100}]; update();
    });
    TN.on(SLUG + '-preset-dia', 'click', function () {
      points = [{x:50,y:0},{x:100,y:50},{x:50,y:100},{x:0,y:50}]; update();
    });
    TN.on(SLUG + '-color', 'input', function () {
      var c = el(SLUG + '-color').value;
      el(SLUG + '-box').style.background = 'linear-gradient(135deg,' + c + ',#a3e635)';
    });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.downloadText(el(SLUG + '-output').value, 'clip-path.css', 'text/css');
    });
    points = [{x:50,y:0},{x:100,y:100},{x:0,y:100}];
    update();
  } catch (e) { /* never throw on load */ }
})();
