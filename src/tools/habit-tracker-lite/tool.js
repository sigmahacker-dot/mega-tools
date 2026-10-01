(function () {
  'use strict';
  var ERR = 'habit-tracker-lite-error';
  var KEY = 'tn_habits_lite';
  var habits = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dayKey(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(habits)); } catch (e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) habits = JSON.parse(raw) || [];
    } catch (e) { habits = []; }
    habits.forEach(function (h) { if (!h.days) h.days = {}; });
  }
  function streak(h) {
    var d = new Date(), s = 0;
    if (!h.days[dayKey(d)]) d.setDate(d.getDate() - 1); // allow today pending
    while (h.days[dayKey(d)]) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }
  function bestStreak(h) {
    var keys = Object.keys(h.days).sort(), best = 0, cur = 0, prev = null;
    keys.forEach(function (k) {
      var d = new Date(k + 'T12:00:00');
      if (prev && (d - prev) === 86400000) cur++;
      else cur = 1;
      if (cur > best) best = cur;
      prev = d;
    });
    return best;
  }
  function render() {
    TN.el('habit-count').textContent = habits.length;
    var today = dayKey(new Date()), doneToday = 0, best = 0;
    habits.forEach(function (h) {
      if (h.days[today]) doneToday++;
      var b = bestStreak(h);
      if (b > best) best = b;
    });
    TN.el('habit-done-today').textContent = doneToday;
    TN.el('habit-best').textContent = best;
    var html = '';
    habits.forEach(function (h, i) {
      var st = streak(h), checked = h.days[today] ? ' checked' : '';
      var week = '';
      for (var d = 6; d >= 0; d--) {
        var dt = new Date(); dt.setDate(dt.getDate() - d);
        var k = dayKey(dt), done = !!h.days[k];
        var label = dt.toLocaleDateString('en-US', { weekday: 'narrow' });
        week += '<div title="' + k + '" style="width:30px;text-align:center"><div style="font-size:.7rem;color:#888">' + label + '</div>' +
          '<div style="width:22px;height:22px;border-radius:50%;margin:2px auto;background:' + (done ? '#4ade80' : 'rgba(255,255,255,.08)') + '"></div></div>';
      }
      html += '<div style="border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px;margin-bottom:10px">' +
        '<div class="checkbox-row" style="justify-content:space-between;margin:0 0 8px">' +
        '<span><input type="checkbox" data-i="' + i + '" id="habit-c' + i + '"' + checked + '>' +
        '<label for="habit-c' + i + '"><strong>' + esc(h.name) + '</strong></label></span>' +
        '<span><span class="muted">🔥 ' + st + ' day' + (st === 1 ? '' : 's') + '</span> ' +
        '<button type="button" class="btn btn-danger btn-sm habit-del" data-i="' + i + '">✕</button></span></div>' +
        '<div style="display:flex;gap:4px">' + week + '</div></div>';
    });
    TN.el('habit-list').innerHTML = html || '<p class="muted">No habits yet — add your first one above.</p>';
    TN.qsa('#habit-list input[type=checkbox]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var h = habits[parseInt(cb.getAttribute('data-i'), 10)];
        if (cb.checked) h.days[dayKey(new Date())] = 1;
        else delete h.days[dayKey(new Date())];
        save(); render();
      });
    });
    TN.qsa('#habit-list .habit-del').forEach(function (b) {
      b.addEventListener('click', function () {
        habits.splice(parseInt(b.getAttribute('data-i'), 10), 1);
        save(); render();
      });
    });
  }
  try {
    load(); render();
    TN.on('habit-add', 'click', function () {
      TN.clearErr(ERR);
      var n = TN.el('habit-name').value.trim();
      if (!n) { TN.setErr(ERR, 'Type a habit name first.'); return; }
      habits.push({ name: n, days: {} });
      TN.el('habit-name').value = '';
      save(); render();
    });
    TN.el('habit-name').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); TN.el('habit-add').click(); }
    });
  } catch (e) { /* never throw on load */ }
})();