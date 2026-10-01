(function () {
  'use strict';
  var P = 'integral-estimator-', ERR = P + 'error';
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
      if (tk.t === 'num') return tk;
      if (tk.t === 'x') return tk;
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
    // implicit multiplication
    function withImplicit(list) {
      var out = [];
      for (var q = 0; q < list.length; q++) {
        out.push(list[q]);
        if (q + 1 < list.length) {
          var a = list[q].t, b = list[q + 1].t;
          if ((a === 'num' || a === 'x' || a === ')') && (b === 'num' || b === 'x' || b === 'fn' || b === '(')) out.push({ t: '*' });
        }
      }
      return out;
    }
    toks = withImplicit(toks);
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
        case '/': { var d = ev(n.r, x); if (d === 0) throw new Error('Division by zero in integrand.'); return ev(n.l, x) / d; }
        case 'pow': return Math.pow(ev(n.l, x), ev(n.r, x));
        case 'fn': {
          var a = ev(n.a, x), f = n.v;
          if (f === 'ln' && a <= 0) throw new Error('ln of non-positive value.');
          if (f === 'log10' && a <= 0) throw new Error('log of non-positive value.');
          if (f === 'sqrt' && a < 0) throw new Error('sqrt of negative value.');
          return f === 'log10' ? Math.log10(a) : FN1[f](a);
        }
      }
      throw new Error('Evaluation error.');
    }
    return function (x) {
      var v = ev(tree, x);
      if (!isFinite(v)) throw new Error('Integrand is not finite at x = ' + x + '.');
      return v;
    };
  }
  function integrate(f, a, b, n, method) {
    if (method === 'simpson' && n % 2 === 1) n++;
    var h = (b - a) / n, sum = 0, evals = 0, i;
    if (method === 'trapezoid') {
      sum = (f(a) + f(b)) / 2; evals = 2;
      for (i = 1; i < n; i++) { sum += f(a + i * h); evals++; }
      return { val: sum * h, n: n, evals: evals, h: h };
    }
    if (method === 'midpoint') {
      for (i = 0; i < n; i++) { sum += f(a + (i + 0.5) * h); evals++; }
      return { val: sum * h, n: n, evals: evals, h: h };
    }
    // simpson
    sum = f(a) + f(b); evals = 2;
    for (i = 1; i < n; i++) { sum += (i % 2 ? 4 : 2) * f(a + i * h); evals++; }
    return { val: sum * h / 3, n: n, evals: evals, h: h };
  }
  function fmt(x) {
    if (!isFinite(x)) return String(x);
    return String(parseFloat(x.toPrecision(10)));
  }
  function go() {
    try {
      TN.clearErr(ERR);
      var src = g('fn').value.trim();
      if (!src) { TN.setErr(ERR, 'Type an integrand first.'); return; }
      var f;
      try { f = makeEval(src); } catch (e) { TN.setErr(ERR, e.message); return; }
      var a = parseFloat(g('a').value), b = parseFloat(g('b').value);
      if (isNaN(a) || isNaN(b)) { TN.setErr(ERR, 'Limits a and b must be numbers.'); return; }
      if (a === b) { TN.setErr(ERR, 'Limits must differ (a ≠ b).'); return; }
      var n = parseInt(g('n').value, 10);
      if (isNaN(n) || n < 1 || n > 100000) { TN.setErr(ERR, 'n must be an integer from 1 to 100000.'); return; }
      var method = g('method').value;
      var lo = Math.min(a, b), hi = Math.max(a, b), sign = a < b ? 1 : -1;
      var r;
      try { r = integrate(f, lo, hi, n, method); } catch (e) { TN.setErr(ERR, e.message); return; }
      var val = sign * r.val;
      TN.show(P + 'out');
      g('result').textContent = fmt(val);
      g('h').textContent = fmt(r.h);
      g('evals').textContent = String(r.evals);
      var names = { simpson: "Simpson's rule", trapezoid: 'Trapezoidal rule', midpoint: 'Midpoint rule' };
      var formula = method === 'simpson'
        ? '∫ ≈ h/3 · [f(x₀) + f(xₙ) + 4·Σf(x_odd) + 2·Σf(x_even)]'
        : method === 'trapezoid' ? '∫ ≈ h · [½f(x₀) + ½f(xₙ) + Σf(xᵢ)]' : '∫ ≈ h · Σf(midpoints)';
      var steps = '<ol>' +
        '<li>Using <b>' + names[method] + '</b> on [' + fmt(a) + ', ' + fmt(b) + '] with n = ' + r.n + (method === 'simpson' && n % 2 === 1 ? ' (your odd n was rounded up to the next even number)' : '') + '.</li>' +
        '<li>Step size h = (b − a)/n = ' + fmt(r.h) + '.</li>' +
        '<li>Formula: ' + TN.esc(formula) + '.</li>' +
        '<li>' + r.evals + ' function evaluations → estimate <b>' + fmt(val) + '</b>.</li>' +
        '<li>Error order: ' + (method === 'simpson' ? 'O(h⁴) — doubling n cuts the error ~16×.' : 'O(h²) — doubling n cuts the error ~4×.') + '</li>' +
        '</ol>';
      g('steps').innerHTML = steps;
      // convergence table
      var rows = '', prev = null;
      var nn = Math.min(n, 2000);
      for (var k = 0; k < 4; k++) {
        var rk = integrate(f, lo, hi, method === 'simpson' && nn % 2 ? nn + 1 : nn, method);
        var vk = sign * rk.val;
        rows += '<tr><td>' + rk.n + '</td><td>' + fmt(vk) + '</td><td>' + (prev === null ? '—' : fmt(Math.abs(vk - prev))) + '</td></tr>';
        prev = vk;
        nn *= 2;
        if (nn > 64000) break;
      }
      g('conv').innerHTML = rows;
    } catch (e) { TN.setErr(ERR, e.message || 'Could not integrate.'); }
  }
  try {
    if (!TN.el(P + 'go')) return;
    TN.on(P + 'go', 'click', go);
  } catch (e) { /* never throw on load */ }
})();
