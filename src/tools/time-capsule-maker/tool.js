/* Time Capsule Maker — sealed messages with countdown, revealed on the open date. */
(function () {
  'use strict';
  var SLUG = 'time-capsule-maker';
  var KEY = 'tn_time_capsules_v1';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var capsules = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      capsules = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(capsules)) capsules = [];
    } catch (e) { capsules = []; }
  }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(capsules)); } catch (e) {} }

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function dhms(ms) {
    ms = Math.max(0, ms);
    var s = Math.floor(ms / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  }

  function isOpen(c) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var od = parseDate(c.date);
    return od && od.getTime() <= today.getTime();
  }

  function render() {
    var list = $('list');
    if (!capsules.length) {
      list.innerHTML = '<p class="muted">No capsules yet — seal your first message above.</p>';
      return;
    }
    var sorted = capsules.slice().sort(function (a, b) { return (a.date < b.date ? -1 : 1); });
    var html = '';
    sorted.forEach(function (c) {
      var od = parseDate(c.date);
      var ods = od ? od.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
      if (isOpen(c)) {
        html += '<div style="border:1px solid #a5d6a7;border-radius:8px;padding:10px 12px;margin-bottom:10px;background:#f1f8e9">' +
          '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">📬</span><strong>' + esc(c.title) + '</strong>' +
          '<span class="muted" style="margin-left:auto">opened ' + esc(ods) + '</span>' +
          '<button class="btn btn-outline cap-del" data-id="' + c.id + '" style="padding:4px 10px" aria-label="Delete capsule">✕</button></div>' +
          '<p style="white-space:pre-wrap;margin:8px 0 0">' + esc(c.msg) + '</p></div>';
      } else {
        html += '<div data-cap="' + c.id + '" style="border:1px solid #e0e0e0;border-radius:8px;padding:10px 12px;margin-bottom:10px;background:#fafafa">' +
          '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">🔒</span><strong>' + esc(c.title) + '</strong>' +
          '<span class="muted" style="margin-left:auto">opens ' + esc(ods) + '</span>' +
          '<button class="btn btn-outline cap-del" data-id="' + c.id + '" style="padding:4px 10px" aria-label="Delete capsule">✕</button></div>' +
          '<p class="muted cap-cd" style="margin:8px 0 0"></p></div>';
      }
    });
    list.innerHTML = html;
    TN.qsa('.cap-del', list).forEach(function (btn) {
      btn.addEventListener('click', function () {
        capsules = capsules.filter(function (c) { return String(c.id) !== btn.getAttribute('data-id'); });
        save(); render();
      });
    });
    tick();
  }

  function tick() {
    var now = Date.now();
    TN.qsa('#' + SLUG + '-list [data-cap]').forEach(function (row) {
      var c = null;
      for (var i = 0; i < capsules.length; i++) if (String(capsules[i].id) === row.getAttribute('data-cap')) { c = capsules[i]; break; }
      if (!c) return;
      var od = parseDate(c.date);
      var el = row.querySelector('.cap-cd');
      if (!od || !el) return;
      var left = od.getTime() - now;
      if (left <= 0) { render(); return; } // just opened → re-render to reveal
      var t = dhms(left);
      el.innerHTML = '⏳ Opens in <strong>' + t.d + 'd ' + t.h + 'h ' + t.m + 'm ' + t.s + 's</strong> — the message stays sealed until then.';
    });
  }

  function seal() {
    TN.clearErr(SLUG + '-error');
    var title = ($('title').value || '').trim() || 'Untitled capsule';
    var msg = ($('msg').value || '').trim();
    var date = $('date').value;
    if (!msg) { TN.setErr(SLUG + '-error', 'Please write a message first.'); return; }
    var od = parseDate(date);
    if (!od) { TN.setErr(SLUG + '-error', 'Please pick a valid open date.'); return; }
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (od.getTime() < today.getTime()) { TN.setErr(SLUG + '-error', 'The open date must be today or in the future.'); return; }
    capsules.push({ id: Date.now() + '' + Math.floor(Math.random() * 1000), title: title, msg: msg, date: date });
    $('title').value = ''; $('msg').value = ''; $('date').value = '';
    save(); render();
  }

  try {
    load(); render();
    TN.on(SLUG + '-seal', 'click', seal);
    setInterval(tick, 1000);
  } catch (e) { /* never throw on load */ }
})();
