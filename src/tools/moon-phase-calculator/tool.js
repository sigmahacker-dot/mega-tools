(function () {
  'use strict';
  var P = 'moon-phase-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var SYNODIC = 29.530588853;
  var REF = Date.UTC(2000, 0, 6, 18, 14); /* known new moon */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function phaseFor(age) {
    var e = SYNODIC / 8; /* 3.6913 */
    if (age < e / 2 || age >= SYNODIC - e / 2) return ['New Moon', '🌑'];
    if (age < e * 1.5) return ['Waxing Crescent', '🌒'];
    if (age < e * 2.5) return ['First Quarter', '🌓'];
    if (age < e * 3.5) return ['Waxing Gibbous', '🌔'];
    if (age < e * 4.5) return ['Full Moon', '🌕'];
    if (age < e * 5.5) return ['Waning Gibbous', '🌘'];
    if (age < e * 6.5) return ['Last Quarter', '🌗'];
    return ['Waning Crescent', '🌖'];
  }
  function fmtD(ms) {
    var d = new Date(ms);
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
  }
  function calc() {
    if (!g('date')) return;
    TN.clearErr(ERR);
    var v = g('date').value;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) {
      set('emoji', '–'); set('name', 'Phase'); set('illum', '–'); set('age', '–');
      g('body').innerHTML = '<tr><td colspan="2" class="muted">Pick a date to see its moon phase.</td></tr>';
      return;
    }
    var ms = Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), 12, 0);
    var age = (((ms - REF) / 86400000) % SYNODIC + SYNODIC) % SYNODIC;
    var illum = (1 - Math.cos(2 * Math.PI * age / SYNODIC)) / 2;
    var ph = phaseFor(age);
    set('emoji', ph[1]);
    set('name', ph[0]);
    set('illum', (illum * 100).toFixed(1) + '%');
    set('age', age.toFixed(1));
    var toNew = (SYNODIC - age) % SYNODIC;
    var toFull = ((SYNODIC / 2 - age) % SYNODIC + SYNODIC) % SYNODIC;
    g('body').innerHTML =
      '<tr><td>🌑 Next new moon</td><td>' + TN.esc(fmtD(ms + toNew * 86400000)) + ' (in ' + TN.esc(Math.round(toNew)) + ' days)</td></tr>' +
      '<tr><td>🌕 Next full moon</td><td>' + TN.esc(fmtD(ms + toFull * 86400000)) + ' (in ' + TN.esc(Math.round(toFull)) + ' days)</td></tr>';
  }
  try {
    var t = new Date();
    g('date').value = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    TN.on(P + 'date', 'input', calc);
    TN.on(P + 'date', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
