/* Workout Log — exercise/sets/reps/weight entries, history, localStorage. */
(function () {
  'use strict';

  var SLUG = 'workout-log';
  var KEY = 'tn-' + SLUG + '-entries';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(entries) {
    try { localStorage.setItem(KEY, JSON.stringify(entries)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function vol(e) { return e.sets * e.reps * e.weight; }

  function render() {
    var entries = load();
    TN.el(SLUG + '-total').textContent = entries.length;
    TN.el(SLUG + '-vol').textContent = entries.reduce(function (a, e) { return a + vol(e); }, 0).toLocaleString();
    var list = TN.el(SLUG + '-list');
    if (!entries.length) { list.innerHTML = '<p class="muted">No workouts logged yet.</p>'; return; }
    list.innerHTML = entries.slice().reverse().map(function (e) {
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>' + TN.esc(e.ex) + '</strong> <span class="muted">' + TN.esc(e.date) + '</span>' +
        '<p style="margin:4px 0">' + e.sets + '×' + e.reps + ' @ ' + e.weight + ' kg ' +
        '<span class="muted">(vol ' + vol(e).toLocaleString() + ' kg)</span></p>' +
        (e.note ? '<p class="muted" style="margin:0">' + TN.esc(e.note) + '</p>' : '') +
        '<button class="btn btn-sm btn-outline" data-del="' + e.id + '" style="margin-top:6px">Delete</button></div>';
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
    var date = TN.el(SLUG + '-date').value || todayStr();
    var ex = TN.el(SLUG + '-ex').value.trim();
    var sets = parseInt(TN.el(SLUG + '-sets').value, 10);
    var reps = parseInt(TN.el(SLUG + '-reps').value, 10);
    var weight = parseFloat(TN.el(SLUG + '-weight').value);
    var note = TN.el(SLUG + '-note').value.trim();
    if (!ex) { TN.setErr(SLUG + '-error', 'Please enter the exercise name.'); return; }
    if (isNaN(sets) || sets < 1 || isNaN(reps) || reps < 1) { TN.setErr(SLUG + '-error', 'Sets and reps must be at least 1.'); return; }
    if (isNaN(weight) || weight < 0) { TN.setErr(SLUG + '-error', 'Weight must be 0 or more.'); return; }
    var entries = load();
    entries.push({ id: Date.now(), date: date, ex: ex, sets: sets, reps: reps, weight: weight, note: note });
    persist(entries);
    TN.el(SLUG + '-ex').value = '';
    TN.el(SLUG + '-note').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.el(SLUG + '-date').value = todayStr();
      TN.on(SLUG + '-add', 'click', add);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();