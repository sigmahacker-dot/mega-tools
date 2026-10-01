/* Baby growth tracker: log date/weight/height; table + rough typical-range note. */
(function () {
  'use strict';
  var SLUG = 'baby-growth-tracker';
  var KEY = SLUG + '-data';
  var DOBK = SLUG + '-dob';
  // rough median weight (kg) by age in months (approx WHO medians)
  var MED = [[0, 3.3], [1, 4.5], [2, 5.6], [3, 6.4], [4, 7.0], [6, 7.9], [9, 8.9], [12, 9.6], [18, 10.9], [24, 12.2]];
  function $(id) { return document.getElementById(id); }
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(d) ? d : []; }
    catch (e) { return []; }
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function err(m) { $(SLUG + '-error').textContent = m; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function medianAt(months) {
    if (months <= 0) return MED[0][1];
    for (var i = 1; i < MED.length; i++) {
      if (months <= MED[i][0]) {
        var a = MED[i - 1], b = MED[i];
        return a[1] + (b[1] - a[1]) * ((months - a[0]) / (b[0] - a[0]));
      }
    }
    return MED[MED.length - 1][1];
  }
  function ageMonths(dob, at) {
    return (at - dob) / 86400000 / 30.4375;
  }
  function render() {
    var dob = $(SLUG + '-dob').value;
    var rows = load().slice().sort(function (a, b) { return a.at - b.at; });
    var box = $(SLUG + '-list');
    if (!rows.length) { box.innerHTML = '<p class="muted">No measurements yet.</p>'; $(SLUG + '-note').textContent = ''; return; }
    var html = '<table class="data"><thead><tr><th>Date</th><th>Age</th><th>Weight</th><th>Height</th><th></th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var age = dob ? ageMonths(new Date(dob + 'T00:00:00'), new Date(r.at)).toFixed(1) + ' mo' : '–';
      html += '<tr><td>' + new Date(r.at).toLocaleDateString() + '</td><td>' + age + '</td><td>' + r.w +
        ' kg</td><td>' + r.h + ' cm</td><td><button class="btn btn-outline" data-del="' + r.at + '" style="padding:4px 10px">Delete</button></td></tr>';
    });
    html += '</tbody></table>';
    box.innerHTML = html;
    box.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var at = parseFloat(b.getAttribute('data-del'));
        save(load().filter(function (r) { return r.at !== at; }));
        render();
      });
    });
    // growth note vs rough medians
    var note = $(SLUG + '-note');
    if (dob && rows.length) {
      var last = rows[rows.length - 1];
      var m = ageMonths(new Date(dob + 'T00:00:00'), new Date(last.at));
      if (m >= 0 && m <= 24) {
        var med = medianAt(m);
        var ratio = last.w / med;
        note.textContent = 'Rough guide: at ~' + m.toFixed(1) + ' months a typical median weight is ~' + med.toFixed(1) +
          ' kg; your entry is ' + Math.round(ratio * 100) + '% of that. ' +
          (ratio >= 0.8 && ratio <= 1.25
            ? 'Within a broadly typical band — but only proper percentile charts (your pediatrician) can judge growth.'
            : 'Outside the broad typical band — worth mentioning to your pediatrician at the next visit.');
      } else note.textContent = '';
    } else note.textContent = '';
  }
  function add() {
    err('');
    var dob = $(SLUG + '-dob').value;
    var dv = $(SLUG + '-date').value;
    var w = parseFloat($(SLUG + '-weight').value);
    var h = parseFloat($(SLUG + '-height').value);
    if (dob) { try { localStorage.setItem(DOBK, dob); } catch (e) {} }
    if (!dv) { err('Enter the measurement date.'); return; }
    var at = new Date(dv + 'T00:00:00').getTime();
    if (dob && at < new Date(dob + 'T00:00:00').getTime()) { err('Measurement date cannot be before birth.'); return; }
    if (isNaN(w) || w < 0.5 || w > 40) { err('Enter a valid weight (0.5–40 kg).'); return; }
    if (isNaN(h) || h < 20 || h > 150) { err('Enter a valid height (20–150 cm).'); return; }
    var rows = load();
    rows.push({ at: at, w: Math.round(w * 100) / 100, h: Math.round(h * 10) / 10 });
    save(rows);
    $(SLUG + '-weight').value = '';
    $(SLUG + '-height').value = '';
    render();
  }
  try {
    var savedDob = null;
    try { savedDob = localStorage.getItem(DOBK); } catch (e) {}
    if (savedDob) $(SLUG + '-dob').value = savedDob;
    $(SLUG + '-add').addEventListener('click', add);
    $(SLUG + '-dob').addEventListener('change', render);
    render();
  } catch (e) { /* never throw on load */ }
})();
