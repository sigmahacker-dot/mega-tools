(function () {
  'use strict';
  var P = 'notes-app-';
  function g(id) { return document.getElementById(P + id); }

  var search = g('search'), list = g('list'), titleIn = g('title'), bodyIn = g('body');
  if (!search || !list || !titleIn || !bodyIn) return;

  var KEY = 'tn_notes_app';
  var notes = [];
  var selectedId = null;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) notes = parsed.filter(function (n) {
          return n && typeof n.body === 'string';
        });
      }
    } catch (e) { notes = []; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { /* private mode */ }
  }

  function fmtTime(ts) {
    try {
      return new Date(ts).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return ''; }
  }

  function getSelected() {
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === selectedId) return notes[i];
    }
    return null;
  }

  function renderList() {
    var q = (search.value || '').trim().toLowerCase();
    var html = '';
    var shown = 0;
    // Newest first
    var sorted = notes.slice().sort(function (a, b) { return b.updated - a.updated; });
    for (var i = 0; i < sorted.length; i++) {
      var n = sorted[i];
      var title = (n.title || '').trim();
      if (q && title.toLowerCase().indexOf(q) === -1 && n.body.toLowerCase().indexOf(q) === -1) continue;
      shown++;
      var label = title || '(untitled)';
      var sel = n.id === selectedId ? ' style="background:#eef;"' : '';
      html += '<li' + sel + '><button class="btn btn-outline btn-sm" data-note-id="' + TN.esc(n.id) + '" type="button" style="width:100%;text-align:left;">' +
        TN.esc(label.length > 32 ? label.slice(0, 32) + '...' : label) +
        '<br><span class="muted" style="font-size:.75rem;">' + TN.esc(fmtTime(n.updated)) + '</span></button></li>';
    }
    list.innerHTML = html;
    var empty = g('empty');
    if (empty) empty.style.display = (notes.length === 0) ? '' : (shown === 0 ? '' : 'none');
    if (empty && notes.length > 0 && shown === 0) empty.textContent = 'No notes match your search.';
    else if (empty) empty.textContent = 'No notes yet. Create one to get started.';
  }

  function renderEditor() {
    var n = getSelected();
    var edited = g('edited');
    var del = g('delete');
    if (!n) {
      titleIn.value = '';
      bodyIn.value = '';
      titleIn.disabled = true;
      bodyIn.disabled = true;
      if (del) del.disabled = true;
      if (edited) edited.textContent = '';
      return;
    }
    titleIn.disabled = false;
    bodyIn.disabled = false;
    if (del) del.disabled = false;
    if (titleIn.value !== n.title) titleIn.value = n.title;
    if (bodyIn.value !== n.body) bodyIn.value = n.body;
    if (edited) edited.textContent = 'Last edited: ' + fmtTime(n.updated);
  }

  function newNote() {
    TN.clearErr(P + 'error');
    var n = { id: Date.now() + '-' + Math.floor(Math.random() * 1e6), title: '', body: '', updated: Date.now() };
    notes.push(n);
    selectedId = n.id;
    save();
    renderList();
    renderEditor();
    try { titleIn.focus(); } catch (e) { /* ignore */ }
  }

  function deleteNote() {
    var n = getSelected();
    if (!n) return;
    notes = notes.filter(function (x) { return x.id !== n.id; });
    selectedId = null;
    save();
    renderList();
    renderEditor();
  }

  var saveTimer = null;
  function queueSave() {
    if (saveTimer !== null) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      var n = getSelected();
      if (!n) return;
      var t = titleIn.value.slice(0, 120);
      var b = bodyIn.value;
      if (t === n.title && b === n.body) return;
      n.title = t;
      n.body = b;
      n.updated = Date.now();
      save();
      renderList();
      renderEditor();
    }, 400);
  }

  function exportAll() {
    TN.clearErr(P + 'error');
    if (notes.length === 0) {
      TN.setErr(P + 'error', 'There are no notes to export yet.');
      return;
    }
    var sorted = notes.slice().sort(function (a, b) { return b.updated - a.updated; });
    var parts = [];
    for (var i = 0; i < sorted.length; i++) {
      var n = sorted[i];
      parts.push('=== ' + ((n.title || '').trim() || '(untitled)') + ' ===');
      parts.push('Last edited: ' + fmtTime(n.updated));
      parts.push('');
      parts.push(n.body);
      parts.push('');
    }
    var stamp = new Date().toISOString().slice(0, 10);
    TN.downloadText(parts.join('\n'), 'toolnest-notes-' + stamp + '.txt', 'text/plain');
  }

  list.onclick = function (e) {
    var tgt = e.target;
    var id = null;
    while (tgt && tgt !== list) {
      if (tgt.getAttribute && tgt.getAttribute('data-note-id')) { id = tgt.getAttribute('data-note-id'); break; }
      tgt = tgt.parentNode;
    }
    if (id) {
      selectedId = id;
      renderList();
      renderEditor();
    }
  };

  TN.on(search, 'input', renderList);
  TN.on(titleIn, 'input', queueSave);
  TN.on(bodyIn, 'input', queueSave);
  TN.on(g('new'), 'click', newNote);
  TN.on(g('delete'), 'click', deleteNote);
  TN.on(g('export'), 'click', exportAll);

  load();
  if (notes.length > 0) {
    var sorted0 = notes.slice().sort(function (a, b) { return b.updated - a.updated; });
    selectedId = sorted0[0].id;
  }
  renderList();
  renderEditor();
})();
