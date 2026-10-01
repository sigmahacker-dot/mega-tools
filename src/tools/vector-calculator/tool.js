(function () {
  'use strict';
  var P = 'vector-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function fmt(n) { if (!isFinite(n)) return '–'; return String(Number(n.toFixed(6))); }
  function vfmt(v) { return '⟨' + v.map(fmt).join(', ') + '⟩'; }
  function blank() {
    set('res', '–'); set('reslab', 'Result'); set('m1', '–'); set('m2', '–');
    set('steps', 'Enter both vectors to calculate.');
  }
  function calc() {
    if (!g('x1')) return;
    TN.clearErr(ERR);
    var dim = parseInt(g('dim').value, 10);
    g('z1w').style.display = dim === 3 ? '' : 'none';
    g('z2w').style.display = dim === 3 ? '' : 'none';
    var keys = dim === 3 ? ['x1', 'y1', 'z1', 'x2', 'y2', 'z2'] : ['x1', 'y1', 'x2', 'y2'];
    var vals = {};
    for (var i = 0; i < keys.length; i++) {
      var raw = g(keys[i]).value;
      if (raw === '') { blank(); return; }
      var v = parseFloat(raw);
      if (isNaN(v)) { TN.setErr(ERR, 'Enter valid numbers for all vector components.'); blank(); return; }
      vals[keys[i]] = v;
    }
    var v = [vals.x1, vals.y1], w = [vals.x2, vals.y2];
    if (dim === 3) { v.push(vals.z1); w.push(vals.z2); }
    function mag(a) { return Math.sqrt(a.reduce(function (s, x) { return s + x * x; }, 0)); }
    function dot(a, b) { var s = 0; for (var k = 0; k < a.length; k++) s += a[k] * b[k]; return s; }
    var m1 = mag(v), m2 = mag(w);
    set('m1', fmt(m1)); set('m2', fmt(m2));
    var op = g('op').value, res, lab, steps;
    if (op === 'add') {
      res = v.map(function (x, k) { return x + w[k]; });
      lab = 'v + w'; set('res', vfmt(res)); set('reslab', lab);
      steps = vfmt(v) + ' + ' + vfmt(w) + ' = ' + vfmt(res) + ' (add matching components).';
    } else if (op === 'sub') {
      res = v.map(function (x, k) { return x - w[k]; });
      lab = 'v − w'; set('res', vfmt(res)); set('reslab', lab);
      steps = vfmt(v) + ' − ' + vfmt(w) + ' = ' + vfmt(res) + ' (subtract matching components).';
    } else if (op === 'dot') {
      var d = dot(v, w);
      set('res', fmt(d)); set('reslab', 'v · w');
      steps = 'v · w = ' + v.map(function (x, k) { return fmt(x) + '×' + fmt(w[k]); }).join(' + ') + ' = ' + fmt(d) + '.';
    } else if (op === 'cross') {
      if (dim === 2) {
        var z = v[0] * w[1] - v[1] * w[0];
        set('res', fmt(z)); set('reslab', 'v × w (z-scalar)');
        steps = 'For 2D vectors, v × w = vₓw_y − v_ywₓ = ' + fmt(v[0]) + '×' + fmt(w[1]) + ' − ' + fmt(v[1]) + '×' + fmt(w[0]) + ' = ' + fmt(z) + '.';
      } else {
        var cr = [v[1] * w[2] - v[2] * w[1], v[2] * w[0] - v[0] * w[2], v[0] * w[1] - v[1] * w[0]];
        set('res', vfmt(cr)); set('reslab', 'v × w');
        steps = 'v × w = ⟨v_yw_z − v_zw_y, v_zwₓ − vₓw_z, vₓw_y − v_ywₓ⟩ = ' + vfmt(cr) + '.';
      }
    } else if (op === 'angle') {
      if (m1 === 0 || m2 === 0) { TN.setErr(ERR, 'The angle is undefined for a zero vector.'); set('res', '–'); set('reslab', 'Angle θ'); return; }
      var cos = Math.max(-1, Math.min(1, dot(v, w) / (m1 * m2)));
      var deg = Math.acos(cos) * 180 / Math.PI;
      set('res', fmt(deg) + '°'); set('reslab', 'Angle θ');
      steps = 'cos θ = (v·w) ÷ (|v|×|w|) = ' + fmt(dot(v, w)) + ' ÷ ' + fmt(m1 * m2) + ' = ' + fmt(cos) + ', so θ = ' + fmt(deg) + '°.';
    } else {
      set('res', fmt(m1)); set('reslab', '|v|');
      steps = '|v| = √(' + v.map(function (x) { return fmt(x) + '²'; }).join(' + ') + ') = ' + fmt(m1) + '; |w| = √(' + w.map(function (x) { return fmt(x) + '²'; }).join(' + ') + ') = ' + fmt(m2) + '.';
    }
    set('steps', steps);
  }
  try {
    ['x1', 'y1', 'z1', 'x2', 'y2', 'z2'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    TN.on(P + 'dim', 'change', calc);
    TN.on(P + 'op', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
