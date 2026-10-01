/* Golden Hour Calculator — morning/evening golden-hour windows from solar math or manual times. */
(function () {
  'use strict';
  var SLUG = 'golden-hour-calculator';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function parseTime(v) {
    var m = /^(\d{2}):(\d{2})$/.exec(v || '');
    if (!m) return null;
    var h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
  }

  function dayOfYear(d) {
    return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  }

  /* Auto sunrise/sunset in minutes of local time, or null on polar day/night. */
  function autoSun(d, lat, lon, tz) {
    var rad = Math.PI / 180;
    var N = dayOfYear(d);
    var decl = -23.44 * Math.cos(rad * 360 / 365 * (N + 10));
    var B = rad * 360 / 365 * (N - 81);
    var eot = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B) -
      0.014615 * Math.cos(2 * B) - 0.040849 * Math.sin(2 * B));
    var latR = lat * rad, declR = decl * rad;
    var cosH = (Math.cos(rad * 90.833) - Math.sin(latR) * Math.sin(declR)) /
      (Math.cos(latR) * Math.cos(declR));
    if (cosH > 1 || cosH < -1) return null;
    var dayLenMin = 2 * Math.acos(cosH) * 180 / Math.PI / 15 * 60;
    var noonMin = 720 - 4 * lon - eot + tz * 60;
    return { rise: noonMin - dayLenMin / 2, set: noonMin + dayLenMin / 2 };
  }

  function fmt(mins) {
    mins = ((Math.round(mins) % 1440) + 1440) % 1440;
    return ('0' + Math.floor(mins / 60)).slice(-2) + ':' + ('0' + (mins % 60)).slice(-2);
  }

  function calc() {
    TN.clearErr(SLUG + '-error');
    var rise = parseTime($('rise').value);
    var set = parseTime($('set').value);
    var source;
    if (rise !== null && set !== null) {
      if (set <= rise) { TN.setErr(SLUG + '-error', 'Sunset must be after sunrise.'); return; }
      source = 'your entered times';
    } else if (rise !== null || set !== null) {
      TN.setErr(SLUG + '-error', 'Enter both sunrise and sunset, or leave both blank to auto-compute.');
      return;
    } else {
      var d = parseDate($('date').value);
      var lat = parseFloat($('lat').value);
      var lon = parseFloat($('lon').value), tz = parseFloat($('tz').value);
      if (!d) { TN.setErr(SLUG + '-error', 'Please pick a date.'); return; }
      if (!(lat >= -90 && lat <= 90)) { TN.setErr(SLUG + '-error', 'Latitude must be between −90 and 90.'); return; }
      if (!(lon >= -180 && lon <= 180) || !(tz >= -12 && tz <= 14)) {
        TN.setErr(SLUG + '-error', 'For auto times, longitude (−180…180) and UTC offset (−12…+14) are required.');
        return;
      }
      var sun = autoSun(d, lat, lon, tz);
      if (!sun) {
        $('morn').textContent = $('eve').textContent = '—';
        $('out').innerHTML = '<p class="note">No sunrise/sunset on this date at this latitude (polar day or night) — so no golden hour either.</p>';
        return;
      }
      rise = sun.rise; set = sun.set;
      source = 'computed from ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' at ' + lat + '°';
    }

    // Golden hour ≈ first hour after sunrise / last hour before sunset.
    // Clamp each window to at most half the day so short days stay sane.
    var halfDay = (set - rise) / 2;
    var gh = Math.min(60, halfDay);
    var mornS = rise, mornE = rise + gh;
    var eveS = set - gh, eveE = set;

    $('morn').textContent = fmt(mornS) + ' – ' + fmt(mornE);
    $('eve').textContent = fmt(eveS) + ' – ' + fmt(eveE);
    $('out').innerHTML = '<p class="muted">Based on ' + source + ': sunrise <strong>' + fmt(rise) +
      '</strong>, sunset <strong>' + fmt(set) + '</strong>.<br>' +
      '📷 Best light is usually strongest in the first/last 20–30 minutes of each window.</p>';
  }

  try {
    TN.on(SLUG + '-calc', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
