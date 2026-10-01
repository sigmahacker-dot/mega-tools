/* Word Search Generator — custom words, 8-direction placement, drag/tap selection, win detection. */
(function () {
  'use strict';
  var SLUG = 'word-search-generator';
  var size = 12, grid = [], placed = [], foundCount = 0;
  var anchor = null, selecting = false, pendingAnchor = null;
  var DIRS = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];

  function $(id) { return document.getElementById(id); }
  function cellId(r, c) { return SLUG + '-cell-' + r + '-' + c; }
  function cellEl(r, c) { return $(cellId(r, c)); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function parseWords() {
    var raw = $('word-search-generator-words').value.split(/[\n,;]+/);
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var w = raw[i].trim().toUpperCase().replace(/[^A-Z]/g, '');
      if (w.length >= 3 && w.length <= size && out.indexOf(w) === -1) out.push(w);
      if (out.length >= 20) break;
    }
    return shuffle(out);
  }

  function tryPlace(word) {
    for (var a = 0; a < 200; a++) {
      var d = DIRS[Math.floor(Math.random() * DIRS.length)];
      var r = Math.floor(Math.random() * size), c = Math.floor(Math.random() * size);
      var er = r + d[0] * (word.length - 1), ec = c + d[1] * (word.length - 1);
      if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
      var ok = true, cells = [];
      for (var k = 0; k < word.length; k++) {
        var rr = r + d[0] * k, cc = c + d[1] * k;
        if (grid[rr][cc] !== '' && grid[rr][cc] !== word[k]) { ok = false; break; }
        cells.push([rr, cc]);
      }
      if (!ok) continue;
      for (var m = 0; m < cells.length; m++) grid[cells[m][0]][cells[m][1]] = word[m];
      placed.push({ word: word, cells: cells, found: false });
      return true;
    }
    return false;
  }

  function generate() {
    size = parseInt($('word-search-generator-size').value, 10) || 12;
    var words = parseWords();
    grid = [];
    for (var r = 0; r < size; r++) { grid.push([]); for (var c = 0; c < size; c++) grid[r].push(''); }
    placed = []; foundCount = 0;
    anchor = null; selecting = false; pendingAnchor = null;
    var skipped = [];
    words.forEach(function (w) { if (!tryPlace(w)) skipped.push(w); });
    var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < size; i++) for (var j = 0; j < size; j++) {
      if (grid[i][j] === '') grid[i][j] = alpha[Math.floor(Math.random() * 26)];
    }
    render();
    $('word-search-generator-found').textContent = '0';
    $('word-search-generator-total').textContent = placed.length;
    var msg = 'Find all ' + placed.length + ' words!';
    if (skipped.length) msg += ' Could not fit: ' + skipped.join(', ');
    $('word-search-generator-msg').textContent = msg;
    if (!placed.length) $('word-search-generator-msg').textContent = 'No valid words — enter words of 3+ letters (A–Z).';
  }

  function render() {
    var b = $('word-search-generator-board');
    b.innerHTML = '';
    b.style.gridTemplateColumns = 'repeat(' + size + ', 30px)';
    for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) {
      (function (rr, cc) {
        var d = document.createElement('div');
        d.id = cellId(rr, cc);
        d.textContent = grid[rr][cc];
        d.style.cssText = 'width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:15px;background:#fff;border-radius:4px;cursor:pointer;touch-action:none';
        d.addEventListener('pointerdown', function (e) { e.preventDefault(); onDown(rr, cc); });
        d.addEventListener('pointerenter', function () { onEnter(rr, cc); });
        d.addEventListener('pointerup', function (e) { onUp(rr, cc, e); });
        b.appendChild(d);
      })(r, c);
    }
    var list = $('word-search-generator-list');
    list.innerHTML = '';
    placed.forEach(function (p, i) {
      var s = document.createElement('span');
      s.id = SLUG + '-word-' + i;
      s.textContent = p.word;
      s.style.cssText = 'padding:4px 10px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:20px;font-size:13px;font-weight:bold';
      list.appendChild(s);
    });
  }

  function lineCells(a, f) {
    var dr = f[0] - a[0], dc = f[1] - a[1];
    if (dr === 0 && dc === 0) return [[a[0], a[1]]];
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
    var steps = Math.max(Math.abs(dr), Math.abs(dc));
    var sr = dr === 0 ? 0 : dr / Math.abs(dr);
    var sc = dc === 0 ? 0 : dc / Math.abs(dc);
    var out = [];
    for (var k = 0; k <= steps; k++) out.push([a[0] + sr * k, a[1] + sc * k]);
    return out;
  }

  function clearSel() {
    for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) {
      var el = cellEl(r, c);
      if (el && !el.dataset.found) el.style.background = '#fff';
    }
  }

  function paintLine(a, f) {
    clearSel();
    var cells = lineCells(a, f);
    if (!cells) return;
    cells.forEach(function (p) {
      var el = cellEl(p[0], p[1]);
      if (el && !el.dataset.found) el.style.background = '#fff59d';
    });
  }

  function onDown(r, c) {
    if (pendingAnchor && (pendingAnchor[0] !== r || pendingAnchor[1] !== c)) {
      evaluate(pendingAnchor, [r, c]);
      pendingAnchor = null;
      anchor = null; selecting = false;
      return;
    }
    if (pendingAnchor && pendingAnchor[0] === r && pendingAnchor[1] === c) {
      pendingAnchor = null; clearSel(); anchor = null; selecting = false;
      return;
    }
    anchor = [r, c]; selecting = true; pendingAnchor = null;
    paintLine(anchor, anchor);
  }

  function onEnter(r, c) {
    if (selecting && anchor) paintLine(anchor, [r, c]);
  }

  function onUp(r, c) {
    if (!selecting || !anchor) return;
    selecting = false;
    if (anchor[0] === r && anchor[1] === c) {
      // tap — keep as pending anchor for tap-tap selection on touch
      pendingAnchor = anchor;
      anchor = null;
      return;
    }
    var a = anchor;
    anchor = null;
    evaluate(a, [r, c]);
  }

  function evaluate(a, f) {
    var cells = lineCells(a, f);
    clearSel();
    if (!cells || cells.length < 3) return;
    var word = cells.map(function (p) { return grid[p[0]][p[1]]; }).join('');
    var rev = word.split('').reverse().join('');
    for (var i = 0; i < placed.length; i++) {
      var p = placed[i];
      if (!p.found && (p.word === word || p.word === rev)) {
        p.found = true;
        foundCount++;
        p.cells.forEach(function (cp) {
          var el = cellEl(cp[0], cp[1]);
          if (el) { el.style.background = '#a5d6a7'; el.dataset.found = '1'; }
        });
        var chip = $(SLUG + '-word-' + i);
        if (chip) { chip.style.textDecoration = 'line-through'; chip.style.opacity = '0.5'; }
        $('word-search-generator-found').textContent = foundCount;
        if (foundCount === placed.length) {
          $('word-search-generator-msg').textContent = '🏆 You found every word! Amazing!';
        } else {
          $('word-search-generator-msg').textContent = 'Nice! Found "' + p.word + '" — ' + (placed.length - foundCount) + ' to go.';
        }
        return;
      }
    }
  }

  try {
    TN.on('word-search-generator-gen', 'click', generate);
    TN.on('word-search-generator-new', 'click', generate);
    TN.on('word-search-generator-size', 'change', generate);
    generate();
  } catch (e) { /* never throw on load */ }
})();
