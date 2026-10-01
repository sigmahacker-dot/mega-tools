/* Attendance Tracker — roster + present/absent per date, % summary. */
(function () {
  'use strict';

  var SLUG = 'attendance-tracker';
  var KEY = 'tn-' + SLUG + '-data';

  function load() {
    try {
      var obj = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (obj && typeof obj === 'object') {
        return { students: Array.isArray(obj.students) ? obj.students : [], marks: (obj.marks && typeof obj.marks === 'object') ? obj.marks : {} };
      }
    } catch (e) { /* fall through */ }
    return { students: [], marks: {} };
  }

  function persist(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function curDate() { return TN.el(SLUG + '-date').value || todayStr(); }

  function render() {
    var data = load();
    var date = curDate();
    TN.el(SLUG + '-datelabel').textContent = date;
    var roster = TN.el(SLUG + '-roster');
    if (!data.students.length) {
      roster.innerHTML = '<p class="muted">Add students to the roster first.</p>';
    } else {
      roster.innerHTML = data.students.map(function (s, i) {
        var m = (data.marks[date] || {})[i];
        return '<div style="display:flex;align-items:center;gap:8px;margin:6px 0">' +
          '<span style="flex:1"><strong>' + TN.esc(s) + '</strong></span>' +
          '<button class="btn btn-sm ' + (m === 'P' ? '' : 'btn-outline') + '" data-mark="' + i + '|P">Present</button>' +
          '<button class="btn btn-sm ' + (m === 'A' ? '' : 'btn-outline') + '" data-mark="' + i + '|A">Absent</button>' +
          '<button class="btn btn-sm btn-outline" data-del="' + i + '">×</button></div>';
      }).join('');
      var mbtns = roster.querySelectorAll('[data-mark]');
      for (var i = 0; i < mbtns.length; i++) {
        (function (b) {
          b.addEventListener('click', function () {
            var parts = b.getAttribute('data-mark').split('|');
            var d = load();
            if (!d.marks[date]) d.marks[date] = {};
            d.marks[date][parts[0]] = parts[1];
            persist(d); render();
          });
        })(mbtns[i]);
      }
      var dels = roster.querySelectorAll('[data-del]');
      for (i = 0; i < dels.length; i++) {
        (function (b) {
          b.addEventListener('click', function () {
            var idx = parseInt(b.getAttribute('data-del'), 10);
            var d = load();
            d.students.splice(idx, 1);
            // reindex marks
            Object.keys(d.marks).forEach(function (dt) {
              var nm = {};
              Object.keys(d.marks[dt]).forEach(function (k) {
                var ki = parseInt(k, 10);
                if (ki < idx) nm[ki] = d.marks[dt][k];
                else if (ki > idx) nm[ki - 1] = d.marks[dt][k];
              });
              d.marks[dt] = nm;
            });
            persist(d); render();
          });
        })(dels[i]);
      }
    }
    // summary
    var dates = Object.keys(data.marks).sort();
    var sum = TN.el(SLUG + '-summary');
    if (!data.students.length || !dates.length) {
      sum.innerHTML = '<p class="muted">No attendance recorded yet.</p>';
      return;
    }
    var rows = data.students.map(function (s, i) {
      var p = 0, t = 0;
      dates.forEach(function (dt) {
        var m = (data.marks[dt] || {})[i];
        if (m === 'P') { p++; t++; }
        else if (m === 'A') { t++; }
      });
      var pct = t ? Math.round(p / t * 100) : 0;
      return '<tr><td style="padding:6px;border-top:1px solid rgba(255,255,255,0.08)">' + TN.esc(s) + '</td>' +
        '<td style="padding:6px;border-top:1px solid rgba(255,255,255,0.08)">' + p + '/' + t + '</td>' +
        '<td style="padding:6px;border-top:1px solid rgba(255,255,255,0.08)">' + pct + '%</td></tr>';
    }).join('');
    sum.innerHTML = '<table style="width:100%;border-collapse:collapse">' +
      '<tr><th style="text-align:left;padding:6px">Student</th><th style="text-align:left;padding:6px">Present</th><th style="text-align:left;padding:6px">%</th></tr>' +
      rows + '</table><p class="muted">' + dates.length + ' day(s) recorded.</p>';
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = TN.el(SLUG + '-name').value.trim();
    if (!name) { TN.setErr(SLUG + '-error', 'Enter a student name.'); return; }
    var data = load();
    data.students.push(name);
    persist(data);
    TN.el(SLUG + '-name').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.el(SLUG + '-date').value = todayStr();
      TN.on(SLUG + '-add', 'click', add);
      TN.el(SLUG + '-date').addEventListener('change', render);
      TN.on(SLUG + '-markall', 'click', function () {
        var d = load();
        var date = curDate();
        if (!d.marks[date]) d.marks[date] = {};
        d.students.forEach(function (_, i) { d.marks[date][i] = 'P'; });
        persist(d); render();
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();