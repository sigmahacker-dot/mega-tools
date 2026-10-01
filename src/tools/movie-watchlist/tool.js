/* Movie Watchlist — personal ratings, watched toggle, localStorage. */
(function () {
  'use strict';

  var SLUG = 'movie-watchlist';
  var KEY = 'tn-' + SLUG + '-movies';
  var rating = 0;
  var filter = 'all';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(movies) {
    try { localStorage.setItem(KEY, JSON.stringify(movies)); }
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
    var movies = load();
    var rated = movies.filter(function (m) { return m.rating > 0; });
    TN.el(SLUG + '-avg').textContent = rated.length
      ? (rated.reduce(function (a, m) { return a + m.rating; }, 0) / rated.length).toFixed(1) + ' ★'
      : '—';
    TN.el(SLUG + '-count').textContent = movies.length;
    var shown = movies.filter(function (m) {
      if (filter === 'towatch') return !m.watched;
      if (filter === 'watched') return m.watched;
      return true;
    }).slice().reverse();
    var list = TN.el(SLUG + '-list');
    if (!shown.length) { list.innerHTML = '<p class="muted">Nothing here yet.</p>'; return; }
    list.innerHTML = shown.map(function (m) {
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>' + TN.esc(m.title) + '</strong>' +
        (m.year ? ' <span class="muted">(' + m.year + ')</span>' : '') +
        '<p style="margin:4px 0;color:#f1c40f">' + stars(m.rating) + '</p>' +
        '<div class="btn-row">' +
        '<button class="btn btn-sm ' + (m.watched ? '' : 'btn-outline') + '" data-watch="' + m.id + '">' +
        (m.watched ? '✓ Watched' : 'Mark watched') + '</button>' +
        '<button class="btn btn-sm btn-outline" data-del="' + m.id + '">Delete</button>' +
        '</div></div>';
    }).join('');
    var i;
    var wbtns = list.querySelectorAll('[data-watch]');
    for (i = 0; i < wbtns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          var ms = load();
          var m = ms.filter(function (x) { return String(x.id) === b.getAttribute('data-watch'); })[0];
          if (m) { m.watched = !m.watched; persist(ms); render(); }
        });
      })(wbtns[i]);
    }
    var dbtns = list.querySelectorAll('[data-del]');
    for (i = 0; i < dbtns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
          render();
        });
      })(dbtns[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var title = TN.el(SLUG + '-title').value.trim();
    var year = parseInt(TN.el(SLUG + '-year').value, 10);
    if (!title) { TN.setErr(SLUG + '-error', 'Please enter a movie title.'); return; }
    var movies = load();
    movies.push({ id: Date.now(), title: title, year: year || 0, rating: rating, watched: false });
    persist(movies);
    TN.el(SLUG + '-title').value = '';
    TN.el(SLUG + '-year').value = '';
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
      var fbtns = document.querySelectorAll('[data-filter]');
      for (i = 0; i < fbtns.length; i++) {
        (function (b) {
          b.addEventListener('click', function () {
            filter = b.getAttribute('data-filter');
            for (var j = 0; j < fbtns.length; j++) fbtns[j].classList.add('btn-outline');
            b.classList.remove('btn-outline');
            render();
          });
        })(fbtns[i]);
      }
      TN.on(SLUG + '-add', 'click', add);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();