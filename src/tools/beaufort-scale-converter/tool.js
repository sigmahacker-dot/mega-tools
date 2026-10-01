(function () {
  'use strict';
  var S = 'beaufort-scale-converter';
  /* [number, minKmh (inclusive), term, land description, sea description] */
  var SCALE = [
    [0, 0, 'Calm', 'Smoke rises vertically.', 'Sea like a mirror.'],
    [1, 1, 'Light air', 'Wind direction shown by smoke drift, not vanes.', 'Ripples with no foam crests.'],
    [2, 6, 'Light breeze', 'Wind felt on face; leaves rustle.', 'Small wavelets; crests do not break.'],
    [3, 12, 'Gentle breeze', 'Leaves and small twigs in constant motion.', 'Large wavelets; scattered whitecaps.'],
    [4, 20, 'Moderate breeze', 'Raises dust and loose paper; small branches move.', 'Small waves; frequent whitecaps.'],
    [5, 29, 'Fresh breeze', 'Small trees in leaf begin to sway.', 'Moderate waves; many whitecaps, some spray.'],
    [6, 39, 'Strong breeze', 'Large branches in motion; whistling heard in wires.', 'Large waves; extensive whitecaps, spray.'],
    [7, 50, 'Near gale', 'Whole trees in motion; effort needed to walk against wind.', 'Sea heaps up; white foam blown in streaks.'],
    [8, 62, 'Gale', 'Twigs break off trees; progress on foot seriously impeded.', 'Moderately high waves; crests break into spindrift.'],
    [9, 75, 'Strong gale', 'Slight structural damage occurs.', 'High waves; dense foam streaks; sea begins to roll.'],
    [10, 89, 'Storm', 'Trees uprooted; considerable structural damage.', 'Very high waves; sea surface white with foam.'],
    [11, 103, 'Violent storm', 'Widespread structural damage.', 'Exceptionally high waves; visibility reduced.'],
    [12, 118, 'Hurricane force', 'Devastation.', 'Air filled with foam and spray; sea completely white.']
  ];
  function toKmh(v, unit) {
    if (unit === 'mph') return v * 1.609344;
    if (unit === 'kt') return v * 1.852;
    if (unit === 'ms') return v * 3.6;
    return v;
  }
  function lookup(kmh) {
    var cur = SCALE[0];
    for (var i = 0; i < SCALE.length; i++) {
      if (kmh >= SCALE[i][1]) cur = SCALE[i];
    }
    return cur;
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var nEl = TN.el(S + '-num'), tEl = TN.el(S + '-term');
      var landEl = TN.el(S + '-land'), seaEl = TN.el(S + '-sea');
      var raw = TN.el(S + '-speed').value;
      if (raw === '' || raw === null) {
        if (nEl) nEl.textContent = '–';
        if (tEl) tEl.textContent = '–';
        if (landEl) landEl.textContent = '';
        if (seaEl) seaEl.textContent = '';
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v) || v < 0) { TN.setErr(S + '-error', 'Enter a non-negative wind speed.'); return; }
      var kmh = toKmh(v, TN.el(S + '-unit').value);
      var b = lookup(kmh);
      if (nEl) nEl.textContent = 'Force ' + b[0];
      if (tEl) tEl.textContent = b[2];
      if (landEl) landEl.textContent = 'On land: ' + b[3];
      if (seaEl) seaEl.textContent = 'At sea: ' + b[4];
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    var tb = TN.el(S + '-table');
    if (tb) {
      var html = '';
      for (var i = 0; i < SCALE.length; i++) {
        var range = i < SCALE.length - 1 ? SCALE[i][1] + '–' + (SCALE[i + 1][1] - 1) : '≥ ' + SCALE[i][1];
        html += '<tr><td>' + SCALE[i][0] + '</td><td>' + range + '</td><td>' + SCALE[i][2] + '</td></tr>';
      }
      tb.innerHTML = html;
    }
    ['speed', 'unit'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
