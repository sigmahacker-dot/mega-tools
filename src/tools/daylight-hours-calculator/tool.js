/* Daylight Hours Calculator — sunrise/sunset/day length via standard solar equations. */
(function () {
  'use strict';
  var SLUG = 'daylight-hours-calculator';
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

  /* Returns {decl, eot, cosH} — decl in degrees, eot in minutes, cosH of sunrise hour angle. */
  function solar(d, lat) {
    var rad = Math.PI / 180;
    var N = dayOfYear(d);
    var decl = -23.44 * Math.cos(rad * 360 / 365 * (N + 10));
    var B = rad * 360 / 365 * (N - 81);
    var eot = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B) -
      0.014615 * Math.cos(2 * B) - 0.040849 * Math.sin(2 * B));
    var latR = lat * rad, declR = decl * rad;
    var cosH = (Math.cos(rad * 90.833) - Math.sin(latR) * Math.sin(declR)) /
      (Math.cos(latR) * Math.cos(declR));
    return { decl: decl, eot: eot, cosH: cosH };
  }

  function fmtClock(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60), m = Math.floor(mins % 60);
    return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
  }

  function fmtDur(hours) {
    var h = Math.floor(hours), m = Math.round((hours - h) * 60);
    if (m === 60) { h++; m = 0; }
    return h + 'h ' + ('0' + m).slice(-2) + 'm';
  }

  function calc() {
    TN.clearErr(SLUG + '-error');
    var d = parseDate($('date').value);
    var lat = parseFloat($('lat').value);
    if (!d) { TN.setErr(SLUG + '-error', 'Please pick a valid date.'); return; }
    if (!(lat >= -90 && lat <= 90)) { TN.setErr(SLUG + '-error', 'Latitude must be between −90 and 90.'); return; }

    var s = solar(d, lat);
    var out = $('out');
    if (s.cosH > 1) {
      // polar night
      $('rise').textContent = $('set').textContent = $('noon').textContent = '—';
      $('len').textContent = '0h 00m';
      out.innerHTML = '<p class="note">🌑 <strong>Polar night</strong> — the sun does not rise on this date at this latitude.</p>';
      return;
    }
    if (s.cosH < -1) {
      $('rise').textContent = $('set').textContent = $('noon').textContent = '—';
      $('len').textContent = '24h 00m';
      out.innerHTML = '<p class="note">🌞 <strong>Polar day</strong> — the sun does not set on this date at this latitude (24h daylight).</p>';
      return;
    }
    var Hdeg = Math.acos(s.cosH) * 180 / Math.PI;
    var dayLenH = 2 * Hdeg / 15;
    $('len').textContent = fmtDur(dayLenH);

    var lonRaw = $('lon').value.trim(), tzRaw = $('tz').value.trim();
    var lon = lonRaw === '' ? null : parseFloat(lonRaw);
    var tz = tzRaw === '' ? null : parseFloat(tzRaw);
    var ds = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    if (lon === null || tz === null || isNaN(lon) || isNaN(tz) || lon < -180 || lon > 180 || tz < -12 || tz > 14) {
      // no clock times — show relative to solar noon
      var half = fmtDur(dayLenH / 2);
      $('rise').textContent = '−' + half;
      $('set').textContent = '+' + half;
      $('noon').textContent = 'ref';
      out.innerHTML = '<p class="muted">Sunrise is <strong>' + half + '</strong> before solar noon and sunset <strong>' +
        half + '</strong> after it. Add longitude + UTC offset for local clock times.</p>';
      return;
    }
    var noonUTCmin = 720 - 4 * lon - s.eot;
    var riseMin = noonUTCmin - dayLenH * 30 + tz * 60;
    var setMin = noonUTCmin + dayLenH * 30 + tz * 60;
    var noonMin = noonUTCmin + tz * 60;
    $('rise').textContent = fmtClock(riseMin);
    $('set').textContent = fmtClock(setMin);
    $('noon').textContent = fmtClock(noonMin);
    var tzLbl = 'UTC' + (tz >= 0 ? '+' : '') + tz;
    out.innerHTML = '<p>On <strong>' + ds + '</strong> at ' + lat + '°, ' + lon + '° (' + tzLbl + '):</p>' +
      '<p class="muted">Sunrise <strong>' + fmtClock(riseMin) + '</strong> · Solar noon <strong>' +
      fmtClock(noonMin) + '</strong> · Sunset <strong>' + fmtClock(setMin) +
      '</strong> · Day length <strong>' + fmtDur(dayLenH) + '</strong><br>' +
      'Equation of time: ' + (s.eot >= 0 ? '+' : '') + s.eot.toFixed(1) + ' min · Solar declination: ' +
      (s.decl >= 0 ? '+' : '') + s.decl.toFixed(2) + '°</p>';
  }

  try {
    TN.on(SLUG + '-calc', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
