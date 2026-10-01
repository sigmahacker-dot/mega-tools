(function () {
  'use strict';
  var S = 'cooking-temp-converter';
  /* standard UK gas mark table */
  var MARKS = [
    [1, 140, 275], [2, 150, 300], [3, 170, 325], [4, 180, 350],
    [5, 190, 375], [6, 200, 400], [7, 220, 425], [8, 230, 450], [9, 240, 475]
  ];
  /* classic oven descriptors by Celsius */
  var DESCRIPTORS = [
    [120, 'Very slow oven'], [140, 'Slow oven'], [160, 'Moderately slow oven'],
    [175, 'Moderate oven'], [190, 'Moderately hot oven'], [200, 'Hot oven'],
    [220, 'Very hot oven'], [9999, 'Extremely hot oven']
  ];
  function describe(c) {
    var d = DESCRIPTORS[DESCRIPTORS.length - 1][1];
    for (var i = 0; i < DESCRIPTORS.length; i++) {
      if (c < DESCRIPTORS[i][0]) { d = DESCRIPTORS[i][1]; break; }
    }
    return d;
  }
  function nearestMark(c) {
    var best = MARKS[0], bd = 1e9;
    for (var i = 0; i < MARKS.length; i++) {
      var d = Math.abs(c - MARKS[i][1]);
      if (d < bd) { bd = d; best = MARKS[i]; }
    }
    return best;
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var raw = TN.el(S + '-value').value;
      var convEl = TN.el(S + '-converted'), gmEl = TN.el(S + '-gasmark'), dEl = TN.el(S + '-desc');
      if (raw === '' || raw === null) {
        if (convEl) convEl.textContent = '–';
        if (gmEl) gmEl.textContent = '–';
        if (dEl) dEl.textContent = '–';
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v)) { TN.setErr(S + '-error', 'Please enter a valid number.'); return; }
      var f, c;
      if (TN.el(S + '-from').value === 'F') { f = v; c = (v - 32) * 5 / 9; }
      else { c = v; f = v * 9 / 5 + 32; }
      if (f < -459.67) { TN.setErr(S + '-error', 'Below absolute zero — check your value.'); return; }
      var gm = nearestMark(c);
      if (convEl) convEl.textContent = Math.round(c) + ' °C / ' + Math.round(f) + ' °F';
      if (gmEl) gmEl.textContent = 'Mark ' + gm[0] + ' (' + gm[1] + '°C / ' + gm[2] + '°F)';
      if (dEl) dEl.textContent = describe(c);
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    var tb = TN.el(S + '-table');
    if (tb) {
      var html = '';
      for (var i = 0; i < MARKS.length; i++) {
        html += '<tr><td>' + MARKS[i][0] + '</td><td>' + MARKS[i][1] + ' °C</td><td>' + MARKS[i][2] + ' °F</td></tr>';
      }
      tb.innerHTML = html;
    }
    convert();
    ['value', 'from'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
