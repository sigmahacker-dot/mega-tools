/* IEEE 754 32-bit converter via DataView, both directions. */
(function () {
  'use strict';
  var SLUG = 'ieee-754-converter';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function bitsOf(f) {
    var buf = new ArrayBuffer(4), dv = new DataView(buf);
    dv.setFloat32(0, f);
    var u = dv.getUint32(0);
    var s = '';
    for (var i = 31; i >= 0; i--) s += (u >>> i) & 1 ? '1' : '0';
    return { bits: s, u: u };
  }
  function floatOf(u) {
    var buf = new ArrayBuffer(4), dv = new DataView(buf);
    dv.setUint32(0, u >>> 0);
    return dv.getFloat32(0);
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var mode = $(SLUG + '-mode').value;
    var raw = $(SLUG + '-in').value.trim();
    var u, val, lines = [];
    if (mode === 'd2h') {
      val = parseFloat(raw);
      if (isNaN(val)) { err('Enter a decimal number.'); return; }
      u = bitsOf(val).u;
      lines.push('Stored as 32-bit float (may round the input): ' + floatOf(u));
    } else {
      var hex = raw.toUpperCase().replace(/^0X/, '');
      if (!/^[0-9A-F]{1,8}$/.test(hex)) { err('Enter up to 8 hex digits.'); return; }
      u = parseInt(hex, 16) >>> 0;
      val = floatOf(u);
    }
    var b = bitsOf(val).bits;
    var sign = b[0], exp = b.slice(1, 9), mant = b.slice(9);
    var expVal = parseInt(exp, 2), mantVal = parseInt(mant, 2);
    var hexOut = ('00000000' + u.toString(16).toUpperCase()).slice(-8);
    lines.push('');
    lines.push('Bits:  ' + sign + ' ' + exp + ' ' + mant);
    lines.push('       ^   ^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^');
    lines.push('       |   exponent mantissa (fraction)');
    lines.push('       sign (' + sign + ' = ' + (sign === '1' ? 'negative' : 'positive') + ')');
    var desc;
    if (expVal === 255) desc = mantVal === 0 ? (sign === '1' ? '-Infinity' : '+Infinity') : 'NaN (not a number)';
    else if (expVal === 0) desc = 'subnormal: \u00B1 0.' + mant + '\u2082 \u00D7 2^-126';
    else desc = 'value = (-1)^' + sign + ' \u00D7 1.' + mant + '\u2082 \u00D7 2^(' + expVal + '\u2212127=' + (expVal - 127) + ')';
    lines.push('Exponent field = ' + expVal + ' (bias 127 \u2192 true exponent ' + (expVal === 0 || expVal === 255 ? 'special' : expVal - 127) + ')');
    lines.push(desc);
    $(SLUG + '-hex').textContent = hexOut;
    $(SLUG + '-out').textContent = String(val);
    $(SLUG + '-bits').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-mode', 'change', function () {
      var d2h = $(SLUG + '-mode').value === 'd2h';
      $(SLUG + '-inlabel').textContent = d2h ? 'Decimal number' : 'Hex (8 digits)';
      $(SLUG + '-in').value = d2h ? '-12.75' : 'C14C0000';
      calc();
    });
    TN.on(SLUG + '-in', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();