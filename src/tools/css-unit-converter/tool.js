(function () {
  'use strict';
  var ERR = 'css-unit-converter-error';
  var UNITS = ['px', 'rem', 'em', '%', 'pt', 'pc', 'in', 'cm', 'mm', 'q', 'vw', 'vh', 'vmin', 'vmax', 'ex', 'ch'];
  function ctx() {
    var root = parseFloat(TN.el('cu-root').value) || 16;
    var parent = parseFloat(TN.el('cu-parent').value) || 16;
    return { root: root, parent: parent, vw: window.innerWidth / 100, vh: window.innerHeight / 100 };
  }
  // Convert value in `unit` to px
  function toPx(v, unit, c) {
    var vmin = Math.min(c.vw, c.vh), vmax = Math.max(c.vw, c.vh);
    switch (unit) {
      case 'px': return v;
      case 'rem': return v * c.root;
      case 'em': case '%': return v * c.parent / (unit === '%' ? 100 : 1);
      case 'pt': return v * 96 / 72;
      case 'pc': return v * 16;
      case 'in': return v * 96;
      case 'cm': return v * 96 / 2.54;
      case 'mm': return v * 96 / 25.4;
      case 'q': return v * 96 / 25.4 / 4;
      case 'vw': return v * c.vw;
      case 'vh': return v * c.vh;
      case 'vmin': return v * vmin;
      case 'vmax': return v * vmax;
      case 'ex': case 'ch': return v * c.parent * 0.5;
      default: return NaN;
    }
  }
  function fmt(n) {
    if (!isFinite(n)) return '–';
    var r = Math.round(n * 10000) / 10000;
    return String(r);
  }
  function update() {
    if (!TN.el('cu-out')) return;
    TN.clearErr(ERR);
    TN.el('cu-vp').textContent = window.innerWidth + ' × ' + window.innerHeight + ' px';
    var v = parseFloat(TN.el('cu-val').value);
    if (isNaN(v)) { TN.el('cu-out').textContent = '–'; TN.el('cu-px').textContent = '–'; return; }
    var from = TN.el('cu-from').value, to = TN.el('cu-to').value;
    var c = ctx();
    var px = toPx(v, from, c);
    if (!isFinite(px)) { TN.el('cu-out').textContent = '–'; TN.el('cu-px').textContent = '–'; return; }
    // px -> target: invert toPx by dividing/multiplying with the px value of 1 target unit
    var oneTarget = toPx(1, to, c);
    if (!oneTarget) { TN.setErr(ERR, 'Cannot convert to that unit.'); return; }
    var out = px / oneTarget;
    TN.el('cu-out').textContent = fmt(out) + to;
    TN.el('cu-px').textContent = fmt(px) + 'px';
  }
  try {
    var from = TN.el('cu-from'), to = TN.el('cu-to');
    UNITS.forEach(function (u) {
      var o1 = document.createElement('option'); o1.value = u; o1.textContent = u; from.appendChild(o1);
      var o2 = document.createElement('option'); o2.value = u; o2.textContent = u; to.appendChild(o2);
    });
    from.value = 'px'; to.value = 'rem';
    ['cu-val', 'cu-root', 'cu-parent'].forEach(function (id) { TN.on(id, 'input', update); });
    TN.on('cu-from', 'change', update);
    TN.on('cu-to', 'change', update);
    window.addEventListener('resize', update);
    update();
  } catch (e) { /* never throw on load */ }
})();