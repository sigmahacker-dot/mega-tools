/* Weight loss timeline: deficit -> kg/week (7700 kcal/kg), weeks, date, weekly table. */
(function () {
  'use strict';
  var SLUG = 'weight-loss-timeline-calculator';
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var now = parseFloat($(SLUG + '-now').value);
    var goal = parseFloat($(SLUG + '-goal').value);
    var def = parseFloat($(SLUG + '-deficit').value);
    if (isNaN(now) || now < 20 || now > 400) { $(SLUG + '-error').textContent = 'Enter a valid current weight (20–400 kg).'; return; }
    if (isNaN(goal) || goal < 20 || goal > 400) { $(SLUG + '-error').textContent = 'Enter a valid goal weight (20–400 kg).'; return; }
    if (goal >= now) { $(SLUG + '-error').textContent = 'Goal weight must be below your current weight.'; return; }
    if (isNaN(def) || def < 50 || def > 2000) { $(SLUG + '-error').textContent = 'Enter a daily deficit between 50 and 2000 kcal.'; return; }
    var perWeek = (def * 7) / 7700;
    var toLose = now - goal;
    var weeks = toLose / perWeek;
    var date = new Date();
    date.setDate(date.getDate() + Math.round(weeks * 7));
    $(SLUG + '-rate').textContent = perWeek.toFixed(2);
    $(SLUG + '-weeks').textContent = Math.ceil(weeks);
    $(SLUG + '-date').textContent = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    $(SLUG + '-out').classList.remove('hidden');
    var n = Math.ceil(weeks), w = now, html = '';
    html += '<table class="data"><thead><tr><th>Week</th><th>Projected weight (kg)</th><th>Lost so far (kg)</th></tr></thead><tbody>';
    var rows = Math.min(n, 104);
    for (var i = 1; i <= rows; i++) {
      w = Math.max(goal, w - perWeek);
      html += '<tr><td>' + i + '</td><td>' + w.toFixed(1) + '</td><td>' + (now - w).toFixed(1) + '</td></tr>';
    }
    if (n > rows) html += '<tr><td colspan="3" class="muted">…table truncated at 104 weeks…</td></tr>';
    html += '</tbody></table>';
    if (perWeek > 1) html = '<p class="hint">⚠️ This rate exceeds 1 kg/week — consider a smaller deficit or professional guidance.</p>' + html;
    var box = $(SLUG + '-table');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
