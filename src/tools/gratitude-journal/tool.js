/* Gratitude Journal — 3 daily gratitudes, streak counter. */
(function () {
  'use strict';

  var SLUG = 'gratitude-journal';
  var KEY = 'tn-' + SLUG + '-entries';

  function load() {
    try {
      var obj = JSON.parse(localStorage.getItem(KEY) || '{}');
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) { return {}; }
  }

  function persist(entries) {
    try { localStorage.setItem(KEY, JSON.stringify(entries)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function streak(entries) {
    var count = 0;
    var d = new Date();
    var t = todayStr();
    if (!entries[t]) d = new Date(d.getTime() - 86400000); // allow "save today" before counting
    while (true) {
      var k = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
      if (entries[k]) { count++; d = new Date(d.getTime() - 86400000); }
      else break;
    }
    return count;
  }

  function render() {
    var entries = load();
    var days = Object.keys(entries).sort().reverse();
    TN.el(SLUG + '-streak').textContent = streak(entries);
    TN.el(SLUG + '-total').textContent = days.length;
    var list = TN.el(SLUG + '-list');
    if (!days.length) {
      list.innerHTML = '<p class="muted">No gratitudes yet — start today.</p>';
      return;
    }
    list.innerHTML = days.map(function (d) {
      var g = entries[d];
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>' + TN.esc(d) + '</strong><ol style="margin:6px 0 0;padding-left:20px">' +
        g.map(function (x) { return '<li>' + TN.esc(x) + '</li>'; }).join('') +
        '</ol></div>';
    }).join('');
  }

  function save() {
    TN.clearErr(SLUG + '-error');
    var g = [TN.el(SLUG + '-g1').value.trim(), TN.el(SLUG + '-g2').value.trim(), TN.el(SLUG + '-g3').value.trim()];
    if (g.some(function (x) { return !x; })) {
      TN.setErr(SLUG + '-error', 'Please fill in all three gratitudes.'); return;
    }
    var entries = load();
    entries[todayStr()] = g;
    persist(entries);
    TN.el(SLUG + '-g1').value = TN.el(SLUG + '-g2').value = TN.el(SLUG + '-g3').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-save')) return;
      TN.on(SLUG + '-save', 'click', save);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();