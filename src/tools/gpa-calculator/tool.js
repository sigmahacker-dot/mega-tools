/* GPA Calculator — courses + grades + credits → GPA (4.0 scale, +/- supported). */
(function () {
  'use strict';

  var SLUG = 'gpa-calculator';
  var KEY = 'tn-' + SLUG + '-courses';

  var GRADE_LABELS = { '4.0': 'A', '3.7': 'A-', '3.3': 'B+', '3.0': 'B', '2.7': 'B-', '2.3': 'C+', '2.0': 'C', '1.7': 'C-', '1.3': 'D+', '1.0': 'D', '0.7': 'D-', '0.0': 'F' };

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(courses) {
    try { localStorage.setItem(KEY, JSON.stringify(courses)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function gradeLabel(pts) {
    return GRADE_LABELS[String(pts)] || pts.toFixed(1);
  }

  function render() {
    var courses = load();
    var credits = 0, qp = 0;
    courses.forEach(function (c) { credits += c.credits; qp += c.pts * c.credits; });
    TN.el(SLUG + '-gpa').textContent = credits > 0 ? (qp / credits).toFixed(2) : '—';
    TN.el(SLUG + '-creditsum').textContent = credits;
    TN.el(SLUG + '-qp').textContent = qp.toFixed(1);
    var list = TN.el(SLUG + '-list');
    if (!courses.length) { list.innerHTML = '<p class="muted">No courses yet.</p>'; return; }
    list.innerHTML = courses.map(function (c) {
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>' + TN.esc(c.name) + '</strong> — ' + gradeLabel(c.pts) + ' (' + c.pts.toFixed(1) + ') × ' + c.credits + ' credits' +
        '<button class="btn btn-sm btn-outline" data-del="' + c.id + '" style="float:right">Delete</button></div>';
    }).join('');
    var dels = list.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
          render();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = TN.el(SLUG + '-course').value.trim();
    var pts = parseFloat(TN.el(SLUG + '-grade').value);
    var credits = parseFloat(TN.el(SLUG + '-credits').value);
    if (!name) { TN.setErr(SLUG + '-error', 'Enter a course name.'); return; }
    if (isNaN(credits) || credits <= 0) { TN.setErr(SLUG + '-error', 'Credits must be above 0.'); return; }
    var courses = load();
    courses.push({ id: Date.now(), name: name, pts: pts, credits: credits });
    persist(courses);
    TN.el(SLUG + '-course').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-clear', 'click', function () {
        if (!window.confirm('Delete all courses?')) return;
        persist([]); render();
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();