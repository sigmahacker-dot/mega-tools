(function () {
  'use strict';
  var P = 'rpn-calculator-', ERR = P + 'error';
  var stack = [];
  function g(id) { return TN.el(P + id); }
  function fmt(v) {
    if (!isFinite(v)) return String(v);
    var s = String(parseFloat(v.toPrecision(12)));
    return s;
  }
  function render() {
    var body = g('stack');
    if (!stack.length) { body.innerHTML = '<tr><td class="muted">Stack is empty — type a number and press Enter.</td></tr>'; return; }
    var names = ['X', 'Y', 'Z', 'T'];
    var h = '';
    for (var i = stack.length - 1; i >= 0; i--) {
      var depth = stack.length - 1 - i;
      var nm = depth < 4 ? names[depth] : 'S' + (depth + 1);
      h += '<tr><td style="width:60px"><b>' + nm + '</b></td><td style="text-align:right;font-family:monospace;font-size:1.1em">' + TN.esc(fmt(stack[i])) + '</td></tr>';
    }
    body.innerHTML = h;
  }
  function pushEntry() {
    TN.clearErr(ERR);
    var s = g('entry').value.trim();
    if (!s) { TN.setErr(ERR, 'Type a number first, then press Enter to push it.'); return; }
    var v = parseFloat(s);
    if (isNaN(v)) { TN.setErr(ERR, '"' + s + '" is not a valid number.'); return; }
    stack.push(v);
    g('entry').value = '';
    render();
  }
  function applyOp(op) {
    TN.clearErr(ERR);
    if (stack.length < 2) { TN.setErr(ERR, 'Need at least two values on the stack for ' + op + '.'); return; }
    var b = stack.pop(), a = stack.pop(), r;
    if (op === '+') r = a + b;
    else if (op === '-') r = a - b;
    else if (op === '*') r = a * b;
    else if (op === '/') {
      if (b === 0) { stack.push(a, b); TN.setErr(ERR, 'Division by zero — stack unchanged.'); render(); return; }
      r = a / b;
    }
    stack.push(r);
    render();
  }
  try {
    if (!TN.el(P + 'entry')) return;
    TN.on(P + 'enter', 'click', pushEntry);
    TN.on(P + 'entry', 'keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); pushEntry(); }
    });
    var keys = TN.qsa('#' + P + 'keys [data-k]');
    for (var i = 0; i < keys.length; i++) {
      (function (b) {
        TN.on(b, 'click', function () {
          var k = b.getAttribute('data-k');
          var cur = g('entry').value;
          if (k === '.' && cur.indexOf('.') >= 0) return;
          g('entry').value = cur + k;
          g('entry').focus();
        });
      })(keys[i]);
    }
    var ops = TN.qsa('#' + P + 'keys [data-op]');
    for (var j = 0; j < ops.length; j++) {
      (function (b) {
        TN.on(b, 'click', function () { applyOp(b.getAttribute('data-op')); });
      })(ops[j]);
    }
    TN.on(P + 'neg', 'click', function () {
      var cur = g('entry').value;
      g('entry').value = cur.charAt(0) === '-' ? cur.slice(1) : '-' + cur;
    });
    TN.on(P + 'back', 'click', function () {
      var cur = g('entry').value;
      g('entry').value = cur.slice(0, -1);
    });
    TN.on(P + 'drop', 'click', function () {
      TN.clearErr(ERR);
      if (!stack.length) { TN.setErr(ERR, 'Stack is already empty.'); return; }
      stack.pop(); render();
    });
    TN.on(P + 'swap', 'click', function () {
      TN.clearErr(ERR);
      if (stack.length < 2) { TN.setErr(ERR, 'Need at least two values to swap.'); return; }
      var a = stack.pop(), b = stack.pop();
      stack.push(a, b); render();
    });
    TN.on(P + 'clear', 'click', function () { stack = []; g('entry').value = ''; TN.clearErr(ERR); render(); });
    document.addEventListener('keydown', function (e) {
      var ae = document.activeElement;
      if (ae && ae.id === P + 'entry') return;
      if (!g('entry') || !g('entry').offsetParent) return;
      if (/^[0-9.]$/.test(e.key)) { g('entry').value += e.key; }
      else if (e.key === 'Enter') pushEntry();
      else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') applyOp(e.key);
      else if (e.key === 'Backspace') { g('entry').value = g('entry').value.slice(0, -1); }
      else if (e.key === 'Escape') { stack = []; g('entry').value = ''; TN.clearErr(ERR); render(); }
    });
    render();
  } catch (e) { /* never throw on load */ }
})();
