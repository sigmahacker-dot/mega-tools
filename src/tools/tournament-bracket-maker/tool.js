(function () {
  'use strict';
  var ERR = 'tournament-bracket-maker-error';
  var lastRounds = [];
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
  function roundName(r, total) {
    if (r === total) return 'Final';
    if (r === total - 1) return 'Semi-finals';
    if (r === total - 2) return 'Quarter-finals';
    return 'Round ' + r;
  }
  function build() {
    TN.clearErr(ERR);
    var ns = TN.el('bracket-names').value.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
    if (ns.length < 2) { TN.setErr(ERR, 'Enter at least 2 players or teams.'); return; }
    if (ns.length > 128) { TN.setErr(ERR, 'Maximum 128 entrants.'); return; }
    var seeds = TN.el('bracket-shuffle').checked ? shuffle(ns.slice()) : ns.slice();
    var size = 1;
    while (size < seeds.length) size *= 2;
    var byes = size - seeds.length;
    var field = seeds.concat([]);
    for (var b = 0; b < byes; b++) field.push(null); // null = bye
    // Standard seeding: pair 1vN across the field for round 1 using snake placement
    var rounds = [];
    var r1 = [];
    for (var i = 0; i < size / 2; i++) {
      r1.push([field[i], field[size - 1 - i]]);
    }
    rounds.push(r1);
    var prevCount = r1.length, r = 2;
    while (prevCount > 1) {
      var cur = [];
      for (var m = 0; m < prevCount / 2; m++) {
        cur.push(['Winner of R' + (r - 1) + ' M' + (m * 2 + 1), 'Winner of R' + (r - 1) + ' M' + (m * 2 + 2)]);
      }
      rounds.push(cur);
      prevCount = cur.length;
      r++;
    }
    lastRounds = rounds;
    var total = rounds.length;
    TN.el('bracket-players').textContent = seeds.length;
    TN.el('bracket-rounds').textContent = total;
    TN.el('bracket-byes').textContent = byes;
    var html = '';
    rounds.forEach(function (matches, ri) {
      html += '<h4 style="margin:16px 0 6px">' + esc(roundName(ri + 1, total)) + '</h4>';
      html += '<table class="data"><tbody>';
      matches.forEach(function (mt, mi) {
        var a = mt[0] === null ? '<span class="muted">BYE</span>' : esc(mt[0]);
        var c = mt[1] === null ? '<span class="muted">BYE</span>' : esc(mt[1]);
        var note = (mt[0] === null || mt[1] === null) ? ' <span class="muted">(advances)</span>' : '';
        html += '<tr><td style="width:40px">M' + (mi + 1) + '</td><td>' + a + ' <span class="muted">vs</span> ' + c + note + '</td></tr>';
      });
      html += '</tbody></table>';
    });
    html += '<h4 style="margin:16px 0 6px">Champion</h4><p class="muted">Winner of the Final</p>';
    TN.el('bracket-list').innerHTML = html;
  }
  try {
    TN.on('bracket-go', 'click', build);
    TN.on('bracket-dl', 'click', function () {
      if (!lastRounds.length) { TN.setErr(ERR, 'Build a bracket first.'); return; }
      TN.clearErr(ERR);
      var total = lastRounds.length, lines = ['TOURNAMENT BRACKET', ''];
      lastRounds.forEach(function (matches, ri) {
        lines.push(roundName(ri + 1, total).toUpperCase());
        matches.forEach(function (mt, mi) {
          var a = mt[0] === null ? 'BYE' : mt[0];
          var c = mt[1] === null ? 'BYE' : mt[1];
          lines.push('  M' + (mi + 1) + ': ' + a + ' vs ' + c);
        });
        lines.push('');
      });
      var b = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'tournament-bracket.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
    TN.el('bracket-list').innerHTML = '<p class="muted">Enter players and press Build bracket.</p>';
  } catch (e) { /* never throw on load */ }
})();