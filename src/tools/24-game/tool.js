(function () {
  'use strict';
  var P = '24-game-';
  function g(id) { return document.getElementById(P + id); }
  // exact fractions
  function F(n, d) {
    d = d || 1;
    var a = Math.abs(n), b = Math.abs(d);
    while (b) { var t = a % b; a = b; b = t; }
    var gg = a || 1;
    return { n: n / gg, d: d / gg };
  }
  function fadd(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fsub(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); }
  function fmul(a, b) { return F(a.n * b.n, a.d * b.d); }
  function fdiv(a, b) { return b.n === 0 ? null : F(a.n * b.d, a.d * b.n); }
  function feq(a, b) { return a.n === b.n && a.d === b.d; }
  function fstr(f) {
    if (f.d === 1) return String(f.n);
    if (Math.abs(f.n) > f.d) {
      var w = Math.trunc(f.n / f.d), r = Math.abs(f.n % f.d);
      return r ? w + ' ' + r + '/' + f.d : String(w);
    }
    return f.n + '/' + f.d;
  }
  var OPS = [
    { s: '+', f: fadd, str: function (a, b) { return '(' + a + '+' + b + ')'; } },
    { s: '−', f: fsub, str: function (a, b) { return '(' + a + '−' + b + ')'; } },
    { s: '×', f: fmul, str: function (a, b) { return '(' + a + '×' + b + ')'; } },
    { s: '÷', f: fdiv, str: function (a, b) { return '(' + a + '÷' + b + ')'; } }
  ];
  var cards = [], selNum = -1, selOp = -1, history = [], over = false;
  var wins = 0, plays = 0;
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  // solver: returns expression string making 24, or null
  function solve(vals) {
    var target = F(24, 1);
    function rec(items) {
      if (items.length === 1) return feq(items[0].v, target) ? items[0].e : null;
      for (var i = 0; i < items.length; i++) for (var j = 0; j < items.length; j++) {
        if (i === j) continue;
        var rest = [];
        for (var k = 0; k < items.length; k++) if (k !== i && k !== j) rest.push(items[k]);
        for (var o = 0; o < OPS.length; o++) {
          // skip duplicate commutative work
          if ((OPS[o].s === '+' || OPS[o].s === '×') && j < i) continue;
          var r = OPS[o].f(items[i].v, items[j].v);
          if (!r) continue;
          var got = rec(rest.concat([{ v: r, e: OPS[o].str(items[i].e, items[j].e) }]));
          if (got) return got;
        }
      }
      return null;
    }
    return rec(vals.map(function (v) { return { v: v, e: fstr(v) }; }));
  }
  function deal() {
    for (var t = 0; t < 60; t++) {
      var nums = [];
      for (var i = 0; i < 4; i++) nums.push(F(1 + Math.floor(Math.random() * 13), 1));
      if (solve(nums)) {
        cards = nums.map(function (v) { return { v: v, e: fstr(v) }; });
        history = []; selNum = -1; selOp = -1; over = false;
        plays++;
        TN.clearErr(P + 'error');
        render();
        status('Make 24! Tap a number, an operator, then another number.');
        return;
      }
    }
    status('Could not deal a solvable hand — press Deal again.');
  }
  function render() {
    var el = g('cards'); if (!el) return;
    el.innerHTML = '';
    cards.forEach(function (c, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.style.cssText = 'min-width:86px;min-height:86px;border-radius:12px;border:3px solid ' + (selNum === i ? '#fde047' : '#4D7C0F') + ';background:#292524;color:#fafaf9;font-size:22px;font-weight:800;cursor:pointer;padding:6px';
      d.innerHTML = TN.esc(fstr(c.v)) + '<div style="font-size:10px;font-weight:400;color:#a8a29e;margin-top:4px;max-width:90px;overflow:hidden;text-overflow:ellipsis">' + TN.esc(c.e) + '</div>';
      d.setAttribute('aria-label', 'Card ' + fstr(c.v));
      d.addEventListener('click', function () { onNum(i); });
      el.appendChild(d);
    });
    var ops = g('ops');
    if (ops && !ops.children.length) {
      OPS.forEach(function (o, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-outline';
        b.style.cssText = 'font-size:20px;min-width:52px';
        b.textContent = o.s;
        b.setAttribute('aria-label', 'Operator ' + o.s);
        b.addEventListener('click', function () { onOp(i); });
        ops.appendChild(b);
      });
    }
    if (ops) {
      for (var i = 0; i < ops.children.length; i++) {
        ops.children[i].style.borderColor = selOp === i ? '#fde047' : '';
        ops.children[i].style.color = selOp === i ? '#fde047' : '';
      }
    }
    var w = g('wins'), p = g('plays');
    if (w) w.textContent = String(wins);
    if (p) p.textContent = String(plays);
  }
  function onNum(i) {
    if (over) return;
    if (selNum === -1 || selOp === -1) {
      selNum = i; selOp = -1;
      status('Picked ' + fstr(cards[i].v) + ' — now choose an operator.');
    } else if (i === selNum) {
      selNum = -1; selOp = -1;
      status('Selection cleared.');
    } else {
      combine(selNum, selOp, i);
    }
    render();
  }
  function onOp(i) {
    if (over || selNum === -1) { status('Pick a number first.'); return; }
    selOp = i;
    status('Picked ' + OPS[i].s + ' — now tap the second number.');
    render();
  }
  function combine(i, o, j) {
    history.push(JSON.stringify({ cards: cards, selNum: -1, selOp: -1 }));
    var a = cards[i], b = cards[j];
    var r = OPS[o].f(a.v, b.v);
    if (!r) { TN.setErr(P + 'error', 'Cannot divide by zero.'); history.pop(); return; }
    TN.clearErr(P + 'error');
    var nc = { v: r, e: OPS[o].str(a.e, b.e) };
    var rest = [];
    for (var k = 0; k < cards.length; k++) if (k !== i && k !== j) rest.push(cards[k]);
    rest.push(nc);
    cards = rest;
    selNum = -1; selOp = -1;
    if (cards.length === 1 && feq(cards[0].v, F(24, 1))) {
      over = true;
      wins++;
      status('🎉 That\'s 24! ' + nc.e + ' = 24. Solved!');
    } else if (cards.length === 1) {
      over = true;
      status('That makes ' + fstr(cards[0].v) + ' — not 24. Press Deal or Undo to try again.');
    } else {
      status(cards.length + ' cards left. Keep combining!');
    }
  }
  try {
    if (!g('cards')) return;
    TN.on(P + 'deal', 'click', deal);
    TN.on(P + 'undo', 'click', function () {
      if (!history.length || over && cards.length === 1 && feq(cards[0].v, F(24, 1))) return;
      var h = history.pop();
      if (h) {
        var s = JSON.parse(h);
        cards = s.cards.map(function (c) { return { v: F(c.v.n, c.v.d), e: c.e }; });
        over = false;
        selNum = -1; selOp = -1;
        render();
        status('Undone.');
      }
    });
    TN.on(P + 'hint', 'click', function () {
      if (over || !cards.length) return;
      var sol = solve(cards.map(function (c) { return c.v; }));
      status(sol ? 'Hint: one solution is ' + sol + ' = 24.' : 'No solution from here — Undo a step!');
    });
    TN.on(P + 'solve', 'click', function () {
      if (over || !cards.length) return;
      var sol = solve(cards.map(function (c) { return c.v; }));
      if (sol) { over = true; wins++; render(); status('🎉 Solution: ' + sol + ' = 24.'); }
      else status('No solution from here — Undo a step!');
    });
    deal();
  } catch (e) { /* never throw on load */ }
})();
