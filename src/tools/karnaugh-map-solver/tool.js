(function () {
  'use strict';
  var P = 'karnaugh-map-solver-', ERR = P + 'error';
  var VARS = ['A', 'B', 'C', 'D'];
  var COLORS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#22d3ee', '#fb9234'];
  function g(id) { return TN.el(P + id); }
  function gray(i) { return i ^ (i >> 1); }
  function parseList(s, n, name) {
    var max = (1 << n) - 1, out = [], seen = {};
    if (!s.trim()) return out;
    var parts = s.split(/[\s,;]+/);
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      var v = parseInt(parts[i], 10);
      if (isNaN(v) || v < 0 || v > max) throw new Error(name + ' must be integers between 0 and ' + max + '. Bad value: "' + parts[i] + '".');
      if (!seen[v]) { seen[v] = 1; out.push(v); }
    }
    return out.sort(function (a, b) { return a - b; });
  }
  function termStr(n, p) {
    var t = '';
    for (var i = 0; i < n; i++) {
      var bp = n - 1 - i;
      if (p.mask & (1 << bp)) continue;
      t += VARS[i] + ((p.bits & (1 << bp)) ? '' : "'");
    }
    return t || '1';
  }
  function quineMcCluskey(n, ones, dcs) {
    var seen = {}, cur = [], log = [];
    ones.concat(dcs).forEach(function (m) {
      if (!seen[m]) { seen[m] = 1; cur.push({ mask: 0, bits: m, terms: [m] }); }
    });
    var primes = [], pkey = {};
    while (cur.length) {
      var used = [], next = [], nseen = {}, i, j;
      for (i = 0; i < cur.length; i++) used[i] = false;
      for (i = 0; i < cur.length; i++) for (j = i + 1; j < cur.length; j++) {
        var a = cur[i], b = cur[j];
        if (a.mask !== b.mask) continue;
        var d = a.bits ^ b.bits;
        if (d && !(d & (d - 1))) {
          used[i] = used[j] = true;
          var nm = a.mask | d, nb = a.bits & ~d, k = nm + ':' + nb;
          if (!nseen[k]) {
            nseen[k] = 1;
            var terms = a.terms.concat(b.terms).filter(function (x, ix, arr) { return arr.indexOf(x) === ix; }).sort(function (x, y) { return x - y; });
            next.push({ mask: nm, bits: nb, terms: terms });
          }
        }
      }
      for (i = 0; i < cur.length; i++) {
        if (!used[i]) { var k2 = cur[i].mask + ':' + cur[i].bits; if (!pkey[k2]) { pkey[k2] = 1; primes.push(cur[i]); } }
      }
      cur = next;
    }
    log.push('Found ' + primes.length + ' prime implicant(s): ' + primes.map(function (p) { return termStr(n, p) + ' (m' + p.terms.join(',m') + ')'; }).join('; '));
    // essential primes
    var uncovered = {}, essential = [], ei, mi;
    ones.forEach(function (m) { uncovered[m] = 1; });
    var remaining = primes.slice();
    var guard = 0;
    while (Object.keys(uncovered).length && guard++ < 200) {
      var found = false;
      var keys = Object.keys(uncovered).map(Number);
      for (mi = 0; mi < keys.length; mi++) {
        var m = keys[mi], cover = [];
        for (ei = 0; ei < remaining.length; ei++) if (remaining[ei].terms.indexOf(m) >= 0) cover.push(ei);
        if (cover.length === 1) {
          var ep = remaining[cover[0]];
          essential.push(ep);
          ep.terms.forEach(function (t) { delete uncovered[t]; });
          remaining.splice(cover[0], 1);
          log.push('Essential prime implicant: ' + termStr(n, ep) + ' (only one covering m' + m + ').');
          found = true;
          break;
        }
      }
      if (!found) {
        // greedy: pick prime covering most uncovered minterms
        var best = -1, bestN = 0;
        for (ei = 0; ei < remaining.length; ei++) {
          var c = 0;
          remaining[ei].terms.forEach(function (t) { if (uncovered[t]) c++; });
          if (c > bestN) { bestN = c; best = ei; }
        }
        if (best < 0) break;
        var gp = remaining[best];
        essential.push(gp);
        gp.terms.forEach(function (t) { delete uncovered[t]; });
        remaining.splice(best, 1);
        log.push('Covered remaining minterms with: ' + termStr(n, gp) + '.');
      }
    }
    return { cover: essential, log: log };
  }
  function renderGrid(n, ones, dcs, cover) {
    var rowVars = n === 2 ? 1 : (n === 3 ? 1 : 2);
    var colVars = n - rowVars;
    var rows = 1 << rowVars, cols = 1 << colVars;
    var rowLabels = [], colLabels = [];
    var i, j;
    for (i = 0; i < rows; i++) rowLabels.push(gray(i).toString(2).padStart(rowVars, '0'));
    for (j = 0; j < cols; j++) colLabels.push(gray(j).toString(2).padStart(colVars, '0'));
    var rowName = VARS.slice(0, rowVars).join(''), colName = VARS.slice(rowVars).join('');
    var h = '<table class="data" style="border-collapse:collapse"><thead><tr><th>' + TN.esc(rowName + ' \\ ' + colName) + '</th>';
    for (j = 0; j < cols; j++) h += '<th>' + colLabels[j] + '</th>';
    h += '</tr></thead><tbody>';
    var cellGroups = {};
    cover.forEach(function (p, gi) {
      p.terms.forEach(function (m) {
        if (ones.indexOf(m) < 0 && dcs.indexOf(m) < 0) return;
        (cellGroups[m] = cellGroups[m] || []).push(gi);
      });
    });
    for (i = 0; i < rows; i++) {
      h += '<tr><th>' + rowLabels[i] + '</th>';
      for (j = 0; j < cols; j++) {
        var m = (gray(i) << colVars) | gray(j);
        var val = ones.indexOf(m) >= 0 ? '1' : (dcs.indexOf(m) >= 0 ? 'd' : '0');
        var style = '', title = 'm' + m;
        var gs = cellGroups[m] || [];
        if (gs.length) {
          var c = COLORS[gs[0] % COLORS.length];
          style = ' style="background:' + c + '33;border:2px solid ' + c + '"';
          title += ' — groups: ' + gs.map(function (x) { return x + 1; }).join(', ');
        }
        h += '<td' + style + ' title="' + TN.esc(title) + '"><b>' + val + '</b></td>';
      }
      h += '</tr>';
    }
    h += '</tbody></table>';
    return h;
  }
  function solve() {
    try {
      TN.clearErr(ERR);
      var n = parseInt(g('vars').value, 10);
      var ones = parseList(g('minterms').value, n, 'Minterms');
      var dcs = parseList(g('dc').value, n, "Don't cares");
      var overlap = ones.filter(function (m) { return dcs.indexOf(m) >= 0; });
      if (overlap.length) { TN.setErr(ERR, 'Minterms and don\'t cares overlap at: ' + overlap.join(', ')); return; }
      var total = 1 << n;
      TN.show(P + 'out');
      var expr, cover, log;
      if (!ones.length) { expr = '0'; cover = []; log = ['No minterms — the function is always 0.']; }
      else if (ones.length === total) { expr = '1'; cover = []; log = ['All minterms are 1 — the function is always 1.']; }
      else {
        var r = quineMcCluskey(n, ones, dcs);
        cover = r.cover; log = r.log;
        expr = cover.map(function (p) { return termStr(n, p); }).join(' + ');
      }
      g('expr').textContent = 'F = ' + expr;
      g('expr').setAttribute('data-expr', expr);
      g('grid').innerHTML = renderGrid(n, ones, dcs, cover);
      g('legend').textContent = cover.length ? 'Each color is one implicant group in the minimized cover.' : '';
      var sh = '<ol>' + log.map(function (l) { return '<li>' + TN.esc(l) + '</li>'; }).join('') + '</ol>';
      if (cover.length) {
        sh += '<table class="data"><thead><tr><th>#</th><th>Implicant</th><th>Covers minterms</th></tr></thead><tbody>' +
          cover.map(function (p, i) {
            return '<tr><td><span style="display:inline-block;width:12px;height:12px;background:' + COLORS[i % COLORS.length] + ';border-radius:3px"></span> ' + (i + 1) + '</td><td><b>' + TN.esc(termStr(n, p)) + '</b></td><td>m' + p.terms.join(', m') + '</td></tr>';
          }).join('') + '</tbody></table>';
      }
      g('steps').innerHTML = sh;
    } catch (e) { TN.setErr(ERR, e.message || 'Could not solve. Check your inputs.'); }
  }
  try {
    if (!TN.el(P + 'solve')) return;
    TN.on(P + 'solve', 'click', solve);
    TN.on(P + 'clear', 'click', function () { g('minterms').value = ''; g('dc').value = ''; TN.hide(P + 'out'); TN.clearErr(ERR); });
    TN.on(P + 'vars', 'change', function () { TN.hide(P + 'out'); });
    TN.on(P + 'copy', 'click', function () {
      var e = g('expr').getAttribute('data-expr') || '';
      if (e) TN.copy('F = ' + e);
    });
  } catch (e) { /* never throw on load */ }
})();
