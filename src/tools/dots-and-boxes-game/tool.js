(function () {
  'use strict';
  var P = 'dots-and-boxes-game-';
  function g(id) { return document.getElementById(P + id); }
  var D = 5, B = D - 1; // 5x5 dots, 4x4 boxes
  var h = [], v = [], boxes = [], turn = 1, over = false, scores = [0, 0, 0];
  function setup() {
    h = []; v = []; boxes = [];
    for (var r = 0; r < D; r++) { h.push([]); for (var c = 0; c < B; c++) h[r].push(0); }
    for (var r2 = 0; r2 < B; r2++) { v.push([]); for (var c2 = 0; c2 < D; c2++) v[r2].push(0); }
    for (var r3 = 0; r3 < B; r3++) { boxes.push([]); for (var c3 = 0; c3 < B; c3++) boxes[r3].push(0); }
    turn = 1; over = false; scores = [0, 0, 0];
  }
  function mode() { var el = g('mode'); return el ? el.value : 'ai'; }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function nameOf(p) {
    if (mode() === '2p') return p === 1 ? 'Player 1' : 'Player 2';
    return p === 1 ? 'You' : 'Computer';
  }
  function edgesOfBox(r, c) {
    return [['h', r, c], ['h', r + 1, c], ['v', r, c], ['v', r, c + 1]];
  }
  function edgeVal(t, r, c) { return t === 'h' ? h[r][c] : v[r][c]; }
  function setEdge(t, r, c, p) { if (t === 'h') h[r][c] = p; else v[r][c] = p; }
  function boxesForEdge(t, r, c) {
    var out = [];
    if (t === 'h') {
      if (r > 0) out.push([r - 1, c]);
      if (r < B) out.push([r, c]);
    } else {
      if (c > 0) out.push([r, c - 1]);
      if (c < B) out.push([r, c]);
    }
    return out;
  }
  function boxSides(r, c) {
    var e = edgesOfBox(r, c), n = 0;
    for (var i = 0; i < 4; i++) if (edgeVal(e[i][0], e[i][1], e[i][2])) n++;
    return n;
  }
  // would claiming this edge complete a box? (simulate)
  function completesBox(t, r, c) {
    var bs = boxesForEdge(t, r, c);
    for (var i = 0; i < bs.length; i++) if (boxSides(bs[i][0], bs[i][1]) === 3) return true;
    return false;
  }
  // would it give the opponent an immediate box? (leaves a box with 3 sides for them)
  function givesAway(t, r, c, me) {
    var bs = boxesForEdge(t, r, c);
    for (var i = 0; i < bs.length; i++) {
      var br = bs[i][0], bc = bs[i][1];
      if (boxSides(br, bc) === 2) return true; // becomes 3-sided, opponent takes it
    }
    return false;
  }
  function claim(t, r, c, p) {
    if (over || edgeVal(t, r, c)) return false;
    setEdge(t, r, c, p);
    var took = 0, bs = boxesForEdge(t, r, c);
    for (var i = 0; i < bs.length; i++) {
      var br = bs[i][0], bc = bs[i][1];
      if (!boxes[br][bc] && boxSides(br, bc) === 4) { boxes[br][bc] = p; scores[p]++; took++; }
    }
    return took;
  }
  function allEdges() {
    var out = [];
    for (var r = 0; r < D; r++) for (var c = 0; c < B; c++) if (!h[r][c]) out.push(['h', r, c]);
    for (var r2 = 0; r2 < B; r2++) for (var c2 = 0; c2 < D; c2++) if (!v[r2][c2]) out.push(['v', r2, c2]);
    return out;
  }
  function aiPick() {
    var free = allEdges(), take = [], safe = [];
    for (var i = 0; i < free.length; i++) {
      var e = free[i];
      if (completesBox(e[0], e[1], e[2])) take.push(e);
      else if (!givesAway(e[0], e[1], e[2], 2)) safe.push(e);
    }
    var pool = take.length ? take : (safe.length ? safe : free);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function finished() { return scores[1] + scores[2] === B * B; }
  function render() {
    var bd = g('board'); if (!bd) return;
    bd.innerHTML = '';
    var cell = 34, dot = 8;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    var W = B * cell + dot * 2, H = B * cell + dot * 2;
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    function pt(r, c) { return [dot + c * cell, dot + r * cell]; }
    var r, c, p1, p2, ln;
    // claimed boxes
    for (r = 0; r < B; r++) for (c = 0; c < B; c++) {
      if (boxes[r][c]) {
        var q = pt(r, c), rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', q[0]); rect.setAttribute('y', q[1]);
        rect.setAttribute('width', cell); rect.setAttribute('height', cell);
        rect.setAttribute('fill', boxes[r][c] === 1 ? 'rgba(77,124,15,.35)' : 'rgba(220,38,38,.35)');
        svg.appendChild(rect);
        var t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', q[0] + cell / 2); t.setAttribute('y', q[1] + cell / 2 + 5);
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', '#fafaf9');
        t.setAttribute('font-size', '13'); t.setAttribute('font-weight', 'bold');
        t.textContent = boxes[r][c] === 1 ? '●' : '○';
        svg.appendChild(t);
      }
    }
    // edges
    function drawEdge(t, er, ec, val) {
      var a, b;
      if (t === 'h') { a = pt(er, ec); b = pt(er, ec + 1); }
      else { a = pt(er, ec); b = pt(er + 1, ec); }
      var el = document.createElementNS(svgNS, 'line');
      el.setAttribute('x1', a[0]); el.setAttribute('y1', a[1]);
      el.setAttribute('x2', b[0]); el.setAttribute('y2', b[1]);
      el.setAttribute('stroke', val === 1 ? '#4D7C0F' : (val === 2 ? '#dc2626' : '#57534e'));
      el.setAttribute('stroke-width', val ? 6 : 10);
      el.setAttribute('stroke-linecap', 'round');
      el.style.cursor = val || over ? 'default' : 'pointer';
      if (!val && !over) {
        el.addEventListener('click', function () { onEdge(t, er, ec); });
        el.addEventListener('mouseenter', function () { el.setAttribute('stroke', '#a3a380'); });
        el.addEventListener('mouseleave', function () { el.setAttribute('stroke', '#57534e'); });
      }
      svg.appendChild(el);
    }
    for (r = 0; r < D; r++) for (c = 0; c < B; c++) drawEdge('h', r, c, h[r][c]);
    for (r = 0; r < B; r++) for (c = 0; c < D; c++) drawEdge('v', r, c, v[r][c]);
    // dots
    for (r = 0; r < D; r++) for (c = 0; c < D; c++) {
      p1 = pt(r, c);
      var dotEl = document.createElementNS(svgNS, 'circle');
      dotEl.setAttribute('cx', p1[0]); dotEl.setAttribute('cy', p1[1]);
      dotEl.setAttribute('r', 5); dotEl.setAttribute('fill', '#e7e5e4');
      svg.appendChild(dotEl);
    }
    bd.appendChild(svg);
    var s1 = g('s1'), s2 = g('s2'), l1 = g('l1'), l2 = g('l2');
    if (s1) s1.textContent = String(scores[1]);
    if (s2) s2.textContent = String(scores[2]);
    if (l1) l1.textContent = mode() === 'ai' ? 'You' : 'Player 1';
    if (l2) l2.textContent = mode() === 'ai' ? 'Computer' : 'Player 2';
  }
  function onEdge(t, r, c) {
    if (over || edgeVal(t, r, c)) return;
    if (mode() === 'ai' && turn !== 1) return;
    play(t, r, c);
  }
  function play(t, r, c) {
    var took = claim(t, r, c, turn);
    if (finished()) {
      over = true; render();
      var msg = scores[1] > scores[2] ? '🎉 ' + nameOf(1) + ' wins ' + scores[1] + '–' + scores[2] + '!' :
        (scores[2] > scores[1] ? '🎉 ' + nameOf(2) + ' wins ' + scores[2] + '–' + scores[1] + '!' : '🤝 Draw! ' + scores[1] + '–' + scores[2] + '.');
      status(msg);
      return;
    }
    if (!took) turn = 3 - turn;
    render();
    if (took) status(nameOf(turn) + ' completed a box — go again!');
    else if (mode() === 'ai' && turn === 2) { status('Computer is thinking…'); setTimeout(aiTurn, 400); }
    else status(nameOf(turn) + ' to move.');
  }
  function aiTurn() {
    if (over || turn !== 2) return;
    var e = aiPick();
    if (e) play(e[0], e[1], e[2]);
  }
  function reset() {
    setup();
    TN.clearErr(P + 'error');
    render();
    status('Your move — click an edge between two dots.');
  }
  try {
    if (!g('board')) return;
    TN.on(P + 'new', 'click', reset);
    TN.on(P + 'mode', 'change', reset);
    reset();
  } catch (e) { /* never throw on load */ }
})();
