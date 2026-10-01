(function () {
  'use strict';
  var P = 'bowling-score-calculator-';
  function g(id) { return document.getElementById(P + id); }
  var frames = []; // each: array of balls (null = not yet entered)
  function blank() {
    frames = [];
    for (var i = 0; i < 10; i++) frames.push([]);
  }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function ballCount(fi) {
    if (fi < 9) {
      var b1 = frames[fi][0];
      if (b1 === 10) return 1;
      return 2;
    }
    var c1 = frames[9][0], c2 = frames[9][1];
    if (c1 === undefined) return 1;
    if (c1 === 10 || (c2 !== undefined && c1 + c2 === 10)) {
      if (c2 === undefined) return 2;
      return 3;
    }
    return 2;
  }
  function maxFor(fi, bi) {
    if (fi < 9) {
      if (bi === 0) return 10;
      return 10 - (frames[fi][0] || 0);
    }
    var b = frames[9];
    if (bi === 0) return 10;
    if (bi === 1) return b[0] === 10 ? 10 : 10 - (b[0] || 0);
    // third ball
    if (b[0] === 10) {
      if (b[1] === 10) return 10;
      return 10 - (b[1] || 0);
    }
    return 10; // spare on first two
  }
  function sym(fi, bi, v) {
    if (v === null || v === undefined) return '';
    if (fi < 9) {
      if (bi === 0 && v === 10) return 'X';
      if (bi === 1) {
        if (frames[fi][0] + v === 10) return '/';
        return String(v);
      }
      return String(v);
    }
    var b = frames[9];
    if (bi === 0) return v === 10 ? 'X' : String(v);
    if (bi === 1) {
      if (b[0] === 10) return v === 10 ? 'X' : String(v);
      return (b[0] + v === 10) ? '/' : String(v);
    }
    if (b[0] === 10) {
      if (b[1] === 10) return v === 10 ? 'X' : String(v);
      return (b[1] + v === 10) ? '/' : String(v);
    }
    return v === 10 ? 'X' : String(v);
  }
  function flatBalls() {
    var out = [];
    for (var i = 0; i < 10; i++) for (var j = 0; j < frames[i].length; j++) {
      if (frames[i][j] !== undefined && frames[i][j] !== null) out.push({ f: i, v: frames[i][j] });
    }
    return out;
  }
  function frameScore(fi, flat) {
    // returns {score, done}
    if (fi < 9) {
      var b1 = frames[fi][0], b2 = frames[fi][1];
      if (b1 === undefined || b1 === null) return { done: false };
      var idx = -1;
      for (var i = 0; i < flat.length; i++) if (flat[i].f === fi) { idx = i; break; }
      if (b1 === 10) {
        if (idx + 2 < flat.length) return { done: true, score: 10 + flat[idx + 1].v + flat[idx + 2].v };
        return { done: false };
      }
      if (b2 === undefined || b2 === null) return { done: false };
      if (b1 + b2 === 10) {
        if (idx + 2 < flat.length) return { done: true, score: 10 + flat[idx + 2].v };
        return { done: false };
      }
      return { done: true, score: b1 + b2 };
    }
    var b = frames[9];
    if (ballCount(9) === b.filter(function (x) { return x !== undefined && x !== null; }).length && b[0] !== undefined && b[0] !== null) {
      var s = 0;
      for (var k = 0; k < b.length; k++) s += b[k] || 0;
      return { done: true, score: s };
    }
    return { done: false };
  }
  function render() {
    var el = g('frames'); if (!el) return;
    el.innerHTML = '';
    var flat = flatBalls(), cum = 0, total = 0, allDone = true;
    var cumScores = [];
    for (var fi = 0; fi < 10; fi++) {
      var fs = frameScore(fi, flat);
      if (fs.done) { cum += fs.score; cumScores.push(cum); }
      else { cumScores.push(null); allDone = false; }
    }
    total = cum;
    for (var f2 = 0; f2 < 10; f2++) {
      (function (fi) {
        var box = document.createElement('div');
        box.style.cssText = 'background:#292524;border-radius:8px;padding:6px;display:flex;flex-direction:column;gap:4px';
        var title = document.createElement('div');
        title.style.cssText = 'font-size:11px;color:#a8a29e;font-weight:700;text-align:center';
        title.textContent = fi === 9 ? '10th' : 'Frame ' + (fi + 1);
        box.appendChild(title);
        var ballsRow = document.createElement('div');
        ballsRow.style.cssText = 'display:flex;gap:4px;justify-content:center';
        var nb = ballCount(fi);
        for (var bi = 0; bi < nb; bi++) {
          (function (bj) {
            var cur = frames[fi][bj];
            var sel = document.createElement('select');
            sel.className = 'input';
            sel.style.cssText = 'width:100%;min-width:0;font-size:13px;padding:4px 2px;text-align:center';
            sel.setAttribute('aria-label', 'Frame ' + (fi + 1) + ' ball ' + (bj + 1));
            var emp = document.createElement('option');
            emp.value = ''; emp.textContent = '–';
            sel.appendChild(emp);
            var mx = maxFor(fi, bj);
            for (var v = 0; v <= mx; v++) {
              var op = document.createElement('option');
              op.value = String(v);
              op.textContent = sym(fi, bj, v) || String(v);
              if (cur === v) op.selected = true;
              sel.appendChild(op);
            }
            sel.addEventListener('change', function () {
              var nv = sel.value === '' ? null : parseInt(sel.value, 10);
              frames[fi][bj] = nv;
              // clear later balls that are now illegal/out of range
              var legal = ballCount(fi);
              frames[fi] = frames[fi].slice(0, legal);
              for (var q = bj + 1; q < legal; q++) {
                if (frames[fi][q] !== null && frames[fi][q] !== undefined && frames[fi][q] > maxFor(fi, q)) frames[fi][q] = null;
              }
              render();
            });
            ballsRow.appendChild(sel);
          })(bi);
        }
        box.appendChild(ballsRow);
        var cs = document.createElement('div');
        cs.style.cssText = 'text-align:center;font-weight:800;font-size:18px;min-height:26px;color:' + (cumScores[fi] !== null ? '#4ade80' : '#57534e');
        cs.textContent = cumScores[fi] !== null ? String(cumScores[fi]) : '–';
        box.appendChild(cs);
        el.appendChild(box);
      })(f2);
    }
    var t = g('total'); if (t) t.textContent = String(total);
    var st = g('status');
    if (st) {
      if (allDone) st.textContent = total === 300 ? '🎳 PERFECT GAME — 300!' : 'Game complete — final score ' + total + '.';
      else st.textContent = 'Enter pins ball by ball. Strike = X, spare = /.';
    }
  }
  function fill(game) {
    blank();
    if (game === 'perfect') {
      for (var i = 0; i < 9; i++) frames[i] = [10];
      frames[9] = [10, 10, 10];
    } else {
      for (var j = 0; j < 9; j++) frames[j] = [0, 0];
      frames[9] = [0, 0];
    }
    render();
  }
  try {
    if (!g('frames')) return;
    blank();
    TN.on(P + 'new', 'click', function () { blank(); TN.clearErr(P + 'error'); render(); });
    TN.on(P + 'perfect', 'click', function () { fill('perfect'); });
    TN.on(P + 'gutter', 'click', function () { fill('gutter'); });
    render();
  } catch (e) { /* never throw on load */ }
})();
