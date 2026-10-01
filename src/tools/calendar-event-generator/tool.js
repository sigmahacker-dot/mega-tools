(function () {
  'use strict';
  var ERR = 'calendar-event-generator-error';
  function val(id) { var e = TN.el(id); return e ? e.value.trim() : ''; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtUTC(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function fmtDate(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
  function icsEsc(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n');
  }
  function fold(line) {
    var out = '';
    while (line.length > 75) { out += line.slice(0, 75) + '\r\n '; line = line.slice(75); }
    return out + line;
  }
  function build() {
    var startRaw = TN.el('cal-start').value, endRaw = TN.el('cal-end').value;
    if (!startRaw) return { err: 'Choose a start date and time.' };
    var start = new Date(startRaw);
    var end = endRaw ? new Date(endRaw) : new Date(start.getTime() + 3600000);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { err: 'Invalid date/time entered.' };
    if (end <= start) return { err: 'End must be after the start.' };
    var allday = TN.el('cal-allday').checked;
    var uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10) + '@toolnest';
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ToolNest//Calendar Event Generator//EN',
      'BEGIN:VEVENT', 'UID:' + uid, 'DTSTAMP:' + fmtUTC(new Date())];
    if (allday) {
      L.push('DTSTART;VALUE=DATE:' + fmtDate(start));
      var e2 = end <= start ? new Date(start.getTime() + 86400000) : end;
      L.push('DTEND;VALUE=DATE:' + fmtDate(e2));
    } else {
      L.push('DTSTART:' + fmtUTC(start));
      L.push('DTEND:' + fmtUTC(end));
    }
    L.push('SUMMARY:' + icsEsc(val('cal-title') || 'Untitled Event'));
    if (val('cal-location')) L.push('LOCATION:' + icsEsc(val('cal-location')));
    if (val('cal-desc')) L.push('DESCRIPTION:' + icsEsc(val('cal-desc')));
    var rem = TN.el('cal-reminder').value;
    if (rem !== 'none') {
      L.push('BEGIN:VALARM', 'TRIGGER:-' + rem, 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM');
    }
    L.push('END:VEVENT', 'END:VCALENDAR');
    return { ics: L.map(fold).join('\r\n') };
  }
  function dl(text, name) {
    var b = new Blob([text], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function update() {
    if (!TN.el('cal-out')) return;
    TN.clearErr(ERR);
    var r = build();
    if (r.err) { TN.el('cal-out').value = ''; TN.setErr(ERR, r.err); return; }
    TN.el('cal-out').value = r.ics;
  }
  try {
    ['cal-title', 'cal-location', 'cal-desc', 'cal-reminder'].forEach(function (id) {
      TN.on(id, 'input', update); TN.on(id, 'change', update);
    });
    ['cal-start', 'cal-end'].forEach(function (id) { TN.on(id, 'change', update); TN.on(id, 'input', update); });
    TN.on('cal-allday', 'change', update);
    TN.on('cal-dl', 'click', function () {
      var r = build();
      if (r.err) { TN.setErr(ERR, r.err); return; }
      TN.clearErr(ERR);
      var n = (val('cal-title') || 'event').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'event';
      dl(r.ics, n + '.ics');
    });
    TN.on('cal-copy', 'click', function () { if (TN.copy) TN.copy(TN.el('cal-out').value); });
    update();
  } catch (e) { /* never throw on load */ }
})();