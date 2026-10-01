/* Recipe Box — save recipes with ingredients/steps, search, localStorage. */
(function () {
  'use strict';

  var SLUG = 'recipe-box';
  var KEY = 'tn-' + SLUG + '-recipes';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(recipes) {
    try { localStorage.setItem(KEY, JSON.stringify(recipes)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function lines(s) {
    return s.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  }

  function card(r) {
    var ing = lines(r.ing).map(function (l) { return '<li>' + TN.esc(l) + '</li>'; }).join('');
    var steps = lines(r.steps).map(function (l) { return '<li>' + TN.esc(l) + '</li>'; }).join('');
    return '<div class="tool-card" style="margin:8px 0">' +
      '<strong>' + TN.esc(r.name) + '</strong> <span class="muted">(' + TN.esc(r.cat) + ')</span>' +
      '<div class="hidden" data-detail="' + r.id + '" style="margin-top:6px">' +
      '<p><strong>Ingredients</strong></p><ul style="margin-top:0">' + ing + '</ul>' +
      '<p><strong>Steps</strong></p><ol style="margin-top:0">' + steps + '</ol></div>' +
      '<div class="btn-row" style="margin-top:6px">' +
      '<button class="btn btn-sm btn-outline" data-toggle="' + r.id + '">View</button>' +
      '<button class="btn btn-sm btn-outline" data-del="' + r.id + '">Delete</button>' +
      '</div></div>';
  }

  function render() {
    var recipes = load();
    var q = (TN.el(SLUG + '-search').value || '').toLowerCase();
    var shown = recipes.filter(function (r) {
      if (!q) return true;
      return (r.name + ' ' + r.ing + ' ' + r.steps).toLowerCase().indexOf(q) !== -1;
    }).slice().reverse();
    var list = TN.el(SLUG + '-list');
    if (!shown.length) { list.innerHTML = '<p class="muted">No recipes yet.</p>'; return; }
    list.innerHTML = shown.map(card).join('');
    var i;
    var toggles = list.querySelectorAll('[data-toggle]');
    for (i = 0; i < toggles.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          var d = list.querySelector('[data-detail="' + b.getAttribute('data-toggle') + '"]');
          if (d) { d.classList.toggle('hidden'); b.textContent = d.classList.contains('hidden') ? 'View' : 'Hide'; }
        });
      })(toggles[i]);
    }
    var dels = list.querySelectorAll('[data-del]');
    for (i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
          render();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = TN.el(SLUG + '-name').value.trim();
    var cat = TN.el(SLUG + '-cat').value;
    var ing = TN.el(SLUG + '-ing').value.trim();
    var steps = TN.el(SLUG + '-steps').value.trim();
    if (!name) { TN.setErr(SLUG + '-error', 'Please name the recipe.'); return; }
    if (!ing) { TN.setErr(SLUG + '-error', 'Add at least one ingredient.'); return; }
    var recipes = load();
    recipes.push({ id: Date.now(), name: name, cat: cat, ing: ing, steps: steps });
    persist(recipes);
    TN.el(SLUG + '-name').value = '';
    TN.el(SLUG + '-ing').value = '';
    TN.el(SLUG + '-steps').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.el(SLUG + '-search').addEventListener('input', render);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();