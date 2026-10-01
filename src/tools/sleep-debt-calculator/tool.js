/* Sleep debt calculator: 7-day log vs target -> debt + recovery plan. */
(function () {
  'use strict';
  var SLUG = 'sleep-debt-calculator';
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  function $(id) { return document.getElementById(id); }
  function build() {
    var box = $(SLUG + '-days');
    var html = '';
    DAYS.forEach(function (d, i) {
      html += '<div class="field"><label for="' + SLUG + '-d' + i + '">' + d + ' — hours slept</label>' +
        '<input class="input" id="' + SLUG + '-d' + i + '" type="number" min="0" max="24" step="0.5" placeholder="e.g. 7"></div>';
    });
    box.innerHTML = html;
  }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var target = parseFloat($(SLUG + '-target').value);
    if (isNaN(target) || target < 4 || target > 12) { $(SLUG + '-error').textContent = 'Enter a sleep target of 4–12 hours.'; return; }
    var sleeps = [], debt = 0, sum = 0, filled = 0;
    for (var i = 0; i < 7; i++) {
      var v = parseFloat($(SLUG + '-d' + i).value);
      if (!isNaN(v) && v >= 0 && v <= 24) { sleeps.push(v); sum += v; filled++; debt += (target - v); }
      else sleeps.push(null);
    }
    if (!filled) { $(SLUG + '-error').textContent = 'Enter hours slept for at least one day.'; return; }
    debt = Math.round(debt * 10) / 10;
    $(SLUG + '-total').textContent = debt > 0 ? debt + ' h' : debt < 0 ? '+' + Math.abs(debt) + ' h surplus' : '0 h';
    $(SLUG + '-avg').textContent = (Math.round((sum / filled) * 10) / 10) + ' h';
    $(SLUG + '-out').classList.remove('hidden');
    var html = '<table class="data"><thead><tr><th>Day</th><th>Slept</th><th>vs target</th></tr></thead><tbody>';
    DAYS.forEach(function (d, i) {
      var v = sleeps[i];
      var cell = v === null ? '<span class="muted">–</span>' :
        v.toFixed(1) + ' h</td><td>' + (v >= target ? '<span style="color:#2e7d32">+' + (v - target).toFixed(1) + ' h</span>'
          : '<span style="color:#c62828">−' + (target - v).toFixed(1) + ' h</span>');
      html += '<tr><td>' + d + '</td><td>' + cell + '</td></tr>';
    });
    html += '</tbody></table>';
    var box = $(SLUG + '-table');
    box.innerHTML = html;
    box.classList.remove('hidden');
    var plan = $(SLUG + '-plan');
    if (debt <= 0) {
      plan.textContent = '✅ No sleep debt — you are meeting your target. Keep the consistent schedule!';
    } else {
      var nights = Math.ceil(debt / 1);
      plan.textContent = '💤 Recovery plan: sleep 1 extra hour per night for about ' + nights +
        ' night' + (nights === 1 ? '' : 's') + ' (total ' + debt + ' h), keeping a consistent bedtime. Avoid repaying it all in one giant lie-in.';
    }
  }
  try {
    build();
    $(SLUG + '-calc').addEventListener('click', calc);
  } catch (e) { /* never throw on load */ }
})();
