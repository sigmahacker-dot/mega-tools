(function () {
  'use strict';
  var ERR = 'study-plan-generator-error';
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var lastPlan = null;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function addSubject(name, hours) {
    var box = TN.el('study-subjects');
    var d = document.createElement('div');
    d.className = 'study-row';
    d.style.cssText = 'display:grid;grid-template-columns:1fr 110px 34px;gap:8px;margin-bottom:8px;';
    d.innerHTML = '<input type="text" class="input study-name" placeholder="Subject">' +
      '<input type="number" class="input study-hours" min="0.5" step="0.5" placeholder="hrs/wk">' +
      '<button type="button" class="btn btn-danger btn-sm study-del" title="Remove">✕</button>';
    if (name) d.querySelector('.study-name').value = name;
    if (hours) d.querySelector('.study-hours').value = hours;
    box.appendChild(d);
    d.querySelector('.study-del').addEventListener('click', function () { d.remove(); });
  }
  function build() {
    TN.clearErr(ERR);
    var subjects = [];
    TN.qsa('#study-subjects .study-row').forEach(function (r) {
      var n = r.querySelector('.study-name').value.trim();
      var h = parseFloat(r.querySelector('.study-hours').value) || 0;
      if (n && h > 0) subjects.push({ name: n, hours: h });
    });
    if (!subjects.length) { TN.setErr(ERR, 'Add at least one subject with weekly hours.'); return; }
    var avail = [];
    for (var i = 0; i < 7; i++) if (TN.el('study-d' + i).checked) avail.push(i);
    if (!avail.length) { TN.setErr(ERR, 'Tick at least one available day.'); return; }
    var sessMin = parseInt(TN.el('study-session').value, 10);
    var sessions = [];
    subjects.forEach(function (s) {
      var n = Math.max(1, Math.round(s.hours * 60 / sessMin));
      for (var k = 0; k < n; k++) sessions.push(s.name);
    });
    // interleave subjects then deal round-robin across days
    var bySubj = {};
    sessions.forEach(function (s) { (bySubj[s] = bySubj[s] || []).push(s); });
    var keys = Object.keys(bySubj), mixed = [], more = true, idx = 0;
    while (more) {
      more = false;
      for (var ki = 0; ki < keys.length; ki++) {
        var q = bySubj[keys[ki]];
        if (q.length) { mixed.push(q.shift()); more = true; }
      }
      if (++idx > 10000) break;
    }
    var plan = avail.map(function () { return []; });
    mixed.forEach(function (s, mi) { plan[mi % avail.length].push(s); });
    lastPlan = { avail: avail, plan: plan, sessMin: sessMin };
    var totH = subjects.reduce(function (a, s) { return a + s.hours; }, 0);
    TN.el('study-total-h').textContent = (Math.round(totH * 10) / 10) + 'h';
    TN.el('study-total-s').textContent = mixed.length;
    var html = '<table class="data"><thead><tr><th>Day</th><th>Sessions</th><th>Time</th></tr></thead><tbody>';
    avail.forEach(function (di, ai) {
      var list = plan[ai];
      var counts = {};
      list.forEach(function (s) { counts[s] = (counts[s] || 0) + 1; });
      var parts = Object.keys(counts).map(function (k) { return esc(k) + ' ×' + counts[k]; });
      html += '<tr><td><strong>' + DAYS[di] + '</strong></td><td>' + (parts.join('<br>') || '<span class="muted">—</span>') +
        '</td><td>' + (list.length * sessMin / 60).toFixed(1) + 'h</td></tr>';
    });
    TN.el('study-plan').innerHTML = html + '</tbody></table>';
  }
  try {
    TN.on('study-add', 'click', function () { addSubject(); });
    TN.on('study-go', 'click', build);
    TN.on('study-dl', 'click', function () {
      if (!lastPlan) { TN.setErr(ERR, 'Build a plan first.'); return; }
      TN.clearErr(ERR);
      var lines = ['WEEKLY STUDY PLAN (' + lastPlan.sessMin + '-min sessions)', ''];
      lastPlan.avail.forEach(function (di, ai) {
        lines.push(DAYS[di].toUpperCase());
        var counts = {};
        lastPlan.plan[ai].forEach(function (s) { counts[s] = (counts[s] || 0) + 1; });
        Object.keys(counts).forEach(function (k) { lines.push('  - ' + k + ' x' + counts[k]); });
        lines.push('');
      });
      var b = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'study-plan.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
    addSubject('Mathematics', 5);
    addSubject('Physics', 4);
    addSubject('English', 3);
    TN.el('study-plan').innerHTML = '<p class="muted">Press Build plan to generate your schedule.</p>';
  } catch (e) { /* never throw on load */ }
})();