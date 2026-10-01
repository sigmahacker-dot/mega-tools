/* Workout volume calculator: dynamic rows -> volume per exercise + total + share. */
(function () {
  'use strict';
  var SLUG = 'workout-volume-calculator';
  function $(id) { return document.getElementById(id); }
  var n = 0;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function addRow() {
    n++;
    var box = $(SLUG + '-rows');
    var div = document.createElement('div');
    div.className = 'grid2';
    div.id = SLUG + '-row' + n;
    div.style.cssText = 'border:1px solid #ddd;border-radius:8px;padding:10px;margin-bottom:8px;grid-template-columns:2fr 1fr 1fr 1fr auto';
    div.innerHTML =
      '<div class="field"><label>Exercise</label><input class="input" data-f="name" type="text" placeholder="e.g. Bench press"></div>' +
      '<div class="field"><label>Sets</label><input class="input" data-f="sets" type="number" min="1" value="3"></div>' +
      '<div class="field"><label>Reps</label><input class="input" data-f="reps" type="number" min="1" value="8"></div>' +
      '<div class="field"><label>Weight (kg)</label><input class="input" data-f="wt" type="number" min="0" step="0.5" value="60"></div>' +
      '<div class="field" style="align-self:end"><button class="btn btn-outline" data-rm>✕</button></div>';
    box.appendChild(div);
    div.querySelector('[data-rm]').addEventListener('click', function () {
      box.removeChild(div);
    });
  }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var rows = $(SLUG + '-rows').children;
    if (!rows.length) { $(SLUG + '-error').textContent = 'Add at least one exercise.'; return; }
    var items = [], total = 0, bad = 0;
    for (var i = 0; i < rows.length; i++) {
      var q = function (f) { return rows[i].querySelector('[data-f="' + f + '"]').value; };
      var name = q('name').trim() || ('Exercise ' + (i + 1));
      var sets = parseFloat(q('sets')), reps = parseFloat(q('reps')), wt = parseFloat(q('wt'));
      if (isNaN(sets) || sets < 1 || isNaN(reps) || reps < 1 || isNaN(wt) || wt < 0) { bad++; continue; }
      var vol = sets * reps * wt;
      items.push({ name: name, vol: vol, sets: sets, reps: reps, wt: wt });
      total += vol;
    }
    if (bad) { $(SLUG + '-error').textContent = bad + ' row(s) had invalid numbers and were skipped.'; }
    if (!items.length) { $(SLUG + '-error').textContent = 'No valid rows to calculate.'; return; }
    $(SLUG + '-total').textContent = Math.round(total).toLocaleString() + ' kg';
    $(SLUG + '-ex').textContent = items.length;
    $(SLUG + '-out').classList.remove('hidden');
    var html = '<table class="data"><thead><tr><th>Exercise</th><th>Sets×Reps×kg</th><th>Volume</th><th>Share</th></tr></thead><tbody>';
    items.forEach(function (it) {
      html += '<tr><td>' + esc(it.name) + '</td><td>' + it.sets + '×' + it.reps + '×' + it.wt +
        '</td><td>' + Math.round(it.vol).toLocaleString() + ' kg</td><td>' + Math.round(it.vol / total * 100) + '%</td></tr>';
    });
    html += '</tbody></table>';
    var box = $(SLUG + '-table');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  try {
    $(SLUG + '-add').addEventListener('click', addRow);
    $(SLUG + '-calc').addEventListener('click', calc);
    addRow(); addRow();
  } catch (e) { /* never throw on load */ }
})();
