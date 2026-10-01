/* Daily Journal — dated entries with search, stored in localStorage. */
(function () {
  'use strict';

  var SLUG = 'daily-journal-app';
  var KEY = 'tn-' + SLUG + '-entries';

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function save(entries) {
    try { localStorage.setItem(KEY, JSON.stringify(entries)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function renderList() {
    var list = TN.el(SLUG + '-list');
    if (!list) return;
    var q = (TN.el(SLUG + '-search').value || '').toLowerCase();
    var entries = load().slice().sort(function (a, b) { return b.date < a.date ? -1 : 1; });
    if (q) {
      entries = entries.filter(function (e) {
        return (e.title + ' ' + e.body).toLowerCase().indexOf(q) !== -1;
      });
    }
    if (!entries.length) {
      list.innerHTML = '<p class="muted">No entries yet. Write your first one above.</p>';
    } else {
      list.innerHTML = entries.map(function (e) {
        var preview = e.body.length > 120 ? e.body.slice(0, 120) + '…' : e.body;
        return '<div class="tool-card" style="margin:8px 0;cursor:pointer" data-date="' + TN.esc(e.date) + '">' +
          '<strong>' + TN.esc(e.date) + '</strong> — ' + TN.esc(e.title || '(untitled)') +
          '<p class="muted" style="margin:4px 0 0">' + TN.esc(preview) + '</p></div>';
      }).join('');
      var cards = list.querySelectorAll('[data-date]');
      for (var i = 0; i < cards.length; i++) {
        (function (card) {
          card.addEventListener('click', function () { loadEntry(card.getAttribute('data-date')); });
        })(cards[i]);
      }
    }
    var count = TN.el(SLUG + '-count');
    if (count) count.textContent = load().length + ' entr' + (load().length === 1 ? 'y' : 'ies') + ' saved.';
  }

  function loadEntry(date) {
    var e = load().filter(function (x) { return x.date === date; })[0];
    if (!e) return;
    TN.el(SLUG + '-date').value = e.date;
    TN.el(SLUG + '-title').value = e.title;
    TN.el(SLUG + '-body').value = e.body;
    TN.el(SLUG + '-date').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function saveEntry() {
    TN.clearErr(SLUG + '-error');
    var date = TN.el(SLUG + '-date').value;
    var title = TN.el(SLUG + '-title').value.trim();
    var body = TN.el(SLUG + '-body').value.trim();
    if (!date) { TN.setErr(SLUG + '-error', 'Please pick a date.'); return; }
    if (!body) { TN.setErr(SLUG + '-error', 'The entry is empty — write something first.'); return; }
    var entries = load().filter(function (e) { return e.date !== date; });
    entries.push({ date: date, title: title, body: body });
    save(entries);
    renderList();
    TN.el(SLUG + '-title').value = '';
    TN.el(SLUG + '-body').value = '';
  }

  function deleteEntry() {
    TN.clearErr(SLUG + '-error');
    var date = TN.el(SLUG + '-date').value;
    var entries = load();
    if (!entries.some(function (e) { return e.date === date; })) {
      TN.setErr(SLUG + '-error', 'No entry exists for this date.'); return;
    }
    if (!window.confirm('Delete the entry for ' + date + '?')) return;
    save(entries.filter(function (e) { return e.date !== date; }));
    TN.el(SLUG + '-title').value = '';
    TN.el(SLUG + '-body').value = '';
    renderList();
  }

  function clearForm() {
    TN.clearErr(SLUG + '-error');
    TN.el(SLUG + '-date').value = todayStr();
    TN.el(SLUG + '-title').value = '';
    TN.el(SLUG + '-body').value = '';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-date')) return;
      TN.el(SLUG + '-date').value = todayStr();
      TN.on(SLUG + '-save', 'click', saveEntry);
      TN.on(SLUG + '-delete', 'click', deleteEntry);
      TN.on(SLUG + '-clear', 'click', clearForm);
      TN.el(SLUG + '-search').addEventListener('input', renderList);
      renderList();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();