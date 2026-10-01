(function () {
  'use strict';
  var P = 'postfix-converter-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  var PREC = { '^': 4, '*': 3, '/': 3, '+': 2, '-': 2 };
  var RIGHT = { '^': true };
  function isOp(t) { return PREC.hasOwnProperty(t); }
  function tokenize(s) {
    var toks = [], i = 0, prev = null; // prev: 'num' | 'op' | '(' | ')' | null
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        var j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        var num = s.slice(i, j);
        if ((num.match(/\./g) || []).length > 1 || num === '.') throw new Error('Bad number: "' + num + '".');
        toks.push(num); prev = 'num'; i = j; continue;
      }
      if (c === '-' && (prev === null || prev === 'op' || prev === '(')) {
        // unary minus: merge into number if a number follows, else 0 - (...)
        var k = i + 1;
        while (k < s.length && /\s/.test(s[k])) k++;
        if (k < s.length && /[0-9.]/.test(s[k])) {
          var j2 = k;
          while (j2 < s.length && /[0-9.]/.test(s[j2])) j2++;
          var num2 = s.slice(k, j2);
          if ((num2.match(/\./g) || []).length > 1) throw new Error('Bad number: "' + num2 + '".');
          toks.push('-' + num2); prev = 'num'; i = j2; continue;
        }
        toks.push('0'); toks.push('-'); prev = 'op'; i++; continue;
      }
      if ('+-*/^()'.indexOf(c) >= 0) { toks.push(c); prev = (c === '(') ? '(' : (c === ')' ? ')' : 'op'); i++; continue; }
      throw new Error('Unexpected character: "' + c + '". Use digits, + - * / ^ and parentheses.');
    }
    return toks;
  }
  function convert() {
    try {
      TN.clearErr(ERR);
      var expr = g('expr').value.trim();
      if (!expr) { TN.setErr(ERR, 'Type an infix expression first.'); return; }
      var toks = tokenize(expr);
      var out = [], stack = [], steps = [];
      function snap(tok, action) {
        steps.push({ tok: tok, action: action, stack: stack.slice().reverse().join(' ') || '—', out: out.join(' ') || '—' });
      }
      for (var i = 0; i < toks.length; i++) {
        var t = toks[i];
        if (/^-?[0-9.]/.test(t)) { out.push(t); snap(t, 'Number → push to output'); }
        else if (isOp(t)) {
          while (stack.length && isOp(stack[stack.length - 1]) &&
            ((RIGHT[t] && PREC[t] < PREC[stack[stack.length - 1]]) ||
             (!RIGHT[t] && PREC[t] <= PREC[stack[stack.length - 1]]))) {
            out.push(stack.pop());
          }
          stack.push(t); snap(t, 'Operator → push onto stack (popped higher/equal precedence first)');
        }
        else if (t === '(') { stack.push(t); snap(t, 'Left parenthesis → push onto stack'); }
        else if (t === ')') {
          var found = false;
          while (stack.length) {
            var x = stack.pop();
            if (x === '(') { found = true; break; }
            out.push(x);
          }
          if (!found) throw new Error('Mismatched parentheses: ")" without "(".');
          snap(t, 'Right parenthesis → pop to output until "("');
        }
      }
      while (stack.length) {
        var r = stack.pop();
        if (r === '(') throw new Error('Mismatched parentheses: "(" without ")".');
        out.push(r);
      }
      snap('—', 'End of input → drain remaining operators to output');
      var result = out.join(' ');
      TN.show(P + 'out');
      g('result').textContent = result;
      g('result').setAttribute('data-r', result);
      g('steps').innerHTML = steps.map(function (s, ix) {
        return '<tr><td>' + (ix + 1) + '</td><td><code>' + TN.esc(s.tok) + '</code></td><td>' + TN.esc(s.action) + '</td><td><code>' + TN.esc(s.stack) + '</code></td><td><code>' + TN.esc(s.out) + '</code></td></tr>';
      }).join('');
    } catch (e) { TN.setErr(ERR, e.message || 'Could not convert. Check the expression.'); }
  }
  try {
    if (!TN.el(P + 'convert')) return;
    TN.on(P + 'convert', 'click', convert);
    TN.on(P + 'expr', 'keydown', function (e) { if (e.key === 'Enter') convert(); });
    TN.on(P + 'clear', 'click', function () { g('expr').value = ''; TN.hide(P + 'out'); TN.clearErr(ERR); });
    TN.on(P + 'copy', 'click', function () {
      var r = g('result').getAttribute('data-r') || '';
      if (r) TN.copy(r);
    });
  } catch (e) { /* never throw on load */ }
})();
