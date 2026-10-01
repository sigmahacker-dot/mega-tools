(function () {
  'use strict';
  var P = 'on-call-rotation-planner-', ERR = P + 'error';
  var DAY = 86400000;
  function g(id) { return TN.el(P + id); }
  function fmtD(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  var lastCsv = '';
  function gen() {
    try {
      TN.clearErr(ERR);
      var team = g('team').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      if (team.length < 2) { TN.setErr(ERR, 'Enter at least 2 team members (one per line).'); return; }
      var startV = g('start').value;
      if (!startV) { TN.setErr(ERR, 'Pick a start date.'); return; }
      var per = parseInt(g('len').value, 10), weeks = parseInt(g('weeks').value, 10);
      if (isNaN(per) || per < 1 || per > 12) { TN.setErr(ERR, 'Weeks per turn must be 1–12.'); return; }
      if (isNaN(weeks) || weeks < 1 || weeks > 104) { TN.setErr(ERR, 'Total weeks must be 1–104.'); return; }
      var sp = startV.split('-');
      var start = new Date(sp[0], sp[1] - 1, sp[2]);
      var turns = Math.ceil(weeks / per);
      var rows = [], totals = {}, csv = 'Turn,On call,From,To\n';
      team.forEach(function (m) { totals[m] = { turns: 0, weeks: 0 }; });
      var covered = 0, ti = 0;
      while (covered < weeks) {
        var member = team[ti % team.length];
        var w = Math.min(per, weeks - covered);
        var from = new Date(start.getTime() + covered * 7 * DAY);
        var to = new Date(from.getTime() + w * 7 * DAY - DAY);
        rows.push({ n: ti + 1, m: member, from: from, to: to, w: w });
        totals[member].turns++; totals[member].weeks += w;
        csv += (ti + 1) + ',"' + member.replace(/"/g, '""') + '",' + fmtD(from) + ',' + fmtD(to) + '\n';
        covered += w; ti++;
      }
      lastCsv = csv;
      TN.show(P + 'out');
      g('rows').innerHTML = rows.map(function (r) {
        return '<tr><td>' + r.n + '</td><td><b>' + TN.esc(r.m) + '</b></td><td>' + fmtD(r.from) + '</td><td>' + fmtD(r.to) + ' (' + r.w + ' wk)</td></tr>';
      }).join('');
      g('totals').innerHTML = team.map(function (m) {
        return '<tr><td><b>' + TN.esc(m) + '</b></td><td>' + totals[m].turns + '</td><td>' + totals[m].weeks + '</td></tr>';
      }).join('');
      g('copy').setAttribute('data-t', rows.map(function (r) { return 'Week ' + r.n + ': ' + r.m + ' (' + fmtD(r.from) + ' → ' + fmtD(r.to) + ')'; }).join('\n'));
    } catch (e) { TN.setErr(ERR, e.message || 'Could not generate the rotation.'); }
  }
  try {
    if (!TN.el(P + 'gen')) return;
    var now = new Date();
    g('start').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    TN.on(P + 'gen', 'click', gen);
    TN.on(P + 'csv', 'click', function () {
      if (!lastCsv) { TN.setErr(ERR, 'Generate the schedule first.'); return; }
      TN.downloadText(lastCsv, 'on-call-rotation.csv', 'text/csv');
    });
    TN.on(P + 'copy', 'click', function () {
      var t = g('copy').getAttribute('data-t');
      if (t) TN.copy(t); else TN.setErr(ERR, 'Generate the schedule first.');
    });
  } catch (e) { /* never throw on load */ }
})();
