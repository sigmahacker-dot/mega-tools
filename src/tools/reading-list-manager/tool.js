/* Reading List — to-read / reading / finished with progress %, localStorage. */
(function () {
  'use strict';

  var SLUG = 'reading-list-manager';
  var KEY = 'tn-' + SLUG + '-books';
  var STATUSES = { toread: 'To Read', reading: 'Reading', finished: 'Finished' };

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(books) {
    try { localStorage.setItem(KEY, JSON.stringify(books)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function card(b) {
    var html = '<div class="tool-card" style="margin:8px 0">' +
      '<strong>' + TN.esc(b.title) + '</strong>' +
      (b.author ? '<p class="muted" style="margin:2px 0">' + TN.esc(b.author) + '</p>' : '') +
      '<div class="field" style="margin:6px 0"><label>Progress: <span data-prog-label="' + b.id + '">' + b.progress + '%</span></label>' +
      '<input type="range" min="0" max="100" value="' + b.progress + '" data-prog="' + b.id + '" style="width:100%"></div>' +
      '<div class="btn-row">' +
      '<select class="select" data-status="' + b.id + '" style="max-width:150px">' +
      Object.keys(STATUSES).map(function (k) {
        return '<option value="' + k + '"' + (k === b.status ? ' selected' : '') + '>' + STATUSES[k] + '</option>';
      }).join('') + '</select>' +
      '<button class="btn btn-sm btn-outline" data-del="' + b.id + '">Delete</button>' +
      '</div></div>';
    return html;
  }

  function bind(scope, books) {
    var dels = scope.querySelectorAll('[data-del]');
    var sels = scope.querySelectorAll('[data-status]');
    var progs = scope.querySelectorAll('[data-prog]');
    var i;
    for (i = 0; i < dels.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          persist(load().filter(function (b) { return String(b.id) !== btn.getAttribute('data-del'); }));
          render();
        });
      })(dels[i]);
    }
    for (i = 0; i < sels.length; i++) {
      (function (sel) {
        sel.addEventListener('change', function () {
          var books2 = load();
          var b = books2.filter(function (x) { return String(x.id) === sel.getAttribute('data-status'); })[0];
          if (b) {
            b.status = sel.value;
            if (sel.value === 'finished') b.progress = 100;
            if (sel.value === 'toread') b.progress = 0;
            persist(books2); render();
          }
        });
      })(sels[i]);
    }
    for (i = 0; i < progs.length; i++) {
      (function (rg) {
        rg.addEventListener('input', function () {
          var label = scope.querySelector('[data-prog-label="' + rg.getAttribute('data-prog') + '"]');
          if (label) label.textContent = rg.value + '%';
        });
        rg.addEventListener('change', function () {
          var books2 = load();
          var b = books2.filter(function (x) { return String(x.id) === rg.getAttribute('data-prog'); })[0];
          if (b) { b.progress = parseInt(rg.value, 10); persist(books2); }
        });
      })(progs[i]);
    }
  }

  function render() {
    var books = load();
    ['l1', 'l2', 'l3'].forEach(function (l) { TN.el(SLUG + '-' + l).innerHTML = ''; });
    var lanes = { toread: [], reading: [], finished: [] };
    books.forEach(function (b) { (lanes[b.status] || lanes.toread).push(b); });
    var map = { toread: 'l1', reading: 'l2', finished: 'l3' };
    var cnt = { toread: 'c1', reading: 'c2', finished: 'c3' };
    Object.keys(map).forEach(function (k) {
      var box = TN.el(SLUG + '-' + map[k]);
      TN.el(SLUG + '-' + cnt[k]).textContent = '(' + lanes[k].length + ')';
      if (!lanes[k].length) { box.innerHTML = '<p class="muted">Empty.</p>'; return; }
      box.innerHTML = lanes[k].map(card).join('');
      bind(box);
    });
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var title = TN.el(SLUG + '-title').value.trim();
    var author = TN.el(SLUG + '-author').value.trim();
    var status = TN.el(SLUG + '-status').value;
    if (!title) { TN.setErr(SLUG + '-error', 'Please enter a book title.'); return; }
    var books = load();
    books.push({ id: Date.now(), title: title, author: author, status: status, progress: status === 'finished' ? 100 : 0 });
    persist(books);
    TN.el(SLUG + '-title').value = '';
    TN.el(SLUG + '-author').value = '';
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