(function () {
  'use strict';
  var ERR = 'age-calculator-error';
  function fmt(n) {
    try { return n.toLocaleString('en-US'); } catch (e) { return String(n); }
  }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function clampAdd(date, years, months) {
    var y = date.getFullYear() + years;
    var m = date.getMonth() + months;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    var d = Math.min(date.getDate(), daysInMonth(y, m));
    return new Date(y, m, d, 0, 0, 0, 0);
  }
  function parse(d) {
    if (!d) return null;
    var dt = new Date(d + 'T00:00:00');
    return isNaN(dt.getTime()) ? null : dt;
  }
  function calc() {
    var dobEl = TN.el('age-dob');
    var asofEl = TN.el('age-asof');
    if (!dobEl || !asofEl) return;
    TN.clearErr(ERR);
    var dob = parse(dobEl.value);
    var asof = parse(asofEl.value);
    if (!dob) { TN.setErr(ERR, 'Please enter a valid date of birth.'); return; }
    if (!asof) { TN.setErr(ERR, 'Please enter a valid "as of" date.'); return; }
    if (dob > asof) { TN.setErr(ERR, 'Date of birth cannot be after the "as of" date.'); return; }

    // Exact y/m/d by walking forward from dob (day clamped to month length)
    var y = 0;
    while (clampAdd(dob, y + 1, 0) <= asof) y++;
    var m = 0;
    while (clampAdd(dob, y, m + 1) <= asof) m++;
    var rest = clampAdd(dob, y, m);
    var d = Math.round((asof - rest) / 86400000);

    var totalDays = Math.floor((asof - dob) / 86400000);
    var totalMonths = y * 12 + m;
    var totalWeeks = Math.floor(totalDays / 7);
    var totalHours = totalDays * 24;

    var weekday = '';
    try { weekday = dob.toLocaleDateString('en-US', { weekday: 'long' }); } catch (e) { weekday = ''; }

    // Next birthday (Feb 29 clamped to Feb 28 in non-leap years)
    var nb = clampAdd(dob, y + 1, 0);
    if (nb <= asof) nb = clampAdd(dob, y + 2, 0);
    var daysUntil = Math.round((nb - asof) / 86400000);
    var nbStr = '';
    try {
      nbStr = nb.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { nbStr = ''; }

    TN.el('age-years').textContent = fmt(y);
    TN.el('age-months').textContent = fmt(m);
    TN.el('age-days').textContent = fmt(d);
    TN.el('age-total-months').textContent = fmt(totalMonths);
    TN.el('age-total-weeks').textContent = fmt(totalWeeks);
    TN.el('age-total-days').textContent = fmt(totalDays);
    TN.el('age-total-hours').textContent = fmt(totalHours);
    TN.el('age-weekday').textContent = weekday || '–';
    TN.el('age-next').textContent = daysUntil === 0 ? 'Today!' : nbStr + ' (in ' + fmt(daysUntil) + ' day' + (daysUntil === 1 ? '' : 's') + ')';
  }
  try {
    var asofEl = TN.el('age-asof');
    if (asofEl && !asofEl.value) {
      var now = new Date();
      var mm = ('0' + (now.getMonth() + 1)).slice(-2);
      var dd = ('0' + now.getDate()).slice(-2);
      asofEl.value = now.getFullYear() + '-' + mm + '-' + dd;
    }
    TN.on('age-dob', 'input', calc);
    TN.on('age-dob', 'change', calc);
    TN.on('age-asof', 'input', calc);
    TN.on('age-asof', 'change', calc);
  } catch (e) { /* never throw on load */ }
})();
