/* Book Tracker — books read log with ratings + yearly count. */
(function () {
  'use strict';

  var SLUG = 'book-tracker';
  var KEY = 'tn-' + SLUG + '-books';
  var rating = 0;

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

  function stars(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
    return s;
  }

  function paintStars() {
    var btns = TN.el(SLUG + '-stars').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var r = parseInt(btns[i].getAttribute('data-r'), 10);
      btns[i].style.color = r <= rating ? '#f1c40f' : '';
    }
  }

  function render() {
    var books = load();
    var year = new Date().getFullYear();
    TN.el(SLUG + '-yearlabel').textContent = 'Books in ' + year;
    TN.el(SLUG + '-year').textContent = books.filter(function (b) {
      return b.date && b.date.slice(0, 4) === String(year);
    }).length;
    TN.el(SLUG + '-total').textContent = books.length;
    var rated = books.filter(function (b) { return b.rating > 0; });
    TN.el(SLUG + '-avg').textContent = rated.length
      ? (rated.reduce(function (a, b) { return a + b.rating; }, 0) / rated.length).toFixed(1) + ' ★'
      : '—';
    var list = TN.el(SLUG + '-list');
    if (!books.length) { list.innerHTML = '<p class="muted">No books logged yet.</p>'; return; }
    list.innerHTML = books.slice().reverse().map(function (b) {
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>' + TN.esc(b.title) + '</strong> <span class="muted">by ' + TN.esc(b.author || 'Unknown') + '</span>' +
        '<p style="margin:4px 0;color:#f1c40f">' + stars(b.rating) + '</p>' +
        '<p class="muted" style="margin:0">Finished: ' + TN.esc(b.date || '—') + '</p>' +
        '<button class="btn btn-sm btn-outline" data-del="' + b.id + '" style="margin-top:6px">Delete</button></div>';
    }).join('');
    var dels = list.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          persist(load().filter(function (x) { return String(x.id) !== btn.getAttribute('data-del'); }));
          render();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var title = TN.el(SLUG + '-title').value.trim();
    var author = TN.el(SLUG + '-author').value.trim();
    var date = TN.el(SLUG + '-date').value;
    if (!title) { TN.setErr(SLUG + '-error', 'Please enter a book title.'); return; }
    var books = load();
    books.push({ id: Date.now(), title: title, author: author, date: date, rating: rating });
    persist(books);
    TN.el(SLUG + '-title').value = '';
    TN.el(SLUG + '-author').value = '';
    rating = 0; paintStars();
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      var btns = TN.el(SLUG + '-stars').querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          b.addEventListener('click', function () {
            rating = parseInt(b.getAttribute('data-r'), 10);
            paintStars();
          });
        })(btns[i]);
      }
      TN.on(SLUG + '-add', 'click', add);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();