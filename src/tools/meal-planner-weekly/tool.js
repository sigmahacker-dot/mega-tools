/* Weekly Meal Planner — 7-day breakfast/lunch/dinner grid, auto-save, print. */
(function () {
  'use strict';

  var SLUG = 'meal-planner-weekly';
  var KEY = 'tn-' + SLUG + '-plan';
  var MEALS = ['Breakfast', 'Lunch', 'Dinner'];

  function load() {
    try {
      var obj = JSON.parse(localStorage.getItem(KEY) || '{}');
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) { return {}; }
  }

  function persist(plan) {
    try { localStorage.setItem(KEY, JSON.stringify(plan)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function render() {
    var plan = load();
    var tbody = TN.el(SLUG + '-grid').querySelector('tbody');
    tbody.innerHTML = MEALS.map(function (meal) {
      var tds = '';
      for (var d = 0; d < 7; d++) {
        var key = meal + '-' + d;
        tds += '<td style="padding:4px;border-top:1px solid rgba(255,255,255,0.08)">' +
          '<input class="input" data-cell="' + key + '" value="' + TN.esc(plan[key] || '') + '" placeholder="…" style="min-width:0"></td>';
      }
      return '<tr><td style="padding:8px;font-weight:bold">' + meal + '</td>' + tds + '</tr>';
    }).join('');
    if (plan.label) TN.el(SLUG + '-label').value = plan.label;
    var cells = tbody.querySelectorAll('[data-cell]');
    for (var i = 0; i < cells.length; i++) {
      (function (cell) {
        cell.addEventListener('input', function () {
          var p = load();
          p[cell.getAttribute('data-cell')] = cell.value;
          persist(p);
        });
      })(cells[i]);
    }
  }

  function printPlan() {
    TN.clearErr(SLUG + '-error');
    var label = TN.el(SLUG + '-label').value.trim();
    var plan = load();
    if (label) plan.label = label;
    persist(plan);
    var cells = TN.el(SLUG + '-grid').querySelectorAll('[data-cell]');
    var p2 = load();
    for (var i = 0; i < cells.length; i++) p2[cells[i].getAttribute('data-cell')] = cells[i].value;
    persist(p2);
    var w = window.open('', '_blank');
    if (!w) { TN.setErr(SLUG + '-error', 'Popup blocked — allow popups to print.'); return; }
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var rows = MEALS.map(function (meal) {
      var tds = '';
      for (var d = 0; d < 7; d++) tds += '<td>' + escapeHtml(p2[meal + '-' + d] || '') + '</td>';
      return '<tr><th>' + meal + '</th>' + tds + '</tr>';
    }).join('');
    var title = label ? escapeHtml(label) : 'Weekly Meal Plan';
    w.document.write('<!DOCTYPE html><html><head><title>' + title + '</title>' +
      '<style>body{font-family:sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:10px;text-align:left}th{background:#f0f0f0}</style>' +
      '</head><body><h1>' + title + '</h1><table><tr><th>Meal</th>' +
      days.map(function (d) { return '<th>' + d + '</th>'; }).join('') +
      '</tr>' + rows + '</table></body></html>');
    w.document.close();
    w.focus();
    w.print();
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function clearWeek() {
    TN.clearErr(SLUG + '-error');
    if (!window.confirm('Clear the whole week?')) return;
    persist({});
    TN.el(SLUG + '-label').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-grid')) return;
      TN.on(SLUG + '-print', 'click', printPlan);
      TN.on(SLUG + '-clear', 'click', clearWeek);
      TN.el(SLUG + '-label').addEventListener('input', function () {
        var p = load(); p.label = this.value; persist(p);
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();