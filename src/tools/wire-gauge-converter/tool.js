(function () {
  'use strict';
  var P = 'wire-gauge-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function f3(n) { return String(Number(n.toFixed(3))); }
  /* AWG -> diameter in inches: d = 0.005 * 92^((36-n)/39) */
  function awgToDiaIn(n) { return 0.005 * Math.pow(92, (36 - n) / 39); }
  function diaInToAwg(dIn) { return 36 - 39 * Math.log(dIn / 0.005) / Math.log(92); }
  function specs(dMm) {
    var area = Math.PI * dMm * dMm / 4;
    var res = 0.0168 / area; /* rho=1.68e-8, L=1000m, A in mm² */
    return { dMm: dMm, area: area, res: res };
  }
  function blank() {
    set('dmm', '–'); set('area', '–'); set('res', '–');
    set('steps', 'Enter a value to convert.');
  }
  function calc() {
    if (!g('val')) return;
    TN.clearErr(ERR);
    var mode = g('mode').value;
    g('lab').textContent = mode === 'awg' ? 'AWG number (0–40)' : 'Diameter (mm)';
    var raw = g('val').value;
    if (raw === '') { blank(); return; }
    var v = parseFloat(raw);
    if (isNaN(v)) { TN.setErr(ERR, 'Enter a valid number.'); blank(); return; }
    var n, sp;
    if (mode === 'awg') {
      if (Math.floor(v) !== v || v < 0 || v > 40) { TN.setErr(ERR, 'AWG must be a whole number from 0 to 40.'); blank(); return; }
      n = v;
      sp = specs(awgToDiaIn(n) * 25.4);
      set('steps', 'AWG ' + n + ': d = 0.005 × 92^((36−' + n + ')/39) in = ' + f3(sp.dMm) + ' mm. Resistance is for solid annealed copper at 20 °C.');
    } else {
      if (v <= 0 || v > 50) { TN.setErr(ERR, 'Enter a diameter between 0 and 50 mm.'); blank(); return; }
      n = Math.round(diaInToAwg(v / 25.4));
      if (n < 0 || n > 40) { TN.setErr(ERR, 'That diameter is outside the AWG 0–40 range.'); blank(); return; }
      sp = specs(v);
      var exact = diaInToAwg(v / 25.4);
      set('steps', f3(v) + ' mm corresponds to AWG ' + exact.toFixed(2) + ' → nearest standard size AWG ' + n +
        ' (' + f3(awgToDiaIn(n) * 25.4) + ' mm nominal).');
    }
    set('dmm', f3(sp.dMm));
    set('area', f3(sp.area));
    set('res', f3(sp.res));
  }
  try {
    TN.on(P + 'mode', 'change', calc);
    TN.on(P + 'val', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
