/* Project Deadline Tracker — milestones with done toggles, progress %, days left, localStorage. */
(function () {
  'use strict';
  var SLUG = 'project-deadline-tracker';
  var KEY = 'tn_project_deadline_v1';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var state = { name: '', deadline: '', milestones: [] };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); if (p && typeof p === 'object') state = p; }
      if (!Array.isArray(state.milestones)) state.milestones = [];
    } catch (e) {}
  }

  function save() {
    state.name = $('name').value;
    state.deadline = $('deadline').value;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function fmtDate(v) {
    var d = parseDate(v);
    if (!d) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function render() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    // days left
    var dl = parseDate($('deadline').value || state.deadline);
    if (dl) {
      var days = Math.round((dl.getTime() - today.getTime()) / 86400000);
      $('daysleft').textContent = days;
      $('daysleft').style.color = days < 0 ? '#c62828' : (days <= 7 ? '#ef6c00' : '');
    } else {
      $('daysleft').textContent = '—';
    }
    // progress
    var total = state.milestones.length;
    var done = state.milestones.filter(function (m) { return m.done; }).length;
    var pct = total ? Math.round(done / total * 100) : 0;
    $('progress').textContent = pct + '%';
    $('done').textContent = done + ' / ' + total;
    $('bar').style.width = pct + '%';
    // list sorted by date
    var sorted = state.milestones.slice().sort(function (a, b) {
      return (a.date || '9999') < (b.date || '9999') ? -1 : 1;
    });
    var html = '';
    if (!sorted.length) html = '<p class="muted">No milestones yet — add the first one above.</p>';
    sorted.forEach(function (m) {
      var dd = parseDate(m.date);
      var daysTxt = '';
      if (dd) {
        var d = Math.round((dd.getTime() - today.getTime()) / 86400000);
        daysTxt = d < 0 ? '<span style="color:#c62828">overdue</span>' :
          d === 0 ? '<span style="color:#ef6c00">today</span>' : d + 'd left';
      }
      html += '<div style="display:flex;align-items:center;gap:10px;border:1px solid #e0e0e0;border-radius:8px;padding:8px 12px;margin-bottom:8px;' +
        (m.done ? 'background:#f1f8e9' : '') + '">' +
        '<input type="checkbox" class="ms-done" data-id="' + m.id + '"' + (m.done ? ' checked' : '') + ' aria-label="Mark done">' +
        '<div style="flex:1;min-width:0' + (m.done ? ';text-decoration:line-through;color:#777' : '') + '"><strong>' + esc(m.name) + '</strong><br><span class="muted">' + esc(fmtDate(m.date)) + ' · ' + daysTxt + '</span></div>' +
        '<button class="btn btn-outline ms-del" data-id="' + m.id + '" style="padding:4px 10px" aria-label="Delete milestone">✕</button></div>';
    });
    $('list').innerHTML = html;
    TN.qsa('.ms-done', $('list')).forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = cb.getAttribute('data-id');
        state.milestones.forEach(function (m) { if (String(m.id) === id) m.done = cb.checked; });
        save(); render();
      });
    });
    TN.qsa('.ms-del', $('list')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        state.milestones = state.milestones.filter(function (m) { return String(m.id) !== id; });
        save(); render();
      });
    });
  }

  function addMilestone() {
    TN.clearErr(SLUG + '-error');
    var name = ($('mname').value || '').trim();
    var date = $('mdate').value;
    if (!name) { TN.setErr(SLUG + '-error', 'Please enter a milestone name.'); return; }
    if (!parseDate(date)) { TN.setErr(SLUG + '-error', 'Please pick a valid target date.'); return; }
    state.milestones.push({ id: Date.now() + '' + Math.floor(Math.random() * 1000), name: name, date: date, done: false });
    $('mname').value = ''; $('mdate').value = '';
    save(); render();
  }

  try {
    load();
    $('name').value = state.name || '';
    $('deadline').value = state.deadline || '';
    render();
    TN.on(SLUG + '-addm', 'click', addMilestone);
    TN.on(SLUG + '-name', 'input', function () { save(); render(); });
    TN.on(SLUG + '-deadline', 'change', function () { save(); render(); });
  } catch (e) { /* never throw on load */ }
})();
