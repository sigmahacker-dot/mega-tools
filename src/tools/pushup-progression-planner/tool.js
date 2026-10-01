/* Push-up progression planner: 6 weeks, 3 sessions/week, 5 sets each. */
(function () {
  'use strict';
  var SLUG = 'pushup-progression-planner';
  function $(id) { return document.getElementById(id); }
  function gen() {
    $(SLUG + '-error').textContent = '';
    var mx = parseInt($(SLUG + '-max').value, 10);
    if (isNaN(mx) || mx < 1 || mx > 500) { $(SLUG + '-error').textContent = 'Enter your current max push-ups (1–500).'; return; }
    var sessions = ['Session 1 — Volume', 'Session 2 — Strength', 'Session 3 — Endurance'];
    var html = '<p><strong>Your 6-week plan</strong> (rest ≥ 1 day between sessions, 2–3 min between sets)</p>';
    html += '<table class="data"><thead><tr><th>Week</th><th>Session</th><th>Sets (reps)</th></tr></thead><tbody>';
    for (var w = 1; w <= 6; w++) {
      var base = Math.round(mx * (1 + (w - 1) * 0.12)); // progressive weekly max estimate
      var s1 = [r(base, 0.5), r(base, 0.6), r(base, 0.5), r(base, 0.6), 'max (' + r(base, 0.7) + '+)'];
      var s2 = [r(base, 0.6), r(base, 0.7), r(base, 0.6), r(base, 0.7), 'max (' + r(base, 0.8) + '+)'];
      var s3 = [r(base, 0.4), r(base, 0.5), r(base, 0.4), r(base, 0.5), 'max effort'];
      var plans = [s1, s2, s3];
      for (var s = 0; s < 3; s++) {
        html += '<tr><td>' + (s === 0 ? 'Week ' + w : '') + '</td><td>' + sessions[s] + '</td><td>' +
          plans[s].join(' · ') + '</td></tr>';
      }
    }
    html += '</tbody></table><p class="hint">Week ' + 6 + ' targets ≈ ' + Math.round(mx * 1.6) + ' max reps. Retest on a rest day after week 6.</p>';
    function r(b, f) { return Math.max(1, Math.round(b * f)); }
    var box = $(SLUG + '-out');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  try { $(SLUG + '-gen').addEventListener('click', gen); } catch (e) { /* never throw on load */ }
})();
