(function () {
  'use strict';
  var P = 'gray-code-converter-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function bin2gray(b) {
    var res = b.charAt(0), steps = ['Keep MSB: <code>' + b.charAt(0) + '</code>.'];
    for (var i = 1; i < b.length; i++) {
      var x = (b.charCodeAt(i - 1) - 48) ^ (b.charCodeAt(i) - 48);
      res += x;
      steps.push('G<sub>' + (b.length - i) + '</sub> = B<sub>' + (b.length - i + 1) + '</sub> ⊕ B<sub>' + (b.length - i) + '</sub> = ' + b.charAt(i - 1) + ' ⊕ ' + b.charAt(i) + ' = <b>' + x + '</b>');
    }
    return { out: res, steps: steps };
  }
  function gray2bin(gr) {
    var res = gr.charAt(0), steps = ['Keep MSB: <code>' + gr.charAt(0) + '</code>.'];
    for (var i = 1; i < gr.length; i++) {
      var x = (res.charCodeAt(i - 1) - 48) ^ (gr.charCodeAt(i) - 48);
      res += x;
      steps.push('B<sub>' + (gr.length - i) + '</sub> = B<sub>' + (gr.length - i + 1) + '</sub> ⊕ G<sub>' + (gr.length - i) + '</sub> = ' + res.charAt(i - 1) + ' ⊕ ' + gr.charAt(i) + ' = <b>' + x + '</b>');
    }
    return { out: res, steps: steps };
  }
  function convert() {
    try {
      TN.clearErr(ERR);
      var dir = g('dir').value, mode = g('mode').value;
      var raw = g('in').value.trim();
      if (!raw) { TN.setErr(ERR, 'Type an input value first.'); return; }
      var bits, dec;
      if (mode === 'dec') {
        if (!/^\d+$/.test(raw)) { TN.setErr(ERR, 'Decimal mode needs a non-negative integer.'); return; }
        dec = parseInt(raw, 10);
        if (dec > 1048575) { TN.setErr(ERR, 'Keep decimal input ≤ 1,048,575 (20 bits).'); return; }
        bits = dec.toString(2);
      } else {
        if (!/^[01]+$/.test(raw)) { TN.setErr(ERR, 'Bit-string mode needs only 0s and 1s.'); return; }
        if (raw.length > 32) { TN.setErr(ERR, 'Keep the bit string to 32 bits or fewer.'); return; }
        bits = raw.replace(/^0+(?=[01])/, '');
        if (!bits) bits = '0';
        dec = parseInt(bits, 2);
      }
      var r = dir === 'b2g' ? bin2gray(bits) : gray2bin(bits);
      var outDec = parseInt(r.out, 2);
      TN.show(P + 'out');
      g('out-bits').textContent = r.out;
      g('out-bits').setAttribute('data-r', r.out);
      g('out-l').textContent = dir === 'b2g' ? 'Gray code' : 'Binary';
      g('out-dec').textContent = String(outDec);
      var intro = dir === 'b2g'
        ? 'Binary <code>' + TN.esc(bits) + '</code> → Gray: G = B ⊕ (B ≫ 1).'
        : 'Gray <code>' + TN.esc(bits) + '</code> → Binary: cascade XOR from the MSB.';
      g('steps').innerHTML = '<p>' + intro + '</p><ol><li>' + r.steps.join('</li><li>') + '</li></ol>';
      var th = '';
      for (var n = 0; n <= 15; n++) {
        var b4 = n.toString(2).padStart(4, '0');
        var gr4 = bin2gray(b4).out;
        th += '<tr' + (n === outDec % 16 && bits.length <= 4 ? ' style="background:#16653422"' : '') + '><td>' + n + '</td><td><code>' + b4 + '</code></td><td><code>' + gr4 + '</code></td></tr>';
      }
      g('table').innerHTML = th;
    } catch (e) { TN.setErr(ERR, e.message || 'Could not convert.'); }
  }
  try {
    if (!TN.el(P + 'convert')) return;
    TN.on(P + 'convert', 'click', convert);
    TN.on(P + 'dir', 'change', convert);
    TN.on(P + 'mode', 'change', function () {
      g('in').placeholder = g('mode').value === 'dec' ? 'e.g. 22' : 'e.g. 10110';
      TN.hide(P + 'out');
    });
    TN.on(P + 'copy', 'click', function () {
      var r = g('out-bits').getAttribute('data-r');
      if (r) TN.copy(r);
    });
  } catch (e) { /* never throw on load */ }
})();
