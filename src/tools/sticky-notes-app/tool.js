/* Sticky Notes App — persistent colored notes, inline editing. */
(function () {
  'use strict';
  var SLUG = 'sticky-notes-app';
  var KEY = 'sticky-notes-app-items';
  var COLORS = ['#fff59d', '#f8bbd0', '#c8e6c9', '#bbdefb', '#e1bee7', '#ffe0b2'];
  var notes = []; // {id, text, color}

  function $(id) { return document.getElementById(id); }

  function load() {
    try { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { notes = []; }
    if (!Array.isArray(notes)) notes = [];
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {}
  }
  function uid() { return 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

  function render() {
    var board = $('sticky-notes-app-board');
    board.innerHTML = '';
    $('sticky-notes-app-empty').style.display = notes.length ? 'none' : '';
    notes.forEach(function (n) {
      var card = document.createElement('div');
      card.style.cssText = 'background:' + n.color + ';border-radius:4px 4px 12px 4px;padding:10px;box-shadow:0 3px 8px rgba(0,0,0,.15);display:flex;flex-direction:column;min-height:150px';
      var top = document.createElement('div');
      top.style.cssText = 'display:flex;justify-content:flex-end;gap:4px;margin-bottom:4px';
      COLORS.forEach(function (c) {
        var dot = document.createElement('button');
        dot.title = 'Color';
        dot.style.cssText = 'width:16px;height:16px;border-radius:50%;border:' + (c === n.color ? '2px solid #333' : '1px solid #999') + ';background:' + c + ';cursor:pointer;padding:0';
        dot.addEventListener('click', function () { n.color = c; save(); render(); });
        top.appendChild(dot);
      });
      var del = document.createElement('button');
      del.textContent = '✕';
      del.title = 'Delete note';
      del.style.cssText = 'width:16px;height:16px;border:none;background:none;cursor:pointer;font-size:12px;color:#666;padding:0';
      del.addEventListener('click', function () {
        notes = notes.filter(function (x) { return x.id !== n.id; });
        save(); render();
      });
      top.appendChild(del);
      var ta = document.createElement('textarea');
      ta.value = n.text;
      ta.placeholder = 'Write something…';
      ta.rows = 5;
      ta.style.cssText = 'flex:1;background:transparent;border:none;resize:none;font-family:inherit;font-size:14px;line-height:1.4;outline:none';
      ta.setAttribute('aria-label', 'Note text');
      var saveT = null;
      ta.addEventListener('input', function () {
        n.text = ta.value;
        if (saveT) clearTimeout(saveT);
        saveT = setTimeout(save, 400);
      });
      card.appendChild(top);
      card.appendChild(ta);
      board.appendChild(card);
    });
  }

  function addNote() {
    notes.unshift({ id: uid(), text: '', color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    save(); render();
    var first = $('sticky-notes-app-board').querySelector('textarea');
    if (first) first.focus();
  }

  try {
    load();
    render();
    TN.on('sticky-notes-app-add', 'click', addNote);
  } catch (e) { /* never throw on load */ }
})();
