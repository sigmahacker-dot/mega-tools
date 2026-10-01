/* Wedding Planner — checklist + budget tracker combined, localStorage. */
(function () {
  'use strict';

  var SLUG = 'wedding-planner-lite';
  var KEY = 'tn-' + SLUG + '-data';

  function load() {
    try {
      var obj = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (obj && typeof obj === 'object') {
        return { tasks: Array.isArray(obj.tasks) ? obj.tasks : [], budget: Array.isArray(obj.budget) ? obj.budget : [] };
      }
    } catch (e) { /* fall through */ }
    return { tasks: [], budget: [] };
  }

  function persist(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function money(n) {
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function renderTasks() {
    var data = load();
    var done = data.tasks.filter(function (t) { return t.done; }).length;
    TN.el(SLUG + '-tdone').textContent = done + '/' + data.tasks.length;
    var box = TN.el(SLUG + '-tasks');
    if (!data.tasks.length) { box.innerHTML = '<p class="muted">No tasks yet.</p>'; return; }
    var ordered = data.tasks.slice().sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0); });
    box.innerHTML = ordered.map(function (t) {
      return '<div style="display:flex;align-items:center;gap:8px;margin:6px 0;' + (t.done ? 'opacity:0.6' : '') + '">' +
        '<span style="font-size:20px;cursor:pointer" data-ttoggle="' + t.id + '">' + (t.done ? '✅' : '⬜') + '</span>' +
        '<span style="flex:1;' + (t.done ? 'text-decoration:line-through' : '') + '"><strong>' + TN.esc(t.task) + '</strong>' +
        (t.due ? ' <span class="muted">due ' + TN.esc(t.due) + '</span>' : '') + '</span>' +
        '<button class="btn btn-sm btn-outline" data-tdel="' + t.id + '">×</button></div>';
    }).join('');
    bind(box, 'ttoggle', 'tasks', function (d, id) {
      var t = d.tasks.filter(function (x) { return String(x.id) === id; })[0];
      if (t) t.done = !t.done;
    });
    bindDel(box, 'tdel', 'tasks');
  }

  function renderBudget() {
    var data = load();
    var est = 0, spent = 0;
    data.budget.forEach(function (b) { est += b.est || 0; spent += b.actual || 0; });
    TN.el(SLUG + '-est').textContent = money(est);
    TN.el(SLUG + '-spent').textContent = money(spent);
    TN.el(SLUG + '-left').textContent = money(est - spent);
    var box = TN.el(SLUG + '-items');
    if (!data.budget.length) { box.innerHTML = '<p class="muted">No budget items yet.</p>'; return; }
    box.innerHTML = data.budget.map(function (b) {
      var diff = (b.est || 0) - (b.actual || 0);
      return '<div class="tool-card" style="margin:8px 0"><strong>' + TN.esc(b.item) + '</strong> ' +
        '<span class="muted">est ' + money(b.est || 0) + ' · actual ' + money(b.actual || 0) +
        ' · ' + (diff >= 0 ? 'under by ' : 'over by ') + money(Math.abs(diff)) + '</span>' +
        '<button class="btn btn-sm btn-outline" data-bdel="' + b.id + '" style="float:right">×</button></div>';
    }).join('');
    bindDel(box, 'bdel', 'budget');
  }

  function bind(scope, attr, list, fn) {
    var els = scope.querySelectorAll('[data-' + attr + ']');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        el.addEventListener('click', function () {
          var d = load();
          fn(d, el.getAttribute('data-' + attr));
          persist(d);
          renderTasks(); renderBudget();
        });
      })(els[i]);
    }
  }

  function bindDel(scope, attr, list) {
    var els = scope.querySelectorAll('[data-' + attr + ']');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        el.addEventListener('click', function () {
          var d = load();
          var id = el.getAttribute('data-' + attr);
          d[list] = d[list].filter(function (x) { return String(x.id) !== id; });
          persist(d);
          renderTasks(); renderBudget();
        });
      })(els[i]);
    }
  }

  function addTask() {
    TN.clearErr(SLUG + '-error');
    var task = TN.el(SLUG + '-task').value.trim();
    var due = TN.el(SLUG + '-due').value;
    if (!task) { TN.setErr(SLUG + '-error', 'Enter a task.'); return; }
    var d = load();
    d.tasks.push({ id: Date.now(), task: task, due: due, done: false });
    persist(d);
    TN.el(SLUG + '-task').value = '';
    TN.el(SLUG + '-due').value = '';
    renderTasks();
  }

  function addItem() {
    TN.clearErr(SLUG + '-error');
    var item = TN.el(SLUG + '-item').value.trim();
    var est = parseFloat(TN.el(SLUG + '-ecost').value) || 0;
    var actual = parseFloat(TN.el(SLUG + '-acost').value) || 0;
    if (!item) { TN.setErr(SLUG + '-error', 'Enter a budget item.'); return; }
    var d = load();
    d.budget.push({ id: Date.now(), item: item, est: est, actual: actual });
    persist(d);
    TN.el(SLUG + '-item').value = '';
    TN.el(SLUG + '-ecost').value = '';
    TN.el(SLUG + '-acost').value = '';
    renderBudget();
  }

  function switchTab(budget) {
    TN.el(SLUG + '-check-pane').classList.toggle('hidden', budget);
    TN.el(SLUG + '-budget-pane').classList.toggle('hidden', !budget);
    TN.el(SLUG + '-tab-check').classList.toggle('btn-outline', budget);
    TN.el(SLUG + '-tab-budget').classList.toggle('btn-outline', !budget);
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-addtask')) return;
      TN.on(SLUG + '-addtask', 'click', addTask);
      TN.on(SLUG + '-additem', 'click', addItem);
      TN.on(SLUG + '-tab-check', 'click', function () { switchTab(false); });
      TN.on(SLUG + '-tab-budget', 'click', function () { switchTab(true); });
      TN.on(SLUG + '-export', 'click', function () {
        var d = load();
        if (!d.tasks.length && !d.budget.length) { TN.setErr(SLUG + '-error', 'Nothing to export yet.'); return; }
        TN.downloadText(JSON.stringify(d, null, 2), 'wedding-plan.json', 'application/json');
      });
      renderTasks(); renderBudget();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();