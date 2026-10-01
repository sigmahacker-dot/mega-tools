/* Standing desk ratio calculator: work hours + ratio -> alternating schedule table. */
(function () {
  'use strict';
  var SLUG = 'standing-desk-ratio-calculator';
  function $(id) { return document.getElementById(id); }
  var BLOCKS = { '3:1': [45, 15], '2:1': [40, 20], '1:1': [30, 30], '1:2': [20, 40] };
  function fmtTime(mins) {
    var h = Math.floor(mins / 60) % 24, m = mins % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function fmtDur(mins) {
    var h = Math.floor(mins / 60), m = Math.round(mins % 60);
    return (h ? h + 'h ' : '') + m + 'm';
  }
  function build() {
    $(SLUG + '-error').textContent = '';
    var hours = parseFloat($(SLUG + '-hours').value);
    var ratio = $(SLUG + '-ratio').value;
    var startV = $(SLUG + '-start').value;
    if (isNaN(hours) || hours < 1 || hours > 16) { $(SLUG + '-error').textContent = 'Enter work hours between 1 and 16.'; return; }
    if (!startV) { $(SLUG + '-error').textContent = 'Pick a start time.'; return; }
    var blk = BLOCKS[ratio];
    var sitB = blk[0], standB = blk[1];
    var totalMin = Math.round(hours * 60);
    var sp = startV.split(':');
    var t = parseInt(sp[0], 10) * 60 + parseInt(sp[1], 10);
    var html = '<table class="data"><thead><tr><th>#</th><th>Time</th><th>Posture</th></tr></thead><tbody>';
    var n = 0, sitT = 0, standT = 0;
    while (totalMin > 0) {
      n++;
      var isSit = (n % 2 === 1);
      var want = isSit ? sitB : standB;
      var use = Math.min(want, totalMin);
      html += '<tr><td>' + n + '</td><td>' + fmtTime(t) + ' – ' + fmtTime(t + use) + '</td><td>' +
        (isSit ? '🪑 Sit' : '🧍 Stand') + ' (' + use + ' min)</td></tr>';
      if (isSit) sitT += use; else standT += use;
      t += use; totalMin -= use;
    }
    html += '</tbody></table>';
    $(SLUG + '-sit').textContent = fmtDur(sitT);
    $(SLUG + '-stand').textContent = fmtDur(standT);
    $(SLUG + '-out').classList.remove('hidden');
    var box = $(SLUG + '-table');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  try {
    $(SLUG + '-build').addEventListener('click', build);
    build();
  } catch (e) { /* never throw on load */ }
})();
