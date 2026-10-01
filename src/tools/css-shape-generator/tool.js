/* CSS Shape Generator — shape/size/color → clip-path or border-triangle CSS, live preview. */
(function () {
  'use strict';
  var SLUG = 'css-shape-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  var POLYS = {
    diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    pentagon: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    cross: 'polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)',
    'arrow-right': 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
    chevron: 'polygon(0% 20%, 45% 50%, 0% 80%, 20% 100%, 65% 50%, 20% 0%)',
    parallelogram: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
    trapezoid: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
  };

  function cssFor(shape, size, color) {
    var s = Math.max(10, Math.min(600, size || 120));
    var half = Math.round(s / 2);
    var L = ['.csg-shape {'];
    if (shape === 'triangle-up') {
      L.push('  width: 0;', '  height: 0;',
        '  border-left: ' + half + 'px solid transparent;',
        '  border-right: ' + half + 'px solid transparent;',
        '  border-bottom: ' + s + 'px solid ' + color + ';');
    } else if (shape === 'triangle-down') {
      L.push('  width: 0;', '  height: 0;',
        '  border-left: ' + half + 'px solid transparent;',
        '  border-right: ' + half + 'px solid transparent;',
        '  border-top: ' + s + 'px solid ' + color + ';');
    } else if (shape === 'triangle-left') {
      L.push('  width: 0;', '  height: 0;',
        '  border-top: ' + half + 'px solid transparent;',
        '  border-bottom: ' + half + 'px solid transparent;',
        '  border-right: ' + s + 'px solid ' + color + ';');
    } else if (shape === 'triangle-right') {
      L.push('  width: 0;', '  height: 0;',
        '  border-top: ' + half + 'px solid transparent;',
        '  border-bottom: ' + half + 'px solid transparent;',
        '  border-left: ' + s + 'px solid ' + color + ';');
    } else if (shape === 'circle') {
      L.push('  width: ' + s + 'px;', '  height: ' + s + 'px;',
        '  background: ' + color + ';', '  border-radius: 50%;');
    } else if (shape === 'oval') {
      L.push('  width: ' + Math.round(s * 1.6) + 'px;', '  height: ' + s + 'px;',
        '  background: ' + color + ';', '  border-radius: 50%;');
    } else if (shape === 'square') {
      L.push('  width: ' + s + 'px;', '  height: ' + s + 'px;', '  background: ' + color + ';');
    } else {
      L.push('  width: ' + s + 'px;', '  height: ' + s + 'px;',
        '  background: ' + color + ';',
        '  clip-path: ' + POLYS[shape] + ';');
    }
    L.push('}');
    return L.join('\n');
  }

  function update() {
    clear();
    var shape = el(SLUG + '-shape').value;
    var size = parseInt(el(SLUG + '-size').value, 10);
    var color = el(SLUG + '-color').value;
    if (!(size >= 10 && size <= 600)) { fail('Size must be between 10 and 600 px.'); return; }
    var css = cssFor(shape, size, color);
    el(SLUG + '-output').value = css + '\n';
    var pv = el(SLUG + '-preview');
    pv.style.background = el(SLUG + '-bg').value === 'light' ? '#f4f4f5' : '#18181b';
    pv.innerHTML = '<style>' + css + '</style><div class="csg-shape"></div>';
  }

  try {
    if (!el(SLUG + '-shape')) return;
    ['shape', 'bg'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    ['size', 'color'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'shape.css', 'text/css');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
