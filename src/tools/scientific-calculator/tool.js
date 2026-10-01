(function () {
  'use strict';
  var ERR = 'scientific-calculator-error';
  var DISP = 'scientific-calculator-display';
  var deg = true;
  var history = [];
  var PREC = { '+': 2, '-': 2, '*': 3, '/': 3, '^': 4, 'neg': 4 };

  function isDigit(c) { return c >= '0' && c <= '9'; }

  function tokenize(s) {
    var toks = [], i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === ' ' || c === '\t') { i++; continue; }
      if (isDigit(c) || c === '.') {
        var j = i, dot = false;
        while (j < n && (isDigit(s[j]) || (s[j] === '.' && !dot))) {
          if (s[j] === '.') dot = true;
          j++;
        }
        var num = parseFloat(s.slice(i, j));
        if (isNaN(num)) throw new Error('Invalid number.');
        toks.push({ t: 'num', v: num });
        i = j;
        continue;
      }
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === 'π') {
        if (c === 'π') { toks.push({ t: 'num', v: Math.PI }); i++; continue; }
        var k = i;
        while (k < n && /[a-zA-Z]/.test(s[k])) k++;
        var name = s.slice(i, k).toLowerCase();
        i = k;
        if (name === 'pi') { toks.push({ t: 'num', v: Math.PI }); continue; }
        if (name === 'e') { toks.push({ t: 'num', v: Math.E }); continue; }
        if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].indexOf(name) >= 0) {
          toks.push({ t: 'fn', v: name }); continue;
        }
        throw new Error('Unknown function "' + name + '".');
      }
      if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^') {
        toks.push({ t: 'op', v: c }); i++; continue;
      }
      if (c === '(') { toks.push({ t: 'lp' }); i++; continue; }
      if (c === ')') { toks.push({ t: 'rp' }); i++; continue; }
      if (c === '!' || c === '%') { toks.push({ t: 'post', v: c }); i++; continue; }
      throw new Error('Unexpected character "' + c + '".');
    }
    // Mark unary minus/plus
    var out = [];
    for (var q = 0; q < toks.length; q++) {
      var tk = toks[q];
      if (tk.t === 'op' && (tk.v === '-' || tk.v === '+')) {
        var prev = out[out.length - 1];
        if (!prev || prev.t === 'op' || prev.t === 'lp' || prev.t === 'fn' || prev.t === 'uop') {
          if (tk.v === '-') out.push({ t: 'uop', v: 'neg' });
          continue; // unary plus is a no-op
        }
      }
      out.push(tk);
    }
    return out;
  }

  function toRPN(toks) {
    var out = [], st = [];
    toks.forEach(function (tk) {
      if (tk.t === 'num') { out.push(tk); return; }
      if (tk.t === 'fn' || tk.t === 'uop') { st.push(tk); return; }
      if (tk.t === 'post') { out.push(tk); return; }
      if (tk.t === 'op') {
        while (st.length) {
          var top = st[st.length - 1];
          if (top.t === 'lp') break;
          var pt = top.t === 'fn' ? 7 : PREC[top.t === 'uop' ? 'neg' : top.v];
          var pc = PREC[tk.v];
          var right = tk.v === '^';
          if (pt > pc || (pt === pc && !right)) { out.push(st.pop()); } else { break; }
        }
        st.push(tk);
        return;
      }
      if (tk.t === 'lp') { st.push(tk); return; }
      if (tk.t === 'rp') {
        var found = false;
        while (st.length) {
          var x = st.pop();
          if (x.t === 'lp') { found = true; break; }
          out.push(x);
        }
        if (!found) throw new Error('Mismatched parentheses.');
        if (st.length && st[st.length - 1].t === 'fn') out.push(st.pop());
        return;
      }
    });
    while (st.length) {
      var y = st.pop();
      if (y.t === 'lp') throw new Error('Mismatched parentheses.');
      out.push(y);
    }
    return out;
  }

  function applyFn(name, x) {
    switch (name) {
      case 'sin': return Math.sin(deg ? x * Math.PI / 180 : x);
      case 'cos': return Math.cos(deg ? x * Math.PI / 180 : x);
      case 'tan': {
        var v = deg ? x * Math.PI / 180 : x;
        if (Math.abs(Math.cos(v)) < 1e-12) throw new Error('tan is undefined at this angle.');
        return Math.tan(v);
      }
      case 'log':
        if (x <= 0) throw new Error('log needs a positive number.');
        return Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10;
      case 'ln':
        if (x <= 0) throw new Error('ln needs a positive number.');
        return Math.log(x);
      case 'sqrt':
        if (x < 0) throw new Error('sqrt of a negative number.');
        return Math.sqrt(x);
    }
    throw new Error('Unknown function.');
  }

  function evalRPN(rpn) {
    var st = [];
    rpn.forEach(function (tk) {
      if (tk.t === 'num') { st.push(tk.v); return; }
      if (tk.t === 'uop') {
        var a = st.pop();
        if (a === undefined) throw new Error('Invalid expression.');
        st.push(-a); return;
      }
      if (tk.t === 'post') {
        var b = st.pop();
        if (b === undefined) throw new Error('Invalid expression.');
        if (tk.v === '!') {
          if (b < 0 || Math.floor(b) !== b) throw new Error('Factorial needs a non-negative integer.');
          if (b > 170) throw new Error('Factorial result too large.');
          var f = 1;
          for (var i = 2; i <= b; i++) f *= i;
          st.push(f);
        } else {
          st.push(b / 100);
        }
        return;
      }
      if (tk.t === 'fn') {
        var c = st.pop();
        if (c === undefined) throw new Error('Missing argument for ' + tk.v + '.');
        st.push(applyFn(tk.v, c));
        return;
      }
      if (tk.t === 'op') {
        var d = st.pop(), e = st.pop();
        if (d === undefined || e === undefined) throw new Error('Invalid expression.');
        var r;
        switch (tk.v) {
          case '+': r = e + d; break;
          case '-': r = e - d; break;
          case '*': r = e * d; break;
          case '/':
            if (d === 0) throw new Error('Division by zero.');
            r = e / d; break;
          case '^':
            r = Math.pow(e, d);
            if (isNaN(r)) throw new Error('Invalid power.');
            break;
          default: throw new Error('Invalid expression.');
        }
        st.push(r);
        return;
      }
      throw new Error('Invalid expression.');
    });
    if (st.length !== 1) throw new Error('Invalid expression.');
    return st[0];
  }

  function fmtRes(v) {
    if (!isFinite(v)) throw new Error('Result is not finite.');
    var r = Math.abs(v) < 1e-12 ? 0 : v;
    return parseFloat(r.toPrecision(12)).toString();
  }

  function calc() {
    var el = TN.el(DISP);
    if (!el) return;
    TN.clearErr(ERR);
    try {
      var res = fmtRes(evalRPN(toRPN(tokenize(el.value))));
      if (!tokenize(el.value).length) throw new Error('Enter an expression first.');
      TN.el('scientific-calculator-value').textContent = res;
      history.unshift({ e: el.value, r: res });
      if (history.length > 20) history.pop();
      renderHistory();
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid expression.');
    }
  }

  function renderHistory() {
    var ul = TN.el('scientific-calculator-history');
    if (!ul) return;
    ul.innerHTML = '';
    history.forEach(function (h) {
      var li = document.createElement('li');
      li.textContent = h.e + ' = ' + h.r;
      ul.appendChild(li);
    });
  }

  var KEYS = [
    ['7', '8', '9', '÷', '('],
    ['4', '5', '6', '×', ')'],
    ['1', '2', '3', '−', '^'],
    ['0', '.', '%', '!', '='],
    ['sin', 'cos', 'tan', '√', 'log'],
    ['ln', 'π', 'e', '1/x', 'C']
  ];

  function onKey(label) {
    var d = TN.el(DISP);
    if (!d) return;
    if (label === '=') { calc(); return; }
    if (label === 'C') { d.value = ''; TN.clearErr(ERR); return; }
    if (label === '1/x') {
      if (d.value.trim()) d.value = '(1/(' + d.value + '))';
      d.focus();
      return;
    }
    var map = { '÷': '/', '×': '*', '−': '-', '√': 'sqrt(', 'π': 'π' };
    var t = map[label] || label;
    if (['sin', 'cos', 'tan', 'log', 'ln'].indexOf(label) >= 0) t = label + '(';
    d.value += t;
    d.focus();
  }

  try {
    var pad = TN.el('scientific-calculator-pad');
    if (pad) {
      KEYS.forEach(function (row) {
        row.forEach(function (label) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'btn btn-outline btn-sm';
          b.textContent = label;
          b.addEventListener('click', function () { onKey(label); });
          pad.appendChild(b);
        });
      });
    }
    TN.on('scientific-calculator-equals', 'click', calc);
    TN.on('scientific-calculator-mode', 'click', function () {
      deg = !deg;
      var m = TN.el('scientific-calculator-mode');
      if (m) m.textContent = deg ? 'DEG' : 'RAD';
    });
    TN.on('scientific-calculator-back', 'click', function () {
      var el = TN.el(DISP);
      if (el) el.value = el.value.slice(0, -1);
    });
    TN.on(DISP, 'keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); calc(); }
    });
  } catch (e) { /* never throw on load */ }
})();
