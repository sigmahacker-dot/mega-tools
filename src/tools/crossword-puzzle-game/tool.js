(function () {
  'use strict';
  var P = 'crossword-puzzle-game-';
  function g(id) { return document.getElementById(P + id); }
  // Hand-designed 9x9 crossword ('#' = black square). 16 interlocking entries.
  var GRID = [
    'P##E##CAT',
    'L##A##O##',
    'A#ORB#MAP',
    'N#R#A#E##',
    'E#BAT#TOP',
    'T#IRE####',
    'S#TEST##D',
    '##A#####A',
    '##LAV#SKY'
  ];
  var CLUES = {
    CAT: 'Purring pet', ORB: 'Sphere', MAP: 'Atlas page',
    BAT: 'Flying mammal', TOP: 'Highest point', IRE: 'Anger', TEST: 'Quiz',
    LAV: 'Volcano flow, briefly', SKY: "Cloud's home",
    PLANETS: 'Earth and Mars, e.g.', EAR: 'It hears', COMET: "Halley's ___",
    ORBITAL: "Like a space station's path", BATES: 'Withholds, as breath',
    ARE: '___ we there yet?', DAY: '24 hours'
  };
  var N = 9, entries = [], cells = [], activeEntry = null, activeDir = 'A';
  function isLetter(r, c) { return r >= 0 && r < N && c >= 0 && c < N && GRID[r][c] !== '#'; }
  function buildEntries() {
    entries = [];
    var num = 0;
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      if (!isLetter(r, c)) continue;
      var startsA = !isLetter(r, c - 1) && isLetter(r, c + 1) && isLetter(r, c + 2);
      var startsD = !isLetter(r - 1, c) && isLetter(r + 1, c) && isLetter(r + 2, c);
      if (!startsA && !startsD) continue;
      num++;
      if (startsA) {
        var w = [], cc = c;
        while (isLetter(r, cc)) { w.push([r, cc]); cc++; }
        entries.push({ num: num, dir: 'A', cells: w, word: w.map(function (x) { return GRID[x[0]][x[1]]; }).join('') });
      }
      if (startsD) {
        var w2 = [], rr = r;
        while (isLetter(rr, c)) { w2.push([rr, c]); rr++; }
        entries.push({ num: num, dir: 'D', cells: w2, word: w2.map(function (x) { return GRID[x[0]][x[1]]; }).join('') });
      }
    }
  }
  function entryOf(r, c, dir) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.dir !== dir) continue;
      for (var j = 0; j < e.cells.length; j++) if (e.cells[j][0] === r && e.cells[j][1] === c) return e;
    }
    return null;
  }
  function cellEl(r, c) { return g('cell-' + r + '-' + c); }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function renderGrid() {
    var gd = g('grid'); if (!gd) return;
    gd.innerHTML = ''; cells = [];
    for (var r = 0; r < N; r++) {
      cells.push([]);
      for (var c = 0; c < N; c++) {
        (function (rr, cc) {
          if (!isLetter(rr, cc)) {
            var blk = document.createElement('div');
            blk.style.cssText = 'aspect-ratio:1;background:#1c1917;border-radius:3px';
            gd.appendChild(blk); cells[rr].push(null); return;
          }
          var wrap = document.createElement('div');
          wrap.style.cssText = 'position:relative;aspect-ratio:1';
          var inp = document.createElement('input');
          inp.id = P + 'cell-' + rr + '-' + cc;
          inp.maxLength = 1;
          inp.autocapitalize = 'characters';
          inp.autocomplete = 'off';
          inp.setAttribute('aria-label', 'Row ' + (rr + 1) + ' column ' + (cc + 1));
          inp.style.cssText = 'width:100%;height:100%;text-align:center;font-weight:800;font-size:16px;text-transform:uppercase;background:#fafaf9;color:#1c1917;border:0;border-radius:3px;padding:0';
          inp.addEventListener('focus', function () { selectCell(rr, cc); });
          inp.addEventListener('click', function () {
            // second click on same cell toggles direction
            if (activeEntry && activeEntry.cells[0][0] === rr && activeEntry.cells[0][1] === cc && activeDir === 'A' && entryOf(rr, cc, 'D')) { activeDir = 'D'; highlight(); }
            else if (activeEntry && activeEntry.cells[0][0] === rr && activeEntry.cells[0][1] === cc && activeDir === 'D' && entryOf(rr, cc, 'A')) { activeDir = 'A'; highlight(); }
            selectCell(rr, cc);
          });
          inp.addEventListener('keydown', function (e) { onKey(e, rr, cc); });
          wrap.appendChild(inp);
          var numEl = startsNum(rr, cc);
          if (numEl) {
            var s = document.createElement('span');
            s.textContent = String(numEl);
            s.style.cssText = 'position:absolute;left:2px;top:0;font-size:9px;color:#57534e;pointer-events:none';
            wrap.appendChild(s);
          }
          gd.appendChild(wrap);
          cells[rr].push(inp);
        })(r, c);
      }
    }
  }
  function startsNum(r, c) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.cells[0][0] === r && e.cells[0][1] === c) return e.num;
    }
    return 0;
  }
  function selectCell(r, c) {
    var e = entryOf(r, c, activeDir) || entryOf(r, c, 'A') || entryOf(r, c, 'D');
    if (e) { activeEntry = e; activeDir = e.dir; }
    highlight();
  }
  function highlight() {
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var inp = cells[r] && cells[r][c];
      if (inp) { inp.style.background = '#fafaf9'; }
    }
    if (!activeEntry) return;
    for (var i = 0; i < activeEntry.cells.length; i++) {
      var cc = activeEntry.cells[i], inp2 = cells[cc[0]][cc[1]];
      if (inp2) inp2.style.background = '#fef9c3';
    }
  }
  function renderClues() {
    function fill(id, dir) {
      var el = g(id); if (!el) return;
      el.innerHTML = '';
      entries.filter(function (e) { return e.dir === dir; }).forEach(function (e) {
        var b = document.createElement('button');
        b.type = 'button';
        b.style.cssText = 'text-align:left;border:1px solid #44403c;background:#292524;color:#e7e5e4;border-radius:6px;padding:5px 8px;font-size:13px;cursor:pointer';
        b.innerHTML = '<b>' + e.num + '.</b> ' + TN.esc(CLUES[e.word] || '');
        b.addEventListener('click', function () {
          activeEntry = e; activeDir = e.dir; highlight();
          var first = e.cells[0], inp = cells[first[0]][first[1]];
          if (inp) inp.focus();
          status(e.num + (e.dir === 'A' ? ' across' : ' down') + ' (' + e.word.length + ' letters)');
        });
        el.appendChild(b);
      });
    }
    fill('across', 'A'); fill('down', 'D');
  }
  function onKey(e, r, c) {
    var inp = cells[r][c];
    if (/^[a-zA-Z]$/.test(e.key)) {
      inp.value = e.key.toUpperCase();
      inp.style.color = '#1c1917';
      e.preventDefault();
      moveNext(r, c, 1);
      updateProgress();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (inp.value) { inp.value = ''; }
      else moveNext(r, c, -1);
      updateProgress();
    } else if (e.key === 'ArrowRight') { e.preventDefault(); focusCell(r, c + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusCell(r, c - 1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); focusCell(r + 1, c); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusCell(r - 1, c); }
    else if (e.key === ' ') { e.preventDefault(); activeDir = activeDir === 'A' ? 'D' : 'A'; selectCell(r, c); }
  }
  function focusCell(r, c) {
    if (isLetter(r, c) && cells[r][c]) cells[r][c].focus();
  }
  function moveNext(r, c, step) {
    if (!activeEntry) { focusCell(r, c + step); return; }
    var idx = -1;
    for (var i = 0; i < activeEntry.cells.length; i++)
      if (activeEntry.cells[i][0] === r && activeEntry.cells[i][1] === c) { idx = i; break; }
    var n = idx + step;
    if (n >= 0 && n < activeEntry.cells.length) {
      var nc = activeEntry.cells[n];
      focusCell(nc[0], nc[1]);
    }
  }
  function eachCell(fn) {
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (cells[r][c]) fn(r, c, cells[r][c]);
  }
  function updateProgress() {
    var done = 0;
    entries.forEach(function (e) {
      var ok = true;
      for (var i = 0; i < e.cells.length; i++) {
        var cc = e.cells[i], inp = cells[cc[0]][cc[1]];
        if (!inp || inp.value.toUpperCase() !== GRID[cc[0]][cc[1]]) { ok = false; break; }
      }
      if (ok) done++;
    });
    var el = g('progress'); if (el) el.textContent = String(done);
    if (done === entries.length && entries.length) status('🎉 Puzzle complete! All ' + entries.length + ' answers correct.');
    return done;
  }
  try {
    if (!g('grid')) return;
    buildEntries();
    renderGrid();
    renderClues();
    updateProgress();
    status('Click a clue or a square to start. 19 answers, all interlocking.');
    TN.on(P + 'check', 'click', function () {
      var wrong = 0;
      eachCell(function (r, c, inp) {
        if (inp.value && inp.value.toUpperCase() !== GRID[r][c]) { inp.style.color = '#dc2626'; wrong++; }
        else if (inp.value) inp.style.color = '#1c1917';
      });
      status(wrong ? wrong + ' letter' + (wrong === 1 ? '' : 's') + ' marked wrong (in red).' : 'No mistakes found — everything entered is correct!');
      updateProgress();
    });
    TN.on(P + 'reveal', 'click', function () {
      eachCell(function (r, c, inp) { inp.value = GRID[r][c]; inp.style.color = '#1c1917'; });
      updateProgress();
      status('Grid revealed.');
    });
    TN.on(P + 'clear', 'click', function () {
      eachCell(function (r, c, inp) { inp.value = ''; inp.style.color = '#1c1917'; });
      updateProgress();
      status('Grid cleared. Good luck!');
    });
  } catch (e) { /* never throw on load */ }
})();
