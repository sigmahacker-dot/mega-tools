/* ISO 8601 Converter — datetime-local ↔ ISO variants ↔ unix s/ms, both directions. */
(function () {
  'use strict';
  var SLUG = 'iso8601-converter';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function pad(n, l) { n = String(n); while (n.length < (l || 2)) n = '0' + n; return n; }

  function offsetString(d) {
    var off = -d.getTimezoneOffset();
    var sign = off >= 0 ? '+' : '-';
    off = Math.abs(off);
    return sign + pad(Math.floor(off / 60)) + ':' + pad(off % 60);
  }

  function withOffset(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + offsetString(d);
  }

  function toLocalInput(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' +
      pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function row(label, value) {
    return '<tr><td><strong>' + label + '</strong></td><td><code class="code">' + value + '</code></td></tr>';
  }

  function show(d) {
    var ms = d.getTime();
    var t = el(SLUG + '-table');
    t.innerHTML =
      row('ISO 8601 (UTC)', d.toISOString()) +
      row('ISO 8601 (local offset)', withOffset(d)) +
      row('Date only', d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())) +
      row('Unix seconds', Math.floor(ms / 1000)) +
      row('Unix milliseconds', ms) +
      row('Local datetime input', toLocalInput(d));
    TN.show(SLUG + '-result');
  }

  function convert() {
    clear();
    TN.hide(SLUG + '-result');
    var d = null;
    var localV = el(SLUG + '-local').value;
    var isoV = el(SLUG + '-iso').value.trim();
    var tsV = el(SLUG + '-ts').value.trim();
    if (tsV) {
      if (!/^\d+$/.test(tsV)) { fail('Timestamp must be digits only.'); return; }
      var n = parseInt(tsV, 10);
      d = new Date(tsV.length > 10 ? n : n * 1000); // ms vs seconds
    } else if (localV) {
      d = new Date(localV);
    } else if (isoV) {
      d = new Date(isoV);
    } else {
      fail('Enter a datetime, ISO string, or timestamp.');
      return;
    }
    if (isNaN(d.getTime())) { fail('Could not parse that date.'); return; }
    show(d);
  }

  try {
    TN.on(SLUG + '-convert', 'click', convert);
    TN.on(SLUG + '-now', 'click', function () {
      clear();
      show(new Date());
      el(SLUG + '-local').value = '';
      el(SLUG + '-iso').value = '';
      el(SLUG + '-ts').value = '';
    });
  } catch (e) { /* never throw on load */ }
})();
