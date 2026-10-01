(function () {
  'use strict';
  var P = 'riemann-sum-visualizer-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  var FN1 = { sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, exp: Math.exp, ln: Math.log, sqrt: Math.sqrt, abs: Math.abs };
  function makeEval(src) {
    var toks = [], i = 0;
    while (i < src.length) {
      var c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        var j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        var num = src.slice(i, j);
        if (!/^\d+(\.\d+)?$/.test(num)) throw new Error('Bad number "' + num + '".');
        toks.push({ t: 'num', v: parseFloat(num) }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        var k = i;
        while (k < src.length && /[a-zA-Z]/.test(src[k])) k++;
        var w = src.slice(i, k).toLowerCase(); i = k;
        if (w === 'x') toks.push({ t: 'x' });
        else if (w === 'e') toks.push({ t: 'num', v: Math.E });
        else if (w === 'pi') toks.push({ t: 'num', v: Math.PI });
        else if (w === 'log') toks.push({ t: 'fn', v: 'log10' });
        else if (FN1[w]) toks.push({ t: 'fn', v: w });
        else throw new Error('Unknown name "' + w + '".');
        continue;
      }
      if ('+-*/^()'.indexOf(c) >= 0) { toks.push({ t: c }); i++; continue; }
      throw new Error('Unexpected character "' + c + '".');
    }
    var out = [];
    for (var q = 0; q < toks.length; q++) {
      out.push(toks[q]);
      if (q + 1 < toks.length) {
        var a = toks[q].t, b = toks[q + 1].t;
        if ((a === 'num' || a === 'x' || a === ')') && (b === 'num' || b === 'x' || b === 'fn' || b === '(')) out.push({ t: '*' });
      }
    }
    toks = out;
    var pos = 0;
    function peek() { return toks[pos]; }
    function next() { return toks[pos++]; }
    function expr() {
      var n = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) { var o = next().t, r = term(); n = { t: o, l: n, r: r }; }
      return n;
    }
    function term() {
      var n = unary();
      while (peek() && (peek().t === '*' || peek().t === '/')) { var o = next().t, r = unary(); n = { t: o, l: n, r: r }; }
      return n;
    }
    function unary() {
      if (peek() && peek().t === '-') { next(); return { t: 'neg', a: unary() }; }
      if (peek() && peek().t === '+') { next(); return unary(); }
      return power();
    }
    function power() {
      var n = atom();
      if (peek() && peek().t === '^') { next(); n = { t: 'pow', l: n, r: unary() }; }
      return n;
    }
    function atom() {
      var tk = next();
      if (!tk) throw new Error('Unexpected end of expression.');
      if (tk.t === 'num' || tk.t === 'x') return tk;
      if (tk.t === 'fn') {
        if (!peek() || peek().t !== '(') throw new Error('Expected ( after function.');
        next(); var a = expr();
        if (!peek() || peek().t !== ')') throw new Error('Missing ).');
        next(); return { t: 'fn', v: tk.v, a: a };
      }
      if (tk.t === '(') {
        var e = expr();
        if (!peek() || peek().t !== ')') throw new Error('Missing ).');
        next(); return e;
      }
      throw new Error('Unexpected token.');
    }
    var tree = expr();
    if (pos < toks.length) throw new Error('Could not parse the whole expression.');
    function ev(n, x) {
      switch (n.t) {
        case 'num': return n.v;
        case 'x': return x;
        case 'neg': return -ev(n.a, x);
        case '+': return ev(n.l, x) + ev(n.r, x);
        case '-': return ev(n.l, x) - ev(n.r, x);
        case '*': return ev(n.l, x) * ev(n.r, x);
        case '/': { var d = ev(n.r, x); if (d === 0) throw new Error('Division by zero in f.'); return ev(n.l, x) / d; }
        case 'pow': return Math.pow(ev(n.l, x), ev(n.r, x));
        case 'fn': {
          var a = ev(n.a, x), f = n.v;
          if ((f === 'ln' || f === 'log10') && a <= 0) throw new Error('log of non-positive value.');
          if (f === 'sqrt' && a < 0) throw new Error('sqrt of negative value.');
          return f === 'log10' ? Math.log10(a) : FN1[f](a);
        }
      }
      throw new Error('Evaluation error.');
    }
    return function (x) {
      var v = ev(tree, x);
      if (!isFinite(v)) throw new Error('f is not finite at x = ' + x + '.');
      return v;
    };
  }
  function fmt(x) {
    if (!isFinite(x)) return String(x);
    return String(parseFloat(x.toPrecision(8)));
  }
  function draw() {
    try {
      TN.clearErr(ERR);
      var src = g('fn').value.trim();
      if (!src) { TN.setErr(ERR, 'Type f(x) first.'); return; }
      var f;
      try { f = makeEval(src); } catch (e) { TN.setErr(ERR, e.message); return; }
      var a = parseFloat(g('a').value), b = parseFloat(g('b').value);
      if (isNaN(a) || isNaN(b) || a === b) { TN.setErr(ERR, 'Limits a and b must be numbers with a ≠ b.'); return; }
      var n = parseInt(g('n').value, 10);
      if (isNaN(n) || n < 1 || n > 200) { TN.setErr(ERR, 'n must be an integer from 1 to 200.'); return; }
      var method = g('method').value;
      var lo = Math.min(a, b), hi = Math.max(a, b), sign = a < b ? 1 : -1;
      var h = (hi - lo) / n, i;
      // sums
      var sL = 0, sR = 0, sM = 0, sT = 0;
      var fl = f(lo), fr;
      for (i = 0; i < n; i++) {
        var x0 = lo + i * h, x1 = x0 + h, xm = (x0 + x1) / 2;
        var f0 = f(x0), f1 = f(x1), fm = f(xm);
        sL += f0 * h; sR += f1 * h; sM += fm * h; sT += (f0 + f1) / 2 * h;
      }
      g('s-left').textContent = fmt(sign * sL);
      g('s-right').textContent = fmt(sign * sR);
      g('s-mid').textContent = fmt(sign * sM);
      g('s-trap').textContent = fmt(sign * sT);
      // canvas
      var cv = g('cv');
      if (!cv || !cv.getContext) { TN.setErr(ERR, 'Canvas is not supported in this browser.'); return; }
      var ctx = cv.getContext('2d');
      var W = cv.width, H = cv.height, ml = 46, mr = 14, mt = 14, mb = 34;
      var pw = W - ml - mr, ph = H - mt - mb;
      var NS = 240, xs = [], ys = [], ymin = Infinity, ymax = -Infinity;
      for (i = 0; i <= NS; i++) {
        var xx = lo + (hi - lo) * i / NS, yy = f(xx);
        xs.push(xx); ys.push(yy);
        if (yy < ymin) ymin = yy;
        if (yy > ymax) ymax = yy;
      }
      if (ymin === ymax) { ymin -= 1; ymax += 1; }
      var pad = (ymax - ymin) * 0.12;
      ymin -= pad; ymax += pad;
      function X(x) { return ml + (x - lo) / (hi - lo) * pw; }
      function Y(y) { return mt + ph - (y - ymin) / (ymax - ymin) * ph; }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H);
      // grid + axes
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
      for (i = 0; i <= 4; i++) {
        var gy = mt + ph * i / 4;
        ctx.beginPath(); ctx.moveTo(ml, gy); ctx.lineTo(W - mr, gy); ctx.stroke();
      }
      var y0 = Y(0);
      if (y0 >= mt && y0 <= mt + ph) {
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(ml, y0); ctx.lineTo(W - mr, y0); ctx.stroke();
      }
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(ml, mt); ctx.lineTo(ml, mt + ph); ctx.stroke();
      // bars
      ctx.fillStyle = 'rgba(74,222,128,0.35)';
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1;
      for (i = 0; i < n; i++) {
        var bx0 = lo + i * h, bx1 = bx0 + h, bxm = (bx0 + bx1) / 2;
        var px0 = X(bx0), px1 = X(bx1);
        if (method === 'trapezoid') {
          ctx.beginPath();
          ctx.moveTo(px0, Y(0)); ctx.lineTo(px0, Y(f(bx0)));
          ctx.lineTo(px1, Y(f(bx1))); ctx.lineTo(px1, Y(0));
          ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
          var hx = method === 'left' ? bx0 : (method === 'right' ? bx1 : bxm);
          var hv = f(hx), py = Y(hv), pz = Y(0);
          ctx.fillRect(px0 + 0.5, Math.min(py, pz), Math.max(px1 - px0 - 1, 1), Math.abs(py - pz));
          ctx.strokeRect(px0 + 0.5, Math.min(py, pz), Math.max(px1 - px0 - 1, 1), Math.abs(py - pz));
        }
      }
      // curve
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (i = 0; i <= NS; i++) {
        var px = X(xs[i]), py2 = Y(ys[i]);
        if (i === 0) ctx.moveTo(px, py2); else ctx.lineTo(px, py2);
      }
      ctx.stroke();
      // labels
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
      ctx.fillText(fmt(lo), ml - 4, H - 12);
      var lbl = fmt(hi);
      ctx.fillText(lbl, W - mr - ctx.measureText(lbl).width, H - 12);
      ctx.fillText(fmt(ymax - pad), 4, mt + 10);
      ctx.fillText(fmt(ymin + pad), 4, mt + ph);
      TN.show(P + 'out');
      var names = { left: 'left endpoints', right: 'right endpoints', midpoint: 'midpoints', trapezoid: 'trapezoids' };
      g('note').textContent = 'Drawing ' + names[method] + ' with n=' + n + ', h=' + fmt(h) + '. Raise n to watch all four sums converge.';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not draw.'); }
  }
  try {
    if (!TN.el(P + 'draw')) return;
    TN.on(P + 'draw', 'click', draw);
    TN.on(P + 'method', 'change', function () { if (!TN.el(P + 'out').classList.contains('hidden')) draw(); });
  } catch (e) { /* never throw on load */ }
})();
