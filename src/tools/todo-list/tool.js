(function () {
  'use strict';
  var P = 'todo-list-';
  function g(id) { return document.getElementById(P + id); }

  var input = g('input'), addBtn = g('add');
  if (!input || !addBtn) return;

  var KEY = 'tn_todo_list';
  var tasks = [];
  var filter = 'all'; // all | active | done

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) tasks = parsed.filter(function (t) {
          return t && typeof t.text === 'string';
        });
      }
    } catch (e) { tasks = []; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) { /* private mode */ }
  }

  function addTask() {
    TN.clearErr(P + 'error');
    var text = (input.value || '').trim();
    if (!text) {
      TN.setErr(P + 'error', 'Please type a task before adding it.');
      return;
    }
    if (text.length > 200) {
      TN.setErr(P + 'error', 'Please keep tasks under 200 characters.');
      return;
    }
    tasks.push({ id: Date.now() + '-' + Math.floor(Math.random() * 1e6), text: text, done: false });
    input.value = '';
    save();
    render();
    try { input.focus(); } catch (e) { /* ignore */ }
  }

  function removeTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    save();
    render();
  }

  function toggleTask(id) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) { tasks[i].done = !tasks[i].done; break; }
    }
    save();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(function (t) { return !t.done; });
    save();
    render();
  }

  function setFilter(f) {
    filter = f;
    render();
  }

  function render() {
    var list = g('items'), empty = g('empty'), count = g('count');
    if (!list) return;
    var visible = tasks.filter(function (t) {
      if (filter === 'active') return !t.done;
      if (filter === 'done') return t.done;
      return true;
    });
    var html = '';
    for (var i = 0; i < visible.length; i++) {
      (function (t) {
        html += '<li><label class="checkbox-row">' +
          '<input type="checkbox" data-todo-toggle="' + TN.esc(t.id) + '"' + (t.done ? ' checked' : '') + '> ' +
          '<span' + (t.done ? ' style="text-decoration:line-through;opacity:.6;"' : '') + '>' + TN.esc(t.text) + '</span></label> ' +
          '<button class="btn btn-danger btn-sm" data-todo-del="' + TN.esc(t.id) + '" type="button">Delete</button></li>';
      })(visible[i]);
    }
    list.innerHTML = html;

    // Bind via delegation
    list.onclick = function (e) {
      var tgt = e.target;
      var tog = tgt.getAttribute && tgt.getAttribute('data-todo-toggle');
      var del = tgt.getAttribute && tgt.getAttribute('data-todo-del');
      if (tog) toggleTask(tog);
      else if (del) removeTask(del);
    };

    if (empty) empty.style.display = tasks.length ? 'none' : '';
    if (count) {
      var active = tasks.filter(function (t) { return !t.done; }).length;
      count.textContent = '(' + active + ' active, ' + tasks.length + ' total)';
    }
    var filters = [['filter-all', 'all'], ['filter-active', 'active'], ['filter-done', 'done']];
    for (var k = 0; k < filters.length; k++) {
      var b = g(filters[k][0]);
      if (b) {
        if (filters[k][1] === filter) b.classList.add('btn-primary');
        else b.classList.remove('btn-primary');
      }
    }
  }

  TN.on(addBtn, 'click', addTask);
  TN.on(input, 'keydown', function (e) { if (e.key === 'Enter') addTask(); });
  TN.on(g('clear'), 'click', clearCompleted);
  TN.on(g('filter-all'), 'click', function () { setFilter('all'); });
  TN.on(g('filter-active'), 'click', function () { setFilter('active'); });
  TN.on(g('filter-done'), 'click', function () { setFilter('done'); });

  load();
  render();
})();
