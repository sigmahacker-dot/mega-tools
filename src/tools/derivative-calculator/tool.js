(function () {
  'use strict';
  var P = 'derivative-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  var FUNCS = { sin: 1, cos: 1, tan: 1, exp: 1, ln: 1, sqrt: 1 };
  // ---- tokenizer ----
  function tokenize(s) {
    var toks = [], i = 0;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        var j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        var num = s.slice(i, j);
        if (!/^\d+(\.\d+)?$/.test(num)) throw new Error('Bad number "' + num + '".');
        toks.push({ t: 'num', v: parseFloat(num) }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        var k = i;
        while (k < s.length && /[a-zA-Z]/.test(s[k])) k++;
        var w = s.slice(i, k).toLowerCase();
        if (w === 'x') toks.push({ t: 'var' });
        else if (w === 'e') toks.push({ t: 'num', v: Math.E });
        else if (w === 'pi') toks.push({ t: 'num', v: Math.PI });
        else if (FUNCS[w]) toks.push({ t: 'func', v: w });
        else throw new Error('Unknown name "' + w + '". Use x, e, pi, sin, cos, tan, exp, ln, sqrt.');
        i = k; continue;
      }
      if ('+-*/^()'.indexOf(c) >= 0) { toks.push({ t: c }); i++; continue; }
      throw new Error('Unexpected character "' + c + '".');
    }
    // implicit multiplication: num/var/) followed by var/func/num/(
    var out = [];
    for (var q = 0; q < toks.length; q++) {
      out.push(toks[q]);
      if (q + 1 < toks.length) {
        var a = toks[q].t, b = toks[q + 1].t;
        var left = (a === 'num' || a === 'var' || a === ')');
        var right = (b === 'num' || b === 'var' || b === 'func' || b === '(');
        if (left && right) out.push({ t: '*' });
      }
    }
    return out;
  }
  // ---- parser ----
  function parse(toks) {
    var pos = 0;
    function peek() { return toks[pos]; }
    function next() { return toks[pos++]; }
    function expr() {
      var n = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        var op = next().t, r = term();
        n = op === '+' ? { t: 'add', l: n, r: r } : { t: 'sub', l: n, r: r };
      }
      return n;
    }
    function term() {
      var n = unary();
      while (peek() && (peek().t === '*' || peek().t === '/')) {
        var op = next().t, r = unary();
        n = op === '*' ? { t: 'mul', l: n, r: r } : { t: 'div', l: n, r: r };
      }
      return n;
    }
    function unary() {
      if (peek() && peek().t === '-') { next(); return { t: 'mul', l: { t: 'num', v: -1 }, r: unary() }; }
      if (peek() && peek().t === '+') { next(); return unary(); }
      return power();
    }
    function power() {
      var n = atom();
      if (peek() && peek().t === '^') {
        next();
        var e = unary();
        if (e.t !== 'num') throw new Error('Only constant exponents are supported (e.g. x^2, not x^x).');
        n = { t: 'pow', b: n, e: e.v };
      }
      return n;
    }
    function atom() {
      var tk = next();
      if (!tk) throw new Error('Unexpected end of expression.');
      if (tk.t === 'num') return { t: 'num', v: tk.v };
      if (tk.t === 'var') return { t: 'var' };
      if (tk.t === 'func') {
        var f = tk.v;
        if (!peek() || peek().t !== '(') throw new Error('Expected ( after ' + f + '.');
        next();
        var a = expr();
        if (!peek() || peek().t !== ')') throw new Error('Missing ) after ' + f + '(.');
        next();
        return { t: f, a: a };
      }
      if (tk.t === '(') {
        var e = expr();
        if (!peek() || peek().t !== ')') throw new Error('Missing closing parenthesis.');
        next();
        return e;
      }
      throw new Error('Unexpected token in expression.');
    }
    var n = expr();
    if (pos < toks.length) throw new Error('Could not parse the whole expression.');
    return n;
  }
  // ---- differentiation ----
  var stepLog = [];
  function N(v) { return { t: 'num', v: v }; }
  function diff(n) {
    switch (n.t) {
      case 'num': return N(0);
      case 'var': return N(1);
      case 'add': return { t: 'add', l: diff(n.l), r: diff(n.r) };
      case 'sub': return { t: 'sub', l: diff(n.l), r: diff(n.r) };
      case 'mul':
        stepLog.push({ rule: 'Product rule: (uv)′ = u′v + uv′', u: str(n.l), v: str(n.r) });
        return { t: 'add', l: { t: 'mul', l: diff(n.l), r: n.r }, r: { t: 'mul', l: n.l, r: diff(n.r) } };
      case 'div':
        stepLog.push({ rule: 'Quotient rule: (u/v)′ = (u′v − uv′)/v²', u: str(n.l), v: str(n.r) });
        return { t: 'div', l: { t: 'sub', l: { t: 'mul', l: diff(n.l), r: n.r }, r: { t: 'mul', l: n.l, r: diff(n.r) } }, r: { t: 'pow', b: n.r, e: 2 } };
      case 'pow': {
        var e = n.e;
        if (e === 0) return N(0);
        stepLog.push({ rule: 'Power rule: (u^' + e + ')′ = ' + e + '·u^' + (e - 1) + '·u′', u: str(n.b), v: '' });
        return { t: 'mul', l: N(e), r: { t: 'mul', l: { t: 'pow', b: n.b, e: e - 1 }, r: diff(n.b) } };
      }
      case 'sin': stepLog.push({ rule: 'Chain rule: sin(u)′ = cos(u)·u′', u: str(n.a), v: '' }); return { t: 'mul', l: { t: 'cos', a: n.a }, r: diff(n.a) };
      case 'cos': stepLog.push({ rule: 'Chain rule: cos(u)′ = −sin(u)·u′', u: str(n.a), v: '' }); return { t: 'mul', l: N(-1), r: { t: 'mul', l: { t: 'sin', a: n.a }, r: diff(n.a) } };
      case 'tan': stepLog.push({ rule: 'Chain rule: tan(u)′ = sec²(u)·u′ = u′/cos²(u)', u: str(n.a), v: '' }); return { t: 'mul', l: { t: 'div', l: N(1), r: { t: 'pow', b: { t: 'cos', a: n.a }, e: 2 } }, r: diff(n.a) };
      case 'exp': stepLog.push({ rule: 'Chain rule: exp(u)′ = exp(u)·u′', u: str(n.a), v: '' }); return { t: 'mul', l: { t: 'exp', a: n.a }, r: diff(n.a) };
      case 'ln': stepLog.push({ rule: 'Chain rule: ln(u)′ = u′/u', u: str(n.a), v: '' }); return { t: 'div', l: diff(n.a), r: n.a };
      case 'sqrt': stepLog.push({ rule: 'Chain rule: sqrt(u)′ = u′/(2·sqrt(u))', u: str(n.a), v: '' }); return { t: 'div', l: diff(n.a), r: { t: 'mul', l: N(2), r: { t: 'sqrt', a: n.a } } };
    }
    throw new Error('Cannot differentiate.');
  }
  // ---- simplification ----
  function isNum(n, v) { return n.t === 'num' && (v === undefined || n.v === v); }
  function simp(n) {
    if (!n || n.t === 'num' || n.t === 'var') return n;
    if (n.t === 'sin' || n.t === 'cos' || n.t === 'tan' || n.t === 'exp' || n.t === 'ln' || n.t === 'sqrt') { n.a = simp(n.a); return n; }
    if (n.t === 'pow') {
      n.b = simp(n.b);
      if (n.e === 0) return N(1);
      if (n.e === 1) return n.b;
      if (isNum(n.b)) return N(Math.pow(n.b.v, n.e));
      return n;
    }
    n.l = simp(n.l); n.r = simp(n.r);
    var L = n.l, R = n.r;
    if (n.t === 'add') {
      if (isNum(L, 0)) return R;
      if (isNum(R, 0)) return L;
      if (isNum(L) && isNum(R)) return N(L.v + R.v);
      return n;
    }
    if (n.t === 'sub') {
      if (isNum(R, 0)) return L;
      if (isNum(L) && isNum(R)) return N(L.v - R.v);
      return n;
    }
    if (n.t === 'mul') {
      if (isNum(L, 0) || isNum(R, 0)) return N(0);
      if (isNum(L, 1)) return R;
      if (isNum(R, 1)) return L;
      if (isNum(L) && isNum(R)) return N(L.v * R.v);
      if (isNum(L, -1) && R.t === 'mul' && isNum(R.l)) return { t: 'mul', l: N(-R.l.v), r: R.r };
      if (isNum(L) && R.t === 'mul' && isNum(R.l)) return { t: 'mul', l: N(L.v * R.l.v), r: R.r };
      if (isNum(R) && L.t === 'mul' && isNum(L.l)) return { t: 'mul', l: N(L.l.v * R.v), r: L.r };
      if (isNum(L) && R.t === 'div' && isNum(R.l)) return { t: 'div', l: N(L.v * R.l.v), r: R.r };
      return n;
    }
    if (n.t === 'div') {
      if (isNum(L, 0)) return N(0);
      if (isNum(R, 1)) return L;
      if (isNum(L) && isNum(R)) return N(L.v / R.v);
      return n;
    }
    return n;
  }
  // ---- stringify ----
  var PRECN = { add: 1, sub: 1, mul: 2, div: 2, pow: 3, num: 4, var: 4, sin: 4, cos: 4, tan: 4, exp: 4, ln: 4, sqrt: 4 };
  function str(n) {
    function par(node, parentPrec, right) {
      var s = str(node);
      var p = PRECN[node.t] || 4;
      if (p < parentPrec || (right && p === parentPrec && (node.t === 'sub' || node.t === 'div' || node.t === 'add'))) return '(' + s + ')';
      return s;
    }
    switch (n.t) {
      case 'num': {
        var v = parseFloat(n.v.toPrecision(10));
        return (v < 0 ? '(' + v + ')' : String(v));
      }
      case 'var': return 'x';
      case 'add': return par(n.l, 1) + ' + ' + par(n.r, 1);
      case 'sub': return par(n.l, 1) + ' − ' + par(n.r, 1, true);
      case 'mul': {
        var ls = par(n.l, 2), rs = par(n.r, 2, true);
        if (n.l.t === 'num' && parseFloat(n.l.v.toPrecision(10)) === -1) return '−' + rs;
        return ls + '·' + rs;
      }
      case 'div': return par(n.l, 2) + '/' + par(n.r, 2, true);
      case 'pow': return par(n.b, 3) + '^' + n.e;
      case 'sin': return 'sin(' + str(n.a) + ')';
      case 'cos': return 'cos(' + str(n.a) + ')';
      case 'tan': return 'tan(' + str(n.a) + ')';
      case 'exp': return 'exp(' + str(n.a) + ')';
      case 'ln': return 'ln(' + str(n.a) + ')';
      case 'sqrt': return 'sqrt(' + str(n.a) + ')';
    }
    return '?';
  }
  function splitTerms(n) {
    var terms = [];
    (function walk(x, sign) {
      if (x.t === 'add') { walk(x.l, sign); walk(x.r, sign); }
      else if (x.t === 'sub') { walk(x.l, sign); walk(x.r, -sign); }
      else terms.push({ node: x, sign: sign });
    })(n, 1);
    return terms;
  }
  function differentiate() {
    try {
      TN.clearErr(ERR);
      var s = g('fn').value.trim();
      if (!s) { TN.setErr(ERR, 'Type a function of x first.'); return; }
      var tree = parse(tokenize(s));
      stepLog = [];
      var d = diff(tree);
      for (var i = 0; i < 3; i++) d = simp(d);
      var terms = splitTerms(tree);
      var sh = '<p>Differentiate term by term:</p><ol>';
      var tIdx = 0;
      var relevant = stepLog.slice();
      terms.forEach(function (tm, ix) {
        stepLog = [];
        var td = diff(tm.node);
        for (var k = 0; k < 3; k++) td = simp(td);
        var ds = str(td);
        if (tm.sign < 0) ds = '−(' + ds + ')';
        var label = (ix > 0 ? (tm.sign > 0 ? '+' : '−') : (tm.sign < 0 ? '−' : '')) + ' d/dx[' + str(tm.node) + ']';
        var rules = stepLog.length ? ' — ' + stepLog.map(function (r) { return r.rule; }).join('; ') : ' — constant/linear term';
        sh += '<li><code>' + TN.esc(label) + '</code> = <code>' + TN.esc(ds) + '</code>' + TN.esc(rules) + '</li>';
        tIdx++;
      });
      sh += '</ol><p>Combine and simplify → <b><code>' + TN.esc(str(d)) + '</code></b></p>';
      TN.show(P + 'out');
      g('result').textContent = str(d);
      g('result').setAttribute('data-r', str(d));
      g('steps').innerHTML = sh;
    } catch (e) { TN.setErr(ERR, e.message || 'Could not differentiate.'); }
  }
  try {
    if (!TN.el(P + 'diff')) return;
    TN.on(P + 'diff', 'click', differentiate);
    TN.on(P + 'fn', 'keydown', function (e) { if (e.key === 'Enter') differentiate(); });
    TN.on(P + 'copy', 'click', function () {
      var r = g('result').getAttribute('data-r');
      if (r) TN.copy(r);
    });
  } catch (e) { /* never throw on load */ }
})();
