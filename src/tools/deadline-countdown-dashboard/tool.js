/* Deadline Countdown Dashboard — multiple named live countdowns, localStorage. */
(function () {
  'use strict';
  var SLUG = 'deadline-countdown-dashboard';
  var KEY = 'tn_deadline_dash_v1';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var items = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(items)) items = [];
    } catch (e) { items = []; }
  }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }

  function dhms(ms) {
    ms = Math.max(0, ms);
    var s = Math.floor(ms / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  }

  function fmtDate(ts) {
    return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function render() {
    var grid = $('grid');
    if (!items.length) {
      grid.innerHTML = '<p class="muted" style="grid-column:1/-1;text-align:center">No deadlines yet — add your first one above.</p>';
      return;
    }
    var sorted = items.slice().sort(function (a, b) { return a.ts - b.ts; });
    var html = '';
    sorted.forEach(function (it) {
      var left = it.ts - Date.now();
      var urgent = left > 0 && left < 86400000;
      var border = left <= 0 ? '#9e9e9e' : (urgent ? '#e53935' : '#1e88e5');
      html += '<div data-dl="' + it.id + '" style="border:1px solid #e0e0e0;border-top:5px solid ' + border +
        ';border-radius:10px;padding:12px;position:relative">' +
        '<button class="btn btn-outline dl-del" data-id="' + it.id + '" style="position:absolute;top:6px;right:6px;padding:2px 8px" aria-label="Delete deadline">✕</button>' +
        '<strong style="display:block;padding-right:30px">' + esc(it.name) + '</strong>' +
        '<span class="muted" style="font-size:12px">' + esc(fmtDate(it.ts)) + '</span>' +
        '<div class="dl-cd" style="margin-top:8px;font-variant-numeric:tabular-nums"></div></div>';
    });
    grid.innerHTML = html;
    TN.qsa('.dl-del', grid).forEach(function (btn) {
      btn.addEventListener('click', function () {
        items = items.filter(function (it) { return String(it.id) !== btn.getAttribute('data-id'); });
        save(); render();
      });
    });
    tick();
  }

  function tick() {
    var now = Date.now();
    TN.qsa('#' + SLUG + '-grid [data-dl]').forEach(function (card) {
      var it = null;
      for (var i = 0; i < items.length; i++) if (String(items[i].id) === card.getAttribute('data-dl')) { it = items[i]; break; }
      if (!it) return;
      var el = card.querySelector('.dl-cd');
      if (!el) return;
      var left = it.ts - now;
      if (left <= 0) {
        el.innerHTML = '<span style="color:#757575;font-weight:700">⏱ Passed</span>';
        return;
      }
      var t = dhms(left);
      el.innerHTML =
        '<div class="countdown-digits" style="gap:4px">' +
        '<div class="cd-cell" style="padding:4px 6px"><span style="font-size:20px">' + t.d + '</span><small>d</small></div>' +
        '<div class="cd-cell" style="padding:4px 6px"><span style="font-size:20px">' + t.h + '</span><small>h</small></div>' +
        '<div class="cd-cell" style="padding:4px 6px"><span style="font-size:20px">' + t.m + '</span><small>m</small></div>' +
        '<div class="cd-cell" style="padding:4px 6px"><span style="font-size:20px">' + t.s + '</span><small>s</small></div></div>';
    });
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = ($('name').value || '').trim();
    var when = $('when').value;
    if (!name) { TN.setErr(SLUG + '-error', 'Please enter a deadline name.'); return; }
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(when || '');
    if (!m) { TN.setErr(SLUG + '-error', 'Please pick a valid date and time.'); return; }
    var ts = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime();
    if (isNaN(ts)) { TN.setErr(SLUG + '-error', 'Please pick a valid date and time.'); return; }
    items.push({ id: Date.now() + '' + Math.floor(Math.random() * 1000), name: name, ts: ts });
    $('name').value = ''; $('when').value = '';
    save(); render();
  }

  try {
    load(); render();
    TN.on(SLUG + '-add', 'click', add);
    setInterval(tick, 1000);
  } catch (e) { /* never throw on load */ }
})();
