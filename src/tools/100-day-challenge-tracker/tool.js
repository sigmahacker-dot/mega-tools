/* 100-Day Challenge Tracker — 100-cell grid, streak stats, localStorage. */
(function () {
  'use strict';

  var SLUG = '100-day-challenge-tracker';
  var KEY = 'tn-' + SLUG + '-state';

  function load() {
    try {
      var obj = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (obj && typeof obj === 'object' && Array.isArray(obj.done)) return obj;
    } catch (e) { /* fall through */ }
    return { name: '', start: '', done: [] };
  }

  function persist(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function streaks(doneArr) {
    var set = {};
    doneArr.forEach(function (d) { set[d] = 1; });
    var best = 0, cur = 0, run = 0;
    for (var d = 1; d <= 100; d++) {
      if (set[d]) { run++; if (run > best) best = run; }
      else run = 0;
    }
    // current streak: from highest checked day backwards
    for (d = 100; d >= 1; d--) {
      if (set[d]) cur++; else break;
    }
    return { best: best, cur: cur };
  }

  function render() {
    var state = load();
    var grid = TN.el(SLUG + '-grid');
    grid.innerHTML = '';
    var set = {};
    state.done.forEach(function (d) { set[d] = 1; });
    for (var d = 1; d <= 100; d++) {
      (function (day) {
        var cell = document.createElement('button');
        cell.type = 'button';
        cell.textContent = day;
        cell.style.cssText = 'aspect-ratio:1;border-radius:8px;border:1px solid #444;cursor:pointer;font-size:12px;' +
          (set[day] ? 'background:#4D7C0F;color:#fff;border-color:#4D7C0F' : 'background:#222;color:#aaa');
        cell.addEventListener('click', function () {
          var s = load();
          var i = s.done.indexOf(day);
          if (i === -1) s.done.push(day); else s.done.splice(i, 1);
          persist(s);
          render();
        });
        grid.appendChild(cell);
      })(d);
    }
    var st = streaks(state.done);
    TN.el(SLUG + '-done').textContent = state.done.length + '/100';
    TN.el(SLUG + '-cur').textContent = st.cur;
    TN.el(SLUG + '-best').textContent = st.best;
    TN.el(SLUG + '-pct').textContent = state.done.length + '%';
    if (state.start) {
      var end = new Date(state.start + 'T00:00:00');
      end.setDate(end.getDate() + 99);
      TN.el(SLUG + '-finish').textContent = 'Day 100 lands on ' + end.toISOString().slice(0, 10) + '.';
    } else {
      TN.el(SLUG + '-finish').textContent = '';
    }
    if (state.name) TN.el(SLUG + '-name').value = state.name;
    if (state.start) TN.el(SLUG + '-start').value = state.start;
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-grid')) return;
      TN.el(SLUG + '-name').addEventListener('input', function () {
        var s = load(); s.name = this.value; persist(s);
      });
      TN.el(SLUG + '-start').addEventListener('change', function () {
        var s = load(); s.start = this.value; persist(s); render();
      });
      TN.on(SLUG + '-reset', 'click', function () {
        if (!window.confirm('Reset all 100 days and start over?')) return;
        persist({ name: TN.el(SLUG + '-name').value, start: TN.el(SLUG + '-start').value, done: [] });
        render();
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();