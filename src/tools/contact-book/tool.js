/* Contact Book — contacts with phone/email/notes, search, localStorage. */
(function () {
  'use strict';

  var SLUG = 'contact-book';
  var KEY = 'tn-' + SLUG + '-contacts';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(contacts) {
    try { localStorage.setItem(KEY, JSON.stringify(contacts)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function render() {
    var contacts = load();
    var q = (TN.el(SLUG + '-search').value || '').toLowerCase();
    var shown = contacts.filter(function (c) {
      if (!q) return true;
      return (c.name + ' ' + c.phone + ' ' + c.email + ' ' + c.notes).toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    var list = TN.el(SLUG + '-list');
    if (!shown.length) { list.innerHTML = '<p class="muted">No contacts found.</p>'; }
    else {
      list.innerHTML = shown.map(function (c) {
        return '<div class="tool-card" style="margin:8px 0">' +
          '<strong>' + TN.esc(c.name) + '</strong>' +
          (c.phone ? '<p style="margin:2px 0">📞 <a href="tel:' + TN.esc(c.phone) + '">' + TN.esc(c.phone) + '</a></p>' : '') +
          (c.email ? '<p style="margin:2px 0">✉️ <a href="mailto:' + TN.esc(c.email) + '">' + TN.esc(c.email) + '</a></p>' : '') +
          (c.notes ? '<p class="muted" style="margin:2px 0">' + TN.esc(c.notes) + '</p>' : '') +
          '<button class="btn btn-sm btn-outline" data-del="' + c.id + '" style="margin-top:6px">Delete</button></div>';
      }).join('');
      var dels = list.querySelectorAll('[data-del]');
      for (var i = 0; i < dels.length; i++) {
        (function (b) {
          b.addEventListener('click', function () {
            persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
            render();
          });
        })(dels[i]);
      }
    }
    TN.el(SLUG + '-count').textContent = shown.length + ' of ' + contacts.length + ' contacts.';
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = TN.el(SLUG + '-name').value.trim();
    if (!name) { TN.setErr(SLUG + '-error', 'Please enter a name.'); return; }
    var contacts = load();
    contacts.push({
      id: Date.now(),
      name: name,
      phone: TN.el(SLUG + '-phone').value.trim(),
      email: TN.el(SLUG + '-email').value.trim(),
      notes: TN.el(SLUG + '-notes').value.trim()
    });
    persist(contacts);
    TN.el(SLUG + '-name').value = '';
    TN.el(SLUG + '-phone').value = '';
    TN.el(SLUG + '-email').value = '';
    TN.el(SLUG + '-notes').value = '';
    render();
  }

  function exportJson() {
    var contacts = load();
    if (!contacts.length) { TN.setErr(SLUG + '-error', 'Nothing to export yet.'); return; }
    TN.downloadText(JSON.stringify(contacts, null, 2), 'contacts.json', 'application/json');
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-export', 'click', exportJson);
      TN.el(SLUG + '-search').addEventListener('input', render);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();