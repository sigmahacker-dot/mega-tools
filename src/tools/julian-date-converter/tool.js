/* Julian Date Converter — Gregorian date ↔ Julian Day Number (standard algorithms). */
(function () {
  'use strict';
  var SLUG = 'julian-date-converter';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return { y: +m[1], m: +m[2], d: +m[3] };
  }

  /* Gregorian → JDN (integer math, Fliegel–Van Flandern). */
  function toJDN(y, m, d) {
    var a = Math.floor((14 - m) / 12);
    var yy = y + 4800 - a;
    var mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
      Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  /* JDN → Gregorian (integer math, Fliegel–Van Flandern). */
  function fromJDN(j) {
    var a = j + 32044;
    var b = Math.floor((4 * a + 3) / 146097);
    var c = a - Math.floor(146097 * b / 4);
    var d = Math.floor((4 * c + 3) / 1461);
    var e = c - Math.floor(1461 * d / 4);
    var m = Math.floor((5 * e + 2) / 153);
    var day = e - Math.floor((153 * m + 2) / 5) + 1;
    var month = m + 3 - 12 * Math.floor(m / 10);
    var year = 100 * b + d - 4800 + Math.floor(m / 10);
    return { y: year, m: month, d: day };
  }

  function toJdnGo() {
    TN.clearErr(SLUG + '-error');
    var p = parseDate($('date').value);
    if (!p) { TN.setErr(SLUG + '-error', 'Please pick a valid calendar date.'); return; }
    var jdn = toJDN(p.y, p.m, p.d);
    var weekday = new Date(p.y, p.m - 1, p.d).toLocaleDateString(undefined, { weekday: 'long' });
    $('tojdnout').innerHTML = '<p>Julian Day Number: <strong class="code">' + jdn.toLocaleString('en-US') + '</strong></p>' +
      '<p class="muted">' + weekday + ' — day ' + jdn.toLocaleString('en-US') + ' of the continuous count starting Jan 1, 4713 BC.</p>';
  }

  function toDateGo() {
    TN.clearErr(SLUG + '-error');
    var raw = ($('jdn').value || '').trim();
    if (!/^\d+$/.test(raw)) { TN.setErr(SLUG + '-error', 'Please enter a whole Julian Day Number (digits only).'); return; }
    var j = parseInt(raw, 10);
    var g = fromJDN(j);
    if (g.y < 1 || g.y > 9999) { TN.setErr(SLUG + '-error', 'That JDN maps outside the supported year range (1–9999).'); return; }
    var d = new Date(g.y, g.m - 1, g.d);
    var ds = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var iso = g.y + '-' + ('0' + g.m).slice(-2) + '-' + ('0' + g.d).slice(-2);
    $('todateout').innerHTML = '<p><strong>' + ds + '</strong> <span class="code">' + iso + '</span></p>' +
      '<p class="muted">Gregorian (proleptic) calendar date for JDN ' + j.toLocaleString('en-US') + '.</p>';
  }

  try {
    TN.on(SLUG + '-tojdn', 'click', toJdnGo);
    TN.on(SLUG + '-todate', 'click', toDateGo);
  } catch (e) { /* never throw on load */ }
})();
