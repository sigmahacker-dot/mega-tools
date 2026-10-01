/* Bookmark Manager — title+URL+tags, search/filter, JSON export. */
(function () {
  'use strict';

  var SLUG = 'bookmark-manager';
  var KEY = 'tn-' + SLUG + '-items';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function parseTags(s) {
    return s.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  }

  function renderFilters(items) {
    var sel = TN.el(SLUG + '-filter');
    var tags = {};
    items.forEach(function (it) { (it.tags || []).forEach(function (t) { tags[t] = 1; }); });
    var cur = sel.value;
    sel.innerHTML = '<option value="">All tags</option>' + Object.keys(tags).sort().map(function (t) {
      return '<option value="' + TN.esc(t) + '"' + (t === cur ? ' selected' : '') + '>' + TN.esc(t) + '</option>';
    }).join('');
  }

  function render() {
    var items = load();
    renderFilters(items);
    var q = (TN.el(SLUG + '-search').value || '').toLowerCase();
    var f = TN.el(SLUG + '-filter').value;
    var shown = items.filter(function (it) {
      if (f && (it.tags || []).indexOf(f) === -1) return false;
      if (q && (it.title + ' ' + it.url + ' ' + (it.tags || []).join(' ')).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).reverse();
    var list = TN.el(SLUG + '-list');
    if (!shown.length) {
      list.innerHTML = '<p class="muted">No bookmarks yet.</p>';
    } else {
      list.innerHTML = shown.map(function (it) {
        return '<div class="tool-card" style="margin:8px 0">' +
          '<a href="' + TN.esc(it.url) + '" target="_blank" rel="noopener">' + TN.esc(it.title || it.url) + '</a>' +
          '<p class="muted" style="margin:4px 0">' + TN.esc(it.url) + '</p>' +
          (it.tags && it.tags.length ? '<p style="margin:4px 0">' + it.tags.map(function (t) {
            return '<span class="muted" style="border:1px solid #444;border-radius:10px;padding:2px 8px;margin-right:6px;font-size:12px">' + TN.esc(t) + '</span>';
          }).join('') + '</p>' : '') +
          '<button class="btn btn-sm btn-outline" data-del="' + it.id + '">Delete</button></div>';
      }).join('');
      var dels = list.querySelectorAll('[data-del]');
      for (var i = 0; i < dels.length; i++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            persist(load().filter(function (it) { return String(it.id) !== btn.getAttribute('data-del'); }));
            render();
          });
        })(dels[i]);
      }
    }
    TN.el(SLUG + '-count').textContent = shown.length + ' of ' + items.length + ' bookmarks.';
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var title = TN.el(SLUG + '-title').value.trim();
    var url = TN.el(SLUG + '-url').value.trim();
    var tags = parseTags(TN.el(SLUG + '-tags').value);
    if (!url) { TN.setErr(SLUG + '-error', 'Please enter a URL.'); return; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch (e) { TN.setErr(SLUG + '-error', 'That URL looks invalid.'); return; }
    var items = load();
    items.push({ id: Date.now(), title: title || url, url: url, tags: tags });
    persist(items);
    TN.el(SLUG + '-title').value = '';
    TN.el(SLUG + '-url').value = '';
    TN.el(SLUG + '-tags').value = '';
    render();
  }

  function exportJson() {
    var items = load();
    if (!items.length) { TN.setErr(SLUG + '-error', 'Nothing to export yet.'); return; }
    TN.downloadText(JSON.stringify(items, null, 2), 'bookmarks.json', 'application/json');
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-export', 'click', exportJson);
      TN.el(SLUG + '-search').addEventListener('input', render);
      TN.el(SLUG + '-filter').addEventListener('change', render);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();