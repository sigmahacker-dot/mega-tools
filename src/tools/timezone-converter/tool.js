(function () {
  'use strict';
  var ERR = 'timezone-converter-error';
  var ZONES = [
    'Asia/Karachi', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Bangkok', 'Asia/Riyadh', 'Asia/Tehran', 'Asia/Almaty',
    'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Moscow', 'Europe/Istanbul',
    'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Sao_Paulo', 'America/Mexico_City',
    'Australia/Sydney', 'Pacific/Auckland', 'UTC'
  ];
  var LIVE_ZONES = ['Asia/Karachi', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'];
  var clockTimer = null;

  function zoneLabel(z) { return z.replace(/_/g, ' '); }

  function fillZones() {
    var fEl = TN.el('timezone-from'), tEl = TN.el('timezone-to');
    if (!fEl || !tEl) return;
    var html = '';
    ZONES.forEach(function (z) {
      html += '<option value="' + z + '">' + zoneLabel(z) + '</option>';
    });
    fEl.innerHTML = html;
    tEl.innerHTML = html;
    fEl.value = 'Asia/Karachi';
    tEl.value = 'America/New_York';
  }

  // Interpret wall-clock components as being in tz, return the instant in UTC.
  function zonedToUtc(y, mo, d, h, mi, tz) {
    var guess = Date.UTC(y, mo - 1, d, h, mi, 0);
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    var parts = fmt.formatToParts(new Date(guess));
    var get = function (t) {
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === t) return parseInt(parts[i].value, 10);
      }
      return 0;
    };
    var hr = get('hour') === 24 ? 0 : get('hour');
    var asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hr, get('minute'), get('second'));
    var offset = asUtc - guess;
    return new Date(guess - offset);
  }

  function formatIn(date, tz) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  }

  function convert() {
    var dEl = TN.el('timezone-datetime'), fEl = TN.el('timezone-from'), tEl = TN.el('timezone-to');
    if (!dEl || !fEl || !tEl) return;
    TN.clearErr(ERR);
    var out = TN.el('timezone-output');
    var detail = TN.el('timezone-detail');
    if (!dEl.value) {
      if (out) out.textContent = '–';
      if (detail) detail.textContent = 'Enter a date and time above to convert.';
      return;
    }
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(dEl.value);
    if (!m) { TN.setErr(ERR, 'Please enter a valid date and time.'); return; }
    try {
      var utcDate = zonedToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], fEl.value);
      var result = formatIn(utcDate, tEl.value);
      var srcFmt = formatIn(utcDate, fEl.value);
      if (out) out.textContent = result;
      if (detail) detail.textContent = srcFmt + ' (' + zoneLabel(fEl.value) + ') = ' + result + ' (' + zoneLabel(tEl.value) + ')';
    } catch (e) {
      TN.setErr(ERR, 'Conversion failed for the selected time zones.');
    }
  }

  function tickClocks() {
    var tbody = TN.el('timezone-live');
    if (!tbody) { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } return; }
    var now = new Date();
    var html = '';
    LIVE_ZONES.forEach(function (z) {
      var t;
      try {
        t = new Intl.DateTimeFormat('en-GB', {
          timeZone: z, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
          day: '2-digit', month: 'short'
        }).format(now);
      } catch (e) { t = '–'; }
      html += '<tr><td>' + zoneLabel(z) + '</td><td>' + t + '</td></tr>';
    });
    tbody.innerHTML = html;
  }

  try {
    fillZones();
    TN.on('timezone-datetime', 'input', convert);
    TN.on('timezone-datetime', 'change', convert);
    TN.on('timezone-from', 'change', convert);
    TN.on('timezone-to', 'change', convert);
    if (TN.el('timezone-live')) {
      tickClocks();
      clockTimer = setInterval(tickClocks, 1000);
    }
  } catch (e) { /* never throw on load */ }
})();
