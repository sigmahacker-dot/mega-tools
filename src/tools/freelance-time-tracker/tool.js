(function () {
  'use strict';
  var P = 'freelance-time-tracker-', ERR = P + 'error';
  var LS = 'tn-freelance-time-tracker-log', LSR = 'tn-freelance-time-tracker-running';
  var log = [], tickId = null;
  function g(id) { return TN.el(P + id); }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      log = raw ? JSON.parse(raw) : [];
    } catch (e) { log = []; }
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(log)); } catch (e) { /* unavailable */ }
  }
  function fmtHMS(ms) {
    var s = Math.floor(ms / 1000);
    function p(x) { return String(x).padStart(2, '0'); }
    return p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60);
  }
  function fmtDur(min) {
    var h = Math.floor(min / 60), m = Math.round(min % 60);
    return h ? h + 'h ' + m + 'm' : m + 'm';
  }
  function running() {
    try {
      var raw = localStorage.getItem(LSR);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function tick() {
    var r = running();
    if (r) g('live').textContent = fmtHMS(Date.now() - r.start);
  }
  function setRunningUI(on) {
    g('start').disabled = on;
    g('stop').disabled = !on;
    g('client').disabled = on;
    g('project').disabled = on;
  }
  function render() {
    var body = g('log');
    if (!log.length) { body.innerHTML = '<tr><td colspan="5" class="muted">No entries yet — start the timer or add a manual entry.</td></tr>'; }
    else {
      var rows = log.slice().sort(function (a, b) { return b.start - a.start; });
      body.innerHTML = rows.map(function (e) {
        var d = new Date(e.start);
        var ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return '<tr><td>' + ds + '</td><td>' + TN.esc(e.client) + '</td><td>' + TN.esc(e.project) + '</td><td>' + fmtDur(e.min) + '</td>' +
          '<td><button type="button" class="btn btn-outline btn-sm" data-del="' + e.id + '">Delete</button></td></tr>';
      }).join('');
      var dels = body.querySelectorAll('[data-del]');
      for (var i = 0; i < dels.length; i++) {
        (function (b) {
          TN.on(b, 'click', function () {
            var id = b.getAttribute('data-del');
            log = log.filter(function (e) { return String(e.id) !== id; });
            save(); render();
          });
        })(dels[i]);
      }
    }
    var totals = {};
    log.forEach(function (e) {
      var k = e.client || '(no client)';
      totals[k] = (totals[k] || 0) + e.min;
    });
    var keys = Object.keys(totals);
    g('totals').innerHTML = keys.length
      ? '<table class="data"><tbody>' + keys.map(function (k) { return '<tr><td><b>' + TN.esc(k) + '</b></td><td>' + fmtDur(totals[k]) + '</td></tr>'; }).join('') + '</tbody></table>'
      : '<p class="muted">No time logged yet.</p>';
  }
  try {
    if (!TN.el(P + 'start')) return;
    load(); render();
    var r0 = running();
    if (r0) {
      setRunningUI(true);
      g('client').value = r0.client; g('project').value = r0.project;
      tickId = setInterval(tick, 1000); tick();
    }
    TN.on(P + 'start', 'click', function () {
      TN.clearErr(ERR);
      var client = g('client').value.trim(), project = g('project').value.trim();
      if (!client && !project) { TN.setErr(ERR, 'Enter a client or project name first.'); return; }
      try { localStorage.setItem(LSR, JSON.stringify({ start: Date.now(), client: client, project: project })); }
      catch (e) { TN.setErr(ERR, 'Storage is unavailable — the timer cannot persist.'); return; }
      setRunningUI(true);
      tickId = setInterval(tick, 1000); tick();
    });
    TN.on(P + 'stop', 'click', function () {
      TN.clearErr(ERR);
      var r = running();
      if (!r) { setRunningUI(false); return; }
      var min = Math.max(1, Math.round((Date.now() - r.start) / 60000));
      log.push({ id: Date.now(), start: r.start, client: r.client, project: r.project, min: min });
      save();
      try { localStorage.removeItem(LSR); } catch (e) { /* ignore */ }
      if (tickId) { clearInterval(tickId); tickId = null; }
      g('live').textContent = '00:00:00';
      setRunningUI(false);
      render();
    });
    TN.on(P + 'madd', 'click', function () {
      TN.clearErr(ERR);
      var dv = g('mdate').value, min = parseInt(g('mmin').value, 10);
      var client = g('client').value.trim(), project = g('project').value.trim();
      if (!dv) { TN.setErr(ERR, 'Pick a date for the manual entry.'); return; }
      if (isNaN(min) || min < 1 || min > 1440) { TN.setErr(ERR, 'Minutes must be 1–1440.'); return; }
      if (!client && !project) { TN.setErr(ERR, 'Enter a client or project name first.'); return; }
      var p = dv.split('-');
      log.push({ id: Date.now(), start: new Date(p[0], p[1] - 1, p[2], 12, 0, 0).getTime(), client: client, project: project, min: min });
      save(); render();
    });
    TN.on(P + 'csv', 'click', function () {
      if (!log.length) { TN.setErr(ERR, 'Nothing to export yet.'); return; }
      var csv = 'Date,Client,Project,Minutes\n';
      log.forEach(function (e) {
        var d = new Date(e.start);
        var ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        csv += ds + ',"' + e.client.replace(/"/g, '""') + '","' + e.project.replace(/"/g, '""') + '",' + e.min + '\n';
      });
      TN.downloadText(csv, 'time-log.csv', 'text/csv');
    });
    TN.on(P + 'clear', 'click', function () {
      log = []; save(); render();
    });
  } catch (e) { /* never throw on load */ }
})();
