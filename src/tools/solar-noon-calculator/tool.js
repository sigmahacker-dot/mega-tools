/* Solar Noon Calculator — solar noon from date, longitude, UTC offset (equation of time). */
(function () {
  'use strict';
  var SLUG = 'solar-noon-calculator';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function dayOfYear(d) {
    return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  }

  function fmtClock(mins) {
    mins = ((Math.round(mins) % 1440) + 1440) % 1440;
    return ('0' + Math.floor(mins / 60)).slice(-2) + ':' + ('0' + (mins % 60)).slice(-2);
  }

  function calc() {
    TN.clearErr(SLUG + '-error');
    var d = parseDate($('date').value);
    var lon = parseFloat($('lon').value);
    var tz = parseFloat($('tz').value);
    if (!d) { TN.setErr(SLUG + '-error', 'Please pick a valid date.'); return; }
    if (!(lon >= -180 && lon <= 180)) { TN.setErr(SLUG + '-error', 'Longitude must be between −180 and 180.'); return; }
    if (!(tz >= -12 && tz <= 14)) { TN.setErr(SLUG + '-error', 'UTC offset must be between −12 and +14.'); return; }

    var rad = Math.PI / 180;
    var N = dayOfYear(d);
    var B = rad * 360 / 365 * (N - 81);
    var eot = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B) -
      0.014615 * Math.cos(2 * B) - 0.040849 * Math.sin(2 * B));

    var noonLocalMin = 720 - 4 * lon - eot + tz * 60;
    $('noon').textContent = fmtClock(noonLocalMin);
    $('eot').textContent = (eot >= 0 ? '+' : '−') + Math.abs(eot).toFixed(1) + ' min';

    var tzLbl = 'UTC' + (tz >= 0 ? '+' : '') + tz;
    var ds = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    $('out').innerHTML = '<p>On <strong>' + ds + '</strong> at longitude ' + lon + '° (' + tzLbl + '), the sun is highest at <strong>' +
      fmtClock(noonLocalMin) + '</strong>.</p>' +
      '<p class="muted">Why not 12:00? Your meridian is ' + (4 * Math.abs(lon - tz * 15)).toFixed(1) +
      ' minutes of solar time from the timezone meridian' +
      (Math.abs(eot) >= 0.05 ? ', and the equation of time shifts it ' + (eot >= 0 ? '+' : '−') + Math.abs(eot).toFixed(1) + ' min' : '') + '.</p>';
  }

  try {
    TN.on(SLUG + '-calc', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
