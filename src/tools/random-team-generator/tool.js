(function () {
  'use strict';
  var ERR = 'random-team-generator-error';
  var lastTeams = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function names() {
    return TN.el('rteam-names').value.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
  }
  function generate() {
    TN.clearErr(ERR);
    var ns = names();
    if (ns.length < 2) { TN.setErr(ERR, 'Enter at least 2 names.'); return; }
    var n = parseInt(TN.el('rteam-n').value, 10);
    if (!(n >= 2)) { TN.setErr(ERR, 'Enter a number of 2 or more.'); return; }
    var mode = TN.el('rteam-mode').value;
    var teamCount = mode === 'count' ? Math.min(n, ns.length) : Math.max(1, Math.ceil(ns.length / n));
    if (teamCount < 2 && ns.length >= 2) teamCount = 2;
    if (teamCount > ns.length) teamCount = ns.length;
    var order = shuffle(ns.slice());
    var teams = [];
    for (var i = 0; i < teamCount; i++) teams.push([]);
    order.forEach(function (name, idx) { teams[idx % teamCount].push(name); });
    lastTeams = teams;
    TN.el('rteam-players').textContent = ns.length;
    TN.el('rteam-teams').textContent = teamCount;
    var html = '<div class="grid2">';
    teams.forEach(function (t, i) {
      html += '<div><h4 style="margin:10px 0 6px">Team ' + (i + 1) + ' <span class="muted">(' + t.length + ')</span></h4><ul style="margin:0;padding-left:20px">';
      t.forEach(function (p) { html += '<li>' + esc(p) + '</li>'; });
      html += '</ul></div>';
    });
    TN.el('rteam-list').innerHTML = html + '</div>';
  }
  try {
    TN.on('rteam-go', 'click', generate);
    TN.on('rteam-mode', 'change', generate);
    TN.on('rteam-n', 'input', generate);
    TN.on('rteam-copy', 'click', function () {
      if (!lastTeams.length) { TN.setErr(ERR, 'Shuffle the teams first.'); return; }
      TN.clearErr(ERR);
      var txt = lastTeams.map(function (t, i) { return 'Team ' + (i + 1) + ':\n' + t.join('\n'); }).join('\n\n');
      if (TN.copy) TN.copy(txt);
    });
    TN.el('rteam-list').innerHTML = '<p class="muted">Enter names and press Shuffle teams.</p>';
  } catch (e) { /* never throw on load */ }
})();