/* Business Days Calculator — working days between two dates, custom weekend + holidays. */
(function () {
  'use strict';
  var SLUG = 'business-days-calculator';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function keyOf(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function calc() {
    TN.clearErr(SLUG + '-error');
    var s = parseDate($('start').value), e = parseDate($('end').value);
    if (!s || !e) {
      if ($('start').value || $('end').value) TN.setErr(SLUG + '-error', 'Please enter both a start and an end date.');
      return;
    }
    if (s > e) { TN.setErr(SLUG + '-error', 'Start date must be on or before the end date.'); return; }
    var weekend = $('weekend').value.split(',').map(Number);
    var holSet = {};
    ($('holidays').value || '').split(/\r?\n/).forEach(function (line) {
      var d = parseDate(line.trim());
      if (d) holSet[keyOf(d)] = true;
    });

    var total = 0, weekendDays = 0, holDays = 0, business = 0;
    var holList = [];
    var cur = new Date(s.getTime());
    while (cur <= e) {
      total++;
      var dow = cur.getDay();
      var isWk = weekend.indexOf(dow) !== -1;
      var isHol = !!holSet[keyOf(cur)];
      if (isWk) { weekendDays++; }
      else if (isHol) { holDays++; holList.push(keyOf(cur)); }
      else { business++; }
      cur.setDate(cur.getDate() + 1);
    }

    $('business').textContent = business;
    $('total').textContent = total;
    $('weekend').textContent = weekendDays;
    $('hol').textContent = holDays;
    var pct = total ? Math.round(business / total * 100) : 0;
    var html = '<p><strong>' + business + '</strong> working days out of ' + total +
      ' total days (' + pct + '%).</p>';
    if (holList.length) {
      html += '<p class="muted">Holidays subtracted: ' + holList.join(', ') + '</p>';
    } else if (($('holidays').value || '').trim()) {
      html += '<p class="muted">None of the listed holidays fell on a working day in this range.</p>';
    }
    $('breakdown').innerHTML = html;
  }

  try {
    TN.on(SLUG + '-calc', 'click', calc);
    TN.on(SLUG + '-start', 'change', calc);
    TN.on(SLUG + '-end', 'change', calc);
    TN.on(SLUG + '-weekend', 'change', calc);
  } catch (e) { /* never throw on load */ }
})();
