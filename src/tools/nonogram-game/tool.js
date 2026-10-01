(function () {
  'use strict';
  var P = 'nonogram-game-';
  function g(id) { return document.getElementById(P + id); }
  var PUZZLES = [
    {
      name: 'Heart', rows: [
        'XX.XX',
        'XXXXX',
        'XXXXX',
        '.XXX.',
        '..X..'
      ]
    },
    {
      name: 'Mushroom', rows: [
        '...XXXX...',
        '..XXXXXX..',
        '.XXXXXXXX.',
        '.XXXXXXXX.',
        '..XXXXXX..',
        '...XXXX...',
        '...XXXX...',
        '...XXXX...',
        '..XXXXXX..',
        '..XXXXXX..'
      ]
    },
    {
      name: 'Rocket', rows: [
        '.......X.......',
        '.......X.......',
        '......XXX......',
        '......XXX......',
        '.....XXXXX.....',
        '.....XXXXX.....',
        '.....XXXXX.....',
        '.....XXXXX.....',
        '....XXXXXXX....',
        '....XXXXXXX....',
        '.....XXXXX.....',
        '...X.XXXXX.X...',
        '...X.XXXXX.X...',
        '......X.X......',
        '.....XX.XX.....'
      ]
    }
  ];
  var N = 0, sol = [], state = [], over = false;
  function runs(line) {
    var out = [], n = 0;
    for (var i = 0; i < line.length; i++) {
      if (line[i]) { n++; }
      else if (n) { out.push(n); n = 0; }
    }
    if (n) out.push(n);
    return out;
  }
  function load(idx) {
    var pz = PUZZLES[idx];
    N = pz.rows.length;
    sol = [];
    state = [];
    for (var r = 0; r < N; r++) {
      sol.push([]); state.push([]);
      for (var c = 0; c < N; c++) {
        sol[r].push(pz.rows[r][c] === 'X' ? 1 : 0);
        state[r].push(0); // 0 empty, 1 filled, 2 crossed
      }
    }
    over = false;
  }
  function rowClues() {
    var out = [];
    for (var r = 0; r < N; r++) out.push(runs(sol[r]));
    return out;
  }
  function colClues() {
    var out = [];
    for (var c = 0; c < N; c++) {
      var line = [];
      for (var r = 0; r < N; r++) line.push(sol[r][c]);
      out.push(runs(line));
    }
    return out;
  }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function flagMistakes() { var el = g('mistakes'); return el ? el.checked : false; }
  function tapMode() { var el = g('markmode'); return el ? el.value : 'fill'; }
  function render() {
    var wrap = g('wrap'); if (!wrap) return;
    wrap.innerHTML = '';
    var rc = rowClues(), cc = colClues();
    var maxR = 0, maxC = 0, r, c;
    for (r = 0; r < N; r++) maxR = Math.max(maxR, rc[r].length);
    for (c = 0; c < N; c++) maxC = Math.max(maxC, cc[c].length);
    var cell = N > 10 ? 22 : (N > 5 ? 30 : 40);
    var t = document.createElement('table');
    t.style.cssText = 'border-collapse:collapse;margin:0 auto';
    function clueCell(txt) {
      var td = document.createElement('td');
      td.style.cssText = 'min-width:' + cell + 'px;height:' + cell + 'px;text-align:center;font-size:' + (N > 10 ? 10 : 12) + 'px;color:#a8a29e;font-weight:700;padding:0 2px';
      td.textContent = txt;
      return td;
    }
    // top clue rows
    for (r = 0; r < maxC; r++) {
      var tr = document.createElement('tr');
      for (var k = 0; k < maxR; k++) tr.appendChild(clueCell(''));
      for (c = 0; c < N; c++) {
        var arr = cc[c], idx = arr.length - maxC + r;
        tr.appendChild(clueCell(idx >= 0 ? String(arr[idx]) : ''));
      }
      t.appendChild(tr);
    }
    for (r = 0; r < N; r++) {
      var tr2 = document.createElement('tr');
      var ra = rc[r];
      for (var k2 = 0; k2 < maxR; k2++) {
        var idx2 = ra.length - maxR + k2;
        tr2.appendChild(clueCell(idx2 >= 0 ? String(ra[idx2]) : ''));
      }
      for (c = 0; c < N; c++) {
        (function (rr, cc2) {
          var td = document.createElement('td');
          var st = state[rr][cc2];
          var wrong = flagMistakes() && st === 1 && !sol[rr][cc2];
          td.style.cssText = 'width:' + cell + 'px;height:' + cell + 'px;border:1px solid #57534e;text-align:center;font-size:' + (cell * 0.55) + 'px;cursor:pointer;padding:0;' +
            'background:' + (st === 1 ? (wrong ? '#7f1d1d' : '#4D7C0F') : (st === 2 ? '#292524' : '#fafaf9')) + ';' +
            'color:' + (st === 2 ? '#78716c' : '#fff');
          td.textContent = st === 1 ? '■' : (st === 2 ? '✕' : '');
          if (!over) {
            td.addEventListener('click', function () { cycle(rr, cc2, 1); });
            td.addEventListener('contextmenu', function (e) { e.preventDefault(); cycle(rr, cc2, 2); });
          }
          tr2.appendChild(td);
        })(r, c);
      }
      t.appendChild(tr2);
    }
    wrap.appendChild(t);
  }
  function cycle(r, c, which) {
    if (over) return;
    // which: 1 = left click (uses tap mode), 2 = right click (cross)
    var target = which === 2 ? 2 : (tapMode() === 'fill' ? 1 : 2);
    state[r][c] = state[r][c] === target ? 0 : target;
    render();
    checkWin();
  }
  function checkWin() {
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      if (sol[r][c] === 1 && state[r][c] !== 1) return;
      if (sol[r][c] === 0 && state[r][c] === 1) return;
    }
    over = true;
    render();
    var pz = PUZZLES[g('puzzle') ? parseInt(g('puzzle').value, 10) : 0];
    status('🎉 Solved! That\'s ' + (pz ? pz.name : 'the picture') + '!');
  }
  function reset() {
    var idx = g('puzzle') ? parseInt(g('puzzle').value, 10) : 0;
    load(idx);
    TN.clearErr(P + 'error');
    render();
    status('Find the hidden ' + PUZZLES[idx].name.toLowerCase() + '. Left-click fills, right-click crosses out.');
  }
  try {
    if (!g('wrap')) return;
    TN.on(P + 'reset', 'click', reset);
    TN.on(P + 'puzzle', 'change', reset);
    TN.on(P + 'mistakes', 'change', render);
    reset();
  } catch (e) { /* never throw on load */ }
})();
