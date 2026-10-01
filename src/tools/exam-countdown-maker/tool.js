/* Exam Countdown Maker — multiple named exams, live countdowns, localStorage. */
(function () {
  'use strict';
  var SLUG = 'exam-countdown-maker';
  var KEY = 'tn_exam_countdowns_v1';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var exams = [];
  var timerId = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      exams = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(exams)) exams = [];
    } catch (e) { exams = []; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(exams)); } catch (e) {}
  }

  function fmtDate(ts) {
    var d = new Date(ts);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function dhms(ms) {
    ms = Math.max(0, ms);
    var s = Math.floor(ms / 1000);
    return {
      d: Math.floor(s / 86400),
      h: Math.floor((s % 86400) / 3600),
      m: Math.floor((s % 3600) / 60),
      s: s % 60
    };
  }

  function render() {
    var now = Date.now();
    var list = $('list');
    if (!exams.length) {
      list.innerHTML = '<p class="muted" style="text-align:center">No exams yet — add your first one above.</p>';
      TN.hide(SLUG + '-hero');
    } else {
      var sorted = exams.slice().sort(function (a, b) { return a.ts - b.ts; });
      var html = '';
      sorted.forEach(function (ex) {
        var left = ex.ts - now;
        var t = dhms(left);
        var status = left > 0
          ? '<span class="code">' + t.d + 'd ' + t.h + 'h ' + t.m + 'm ' + t.s + 's</span>'
          : '<span style="color:#2e7d32;font-weight:700">✅ Done</span>';
        html += '<div data-exam="' + ex.id + '" style="display:flex;align-items:center;gap:10px;border:1px solid #e0e0e0;border-radius:8px;padding:8px 12px;margin-bottom:8px">' +
          '<div style="flex:1;min-width:0"><strong>' + esc(ex.name) + '</strong><br><span class="muted">' + esc(fmtDate(ex.ts)) + '</span></div>' +
          '<div class="ex-cd" style="white-space:nowrap">' + status + '</div>' +
          '<button class="btn btn-outline ex-del" data-id="' + ex.id + '" style="padding:4px 10px" aria-label="Delete ' + esc(ex.name) + '">✕</button></div>';
      });
      list.innerHTML = html;
      // hero = nearest upcoming
      var upcoming = sorted.filter(function (ex) { return ex.ts > now; })[0];
      if (upcoming) {
        TN.show(SLUG + '-hero');
        $('hero-name').textContent = upcoming.name;
      } else {
        TN.hide(SLUG + '-hero');
      }
      TN.qsa('.ex-del', list).forEach(function (btn) {
        btn.addEventListener('click', function () {
          exams = exams.filter(function (ex) { return String(ex.id) !== btn.getAttribute('data-id'); });
          save(); render();
        });
      });
    }
  }

  function tick() {
    var now = Date.now();
    // update hero
    var upcoming = exams.filter(function (ex) { return ex.ts > now; }).sort(function (a, b) { return a.ts - b.ts; })[0];
    if (upcoming) {
      TN.show(SLUG + '-hero');
      $('hero-name').textContent = upcoming.name;
      var t = dhms(upcoming.ts - now);
      $('h-d').textContent = t.d; $('h-h').textContent = t.h;
      $('h-m').textContent = t.m; $('h-s').textContent = t.s;
    } else {
      TN.hide(SLUG + '-hero');
    }
    // update list countdowns in place
    TN.qsa('#' + SLUG + '-list .ex-cd').forEach(function (el) {
      var row = el.closest('[data-exam]');
      if (!row) return;
      var ex = null;
      for (var i = 0; i < exams.length; i++) if (String(exams[i].id) === row.getAttribute('data-exam')) { ex = exams[i]; break; }
      if (!ex) return;
      var left = ex.ts - now;
      if (left > 0) {
        var tt = dhms(left);
        el.innerHTML = '<span class="code">' + tt.d + 'd ' + tt.h + 'h ' + tt.m + 'm ' + tt.s + 's</span>';
      } else {
        el.innerHTML = '<span style="color:#2e7d32;font-weight:700">✅ Done</span>';
      }
    });
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = ($('name').value || '').trim();
    var when = $('when').value;
    if (!name) { TN.setErr(SLUG + '-error', 'Please enter the exam name.'); return; }
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(when || '');
    if (!m) { TN.setErr(SLUG + '-error', 'Please pick a valid date and time.'); return; }
    var ts = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime();
    if (isNaN(ts)) { TN.setErr(SLUG + '-error', 'Please pick a valid date and time.'); return; }
    exams.push({ id: Date.now() + '' + Math.floor(Math.random() * 1000), name: name, ts: ts });
    save();
    $('name').value = ''; $('when').value = '';
    render(); tick();
  }

  try {
    load();
    render();
    TN.on(SLUG + '-add', 'click', add);
    timerId = setInterval(tick, 1000);
    tick();
  } catch (e) { /* never throw on load */ }
})();
