/* Study Session Planner — distribute total hours across days within a daily limit. */
(function () {
  'use strict';
  var SLUG = 'study-session-planner';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function build() {
    TN.clearErr(SLUG + '-error');
    var total = parseFloat($('total').value);
    var days = parseInt($('days').value, 10);
    var maxDay = parseFloat($('maxday').value);
    if (!(total > 0) || !(days >= 1) || !(maxDay > 0)) {
      TN.setErr(SLUG + '-error', 'Please enter positive numbers: total hours, days (1+), and max hours/day.');
      return;
    }
    days = Math.min(365, Math.floor(days));

    var capacity = days * maxDay;
    var plan = [];
    var remaining = total;
    var shortfall = 0;
    if (capacity >= total) {
      // even split, rounded to 0.5h, last day absorbs rounding
      var even = total / days;
      for (var i = 0; i < days; i++) {
        var h = (i === days - 1) ? remaining : Math.round(even * 2) / 2;
        if (h > remaining) h = remaining;
        plan.push(h);
        remaining = Math.round((remaining - h) * 10) / 10;
      }
    } else {
      for (var j = 0; j < days; j++) plan.push(maxDay);
      shortfall = Math.round((total - capacity) * 10) / 10;
      remaining = 0;
    }

    var evenH = total / days;
    $('perday').textContent = (capacity >= total ? evenH.toFixed(1) : maxDay.toFixed(1)) + 'h';
    $('cap').textContent = capacity.toFixed(1) + 'h';
    var ok = shortfall <= 0;
    $('status').textContent = ok ? '✅ Fits' : '⚠️ Short';
    $('status').style.color = ok ? '#2e7d32' : '#c62828';

    var html = '';
    if (!ok) {
      html += '<p class="note" style="border-left:4px solid #c62828">⚠️ Even at your daily limit you can only fit <strong>' +
        capacity.toFixed(1) + 'h</strong> — <strong>' + shortfall.toFixed(1) +
        'h</strong> short. Raise your daily limit, start earlier, or trim the syllabus.</p>';
    }
    html += '<table class="data" style="width:100%;border-collapse:collapse"><thead><tr>' +
      '<th style="text-align:left;padding:6px;border-bottom:2px solid #ccc">Day</th>' +
      '<th style="text-align:left;padding:6px;border-bottom:2px solid #ccc">Date</th>' +
      '<th style="text-align:right;padding:6px;border-bottom:2px solid #ccc">Study time</th></tr></thead><tbody>';
    var today = new Date();
    var shown = 0;
    for (var k = 0; k < days; k++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + k);
      var ds = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      html += '<tr><td style="padding:6px;border-bottom:1px solid #eee">Day ' + (k + 1) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #eee">' + esc(ds) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #eee;text-align:right"><strong>' + plan[k].toFixed(1) + 'h</strong></td></tr>';
      shown++;
      if (shown >= 60 && days > 60) { // keep very long plans readable
        html += '<tr><td colspan="3" style="padding:6px" class="muted">… and ' + (days - shown) + ' more days at ' + plan[k].toFixed(1) + 'h/day</td></tr>';
        break;
      }
    }
    html += '</tbody></table>';
    var planned = plan.reduce(function (a, b) { return a + b; }, 0);
    html += '<p class="muted">Total planned: ' + planned.toFixed(1) + 'h across ' + days + ' days (exam day excluded).</p>';
    $('table').innerHTML = html;
  }

  try {
    TN.on(SLUG + '-build', 'click', build);
  } catch (e) { /* never throw on load */ }
})();
