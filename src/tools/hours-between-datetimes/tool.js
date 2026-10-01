/* Hours Between Two Date-Times — exact difference + decimal hours. */
(function () {
  'use strict';
  var SLUG = 'hours-between-datetimes';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  function parseDT(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
    if (isNaN(d.getTime())) return null;
    return d;
  }

  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  function calc() {
    TN.clearErr(SLUG + '-error');
    var a = parseDT($('a').value), b = parseDT($('b').value);
    if (!a || !b) {
      if ($('a').value || $('b').value) TN.setErr(SLUG + '-error', 'Please enter both date-times.');
      $('days').textContent = $('hours').textContent = $('mins').textContent = $('secs').textContent = '—';
      $('out').innerHTML = '';
      return;
    }
    var diff = Math.abs(b.getTime() - a.getTime());
    var totalSec = Math.floor(diff / 1000);
    var days = Math.floor(totalSec / 86400);
    var hours = Math.floor((totalSec % 86400) / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;
    $('days').textContent = days;
    $('hours').textContent = hours;
    $('mins').textContent = mins;
    $('secs').textContent = secs;
    var decH = diff / 3600000;
    var decM = diff / 60000;
    var parts = [];
    if (days) parts.push(plural(days, 'day'));
    if (hours) parts.push(plural(hours, 'hour'));
    if (mins) parts.push(plural(mins, 'minute'));
    if (secs || !parts.length) parts.push(plural(secs, 'second'));
    $('out').innerHTML = '<p><strong>' + parts.join(', ') + '</strong></p>' +
      '<p class="muted">= ' + decH.toFixed(2) + ' decimal hours · ' +
      decM.toFixed(1) + ' minutes · ' + totalSec.toLocaleString('en-US') + ' seconds total</p>';
  }

  try {
    TN.on(SLUG + '-a', 'change', calc);
    TN.on(SLUG + '-b', 'change', calc);
    TN.on(SLUG + '-a', 'input', calc);
    TN.on(SLUG + '-b', 'input', calc);
  } catch (e) { /* never throw on load */ }
})();
