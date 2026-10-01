/* Pet Care Tracker — feeding/walk/vet/medication log per pet. */
(function () {
  'use strict';

  var SLUG = 'pet-care-tracker';
  var KEY = 'tn-' + SLUG + '-data';

  var ICONS = { feeding: '🍽️', walk: '🦮', vet: '🏥', medication: '💊' };

  function load() {
    try {
      var obj = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (obj && typeof obj === 'object') {
        return { pets: Array.isArray(obj.pets) ? obj.pets : [], log: Array.isArray(obj.log) ? obj.log : [] };
      }
    } catch (e) { /* fall through */ }
    return { pets: [], log: [] };
  }

  function persist(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function fmtWhen(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderPets() {
    var data = load();
    var sel = TN.el(SLUG + '-pet');
    sel.innerHTML = data.pets.length
      ? data.pets.map(function (p) { return '<option value="' + TN.esc(p) + '">' + TN.esc(p) + '</option>'; }).join('')
      : '<option value="">(add a pet first)</option>';
  }

  function render() {
    renderPets();
    var data = load();
    var sum = TN.el(SLUG + '-summary');
    if (!data.pets.length) {
      sum.innerHTML = '<p class="muted">No pets yet — add one above.</p>';
    } else {
      sum.innerHTML = data.pets.map(function (p) {
        var latest = {};
        data.log.forEach(function (e) {
          if (e.pet === p && (!latest[e.type] || e.ts > latest[e.type].ts)) latest[e.type] = e;
        });
        var rows = Object.keys(ICONS).map(function (t) {
          var e = latest[t];
          return '<span class="muted" style="margin-right:12px">' + ICONS[t] + ' ' +
            (e ? fmtWhen(e.ts) : '—') + '</span>';
        }).join('');
        return '<div style="margin:8px 0"><strong>' + TN.esc(p) + '</strong><br>' + rows + '</div>';
      }).join('');
    }
    var list = TN.el(SLUG + '-list');
    if (!data.log.length) { list.innerHTML = '<p class="muted">No activities logged yet.</p>'; return; }
    list.innerHTML = data.log.slice().reverse().map(function (e) {
      return '<div class="tool-card" style="margin:8px 0">' +
        ICONS[e.type] + ' <strong>' + TN.esc(e.pet) + '</strong> <span class="muted">' + fmtWhen(e.ts) + '</span>' +
        (e.note ? '<p style="margin:4px 0">' + TN.esc(e.note) + '</p>' : '') +
        '<button class="btn btn-sm btn-outline" data-del="' + e.id + '">Delete</button></div>';
    }).join('');
    var dels = list.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          var d = load();
          d.log = d.log.filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); });
          persist(d); render();
        });
      })(dels[i]);
    }
  }

  function addPet() {
    TN.clearErr(SLUG + '-error');
    var name = TN.el(SLUG + '-petname').value.trim();
    if (!name) { TN.setErr(SLUG + '-error', 'Enter a pet name.'); return; }
    var data = load();
    if (data.pets.indexOf(name) !== -1) { TN.setErr(SLUG + '-error', 'That pet is already added.'); return; }
    data.pets.push(name);
    persist(data);
    TN.el(SLUG + '-petname').value = '';
    render();
    TN.el(SLUG + '-pet').value = name;
  }

  function logActivity() {
    TN.clearErr(SLUG + '-error');
    var pet = TN.el(SLUG + '-pet').value;
    var type = TN.el(SLUG + '-type').value;
    var note = TN.el(SLUG + '-note').value.trim();
    if (!pet) { TN.setErr(SLUG + '-error', 'Add a pet first.'); return; }
    var data = load();
    data.log.push({ id: Date.now(), pet: pet, type: type, note: note, ts: Date.now() });
    persist(data);
    TN.el(SLUG + '-note').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-log')) return;
      TN.on(SLUG + '-addpet', 'click', addPet);
      TN.on(SLUG + '-log', 'click', logActivity);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();