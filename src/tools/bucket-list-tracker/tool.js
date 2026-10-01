/* Bucket List Tracker — goals with done toggle + progress %, localStorage. */
(function () {
  'use strict';

  var SLUG = 'bucket-list-tracker';
  var KEY = 'tn-' + SLUG + '-goals';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(goals) {
    try { localStorage.setItem(KEY, JSON.stringify(goals)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function render() {
    var goals = load();
    var done = goals.filter(function (g) { return g.done; }).length;
    var pct = goals.length ? Math.round(done / goals.length * 100) : 0;
    TN.el(SLUG + '-done').textContent = done + '/' + goals.length;
    TN.el(SLUG + '-pct').textContent = pct + '%';
    TN.el(SLUG + '-bar').style.width = pct + '%';
    var list = TN.el(SLUG + '-list');
    if (!goals.length) { list.innerHTML = '<p class="muted">No goals yet — dream big and add your first.</p>'; return; }
    var ordered = goals.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done - b.done;
      return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
    });
    list.innerHTML = ordered.map(function (g) {
      return '<div class="tool-card" style="margin:8px 0;' + (g.done ? 'opacity:0.6' : '') + '">' +
        '<span style="font-size:20px;cursor:pointer" data-toggle="' + g.id + '" title="toggle done">' +
        (g.done ? '✅' : '⬜') + '</span> ' +
        '<strong style="' + (g.done ? 'text-decoration:line-through' : '') + '">' + TN.esc(g.goal) + '</strong> ' +
        '<span class="muted">(' + TN.esc(g.cat) + ')</span> ' +
        '<span data-star="' + g.id + '" style="cursor:pointer;font-size:18px" title="star">' + (g.starred ? '⭐' : '☆') + '</span>' +
        '<button class="btn btn-sm btn-outline" data-del="' + g.id + '" style="float:right">Delete</button></div>';
    }).join('');
    var i, btns;
    btns = list.querySelectorAll('[data-toggle]');
    for (i = 0; i < btns.length; i++) (function (el) {
      el.addEventListener('click', function () {
        var gs = load();
        var g = gs.filter(function (x) { return String(x.id) === el.getAttribute('data-toggle'); })[0];
        if (g) { g.done = !g.done; persist(gs); render(); }
      });
    })(btns[i]);
    btns = list.querySelectorAll('[data-star]');
    for (i = 0; i < btns.length; i++) (function (el) {
      el.addEventListener('click', function () {
        var gs = load();
        var g = gs.filter(function (x) { return String(x.id) === el.getAttribute('data-star'); })[0];
        if (g) { g.starred = !g.starred; persist(gs); render(); }
      });
    })(btns[i]);
    btns = list.querySelectorAll('[data-del]');
    for (i = 0; i < btns.length; i++) (function (b) {
      b.addEventListener('click', function () {
        persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
        render();
      });
    })(btns[i]);
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var goal = TN.el(SLUG + '-goal').value.trim();
    var cat = TN.el(SLUG + '-cat').value;
    if (!goal) { TN.setErr(SLUG + '-error', 'Please describe your goal.'); return; }
    var goals = load();
    goals.push({ id: Date.now(), goal: goal, cat: cat, done: false, starred: false });
    persist(goals);
    TN.el(SLUG + '-goal').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();