/* Checklist App — persistent tasks, progress bar, clear completed. */
(function () {
  'use strict';
  var SLUG = 'checklist-app';
  var ERR = SLUG + '-error';
  var KEY = 'checklist-app-items';
  var items = []; // {text, done}

  function $(id) { return document.getElementById(id); }

  function load() {
    try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { items = []; }
    if (!Array.isArray(items)) items = [];
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
  }

  function render() {
    var ul = $('checklist-app-list');
    ul.innerHTML = '';
    var done = 0;
    items.forEach(function (it, i) {
      if (it.done) done++;
      var li = document.createElement('li');
      li.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #ddd;border-radius:8px;margin-bottom:8px;background:' + (it.done ? '#f1f8e9' : '#fff');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!it.done;
      cb.style.cssText = 'width:20px;height:20px;cursor:pointer';
      cb.setAttribute('aria-label', 'Done: ' + it.text);
      cb.addEventListener('change', function () { items[i].done = cb.checked; save(); render(); });
      var sp = document.createElement('span');
      sp.style.cssText = 'flex:1;' + (it.done ? 'text-decoration:line-through;color:#888' : '');
      sp.textContent = it.text;
      var del = document.createElement('button');
      del.className = 'btn btn-sm btn-outline';
      del.textContent = '✕';
      del.title = 'Delete';
      del.addEventListener('click', function () { items.splice(i, 1); save(); render(); });
      li.appendChild(cb); li.appendChild(sp); li.appendChild(del);
      ul.appendChild(li);
    });
    var total = items.length;
    var pct = total ? Math.round(done / total * 100) : 0;
    $('checklist-app-bar').style.width = pct + '%';
    $('checklist-app-counts').textContent = total
      ? done + ' of ' + total + ' done (' + pct + '%)'
      : 'Your list is empty — add a task above.';
  }

  function add() {
    var v = $('checklist-app-input').value.trim();
    if (!v) { TN.setErr(ERR, 'Type a task first.'); return; }
    TN.clearErr(ERR);
    items.push({ text: v, done: false });
    $('checklist-app-input').value = '';
    save(); render();
    $('checklist-app-input').focus();
  }

  try {
    load();
    render();
    TN.on('checklist-app-add', 'click', add);
    TN.on('checklist-app-input', 'keydown', function (e) { if (e.key === 'Enter') add(); });
    TN.on('checklist-app-clear', 'click', function () {
      items = items.filter(function (it) { return !it.done; });
      save(); render();
    });
    TN.on('checklist-app-clearall', 'click', function () {
      items = [];
      save(); render();
    });
  } catch (e) { /* never throw on load */ }
})();
