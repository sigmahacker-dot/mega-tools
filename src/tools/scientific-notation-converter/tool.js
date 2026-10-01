/* Scientific / engineering notation converter. */
(function () {
  'use strict';
  var SLUG = 'scientific-notation-converter';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function sup(n) {
    var map = { '-': '\u207B', '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079' };
    return String(n).split('').map(function (c) { return map[c] || c; }).join('');
  }
  function pretty(a, b) { return a + ' \u00D7 10' + sup(b); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var mode = $(SLUG + '-mode').value;
    var raw = $(SLUG + '-x').value.trim();
    var lines = [];
    if (mode === 'std-sci' || mode === 'std-eng') {
      if (!/^-?\d*(\.\d+)?$/.test(raw) || raw === '' || raw === '-') { err('Enter a standard number.'); return; }
      var v = parseFloat(raw);
      if (v === 0) {
        $(SLUG + '-out').textContent = '0';
        $(SLUG + '-steps').textContent = 'Zero is 0 in every notation.';
        return;
      }
      var e = Math.floor(Math.log10(Math.abs(v)));
      var a, be;
      if (mode === 'std-sci') {
        be = e; a = v / Math.pow(10, e);
        lines.push('Move the decimal point ' + Math.abs(e) + ' place' + (Math.abs(e) === 1 ? '' : 's') + ' ' + (e >= 0 ? 'left' : 'right') + ' so 1 \u2264 |a| < 10.');
      } else {
        be = Math.floor(e / 3) * 3; a = v / Math.pow(10, be);
        lines.push('Engineering notation forces the exponent to a multiple of 3 (matching SI prefixes).');
        lines.push('Nearest multiple of 3 \u2264 ' + e + ' is ' + be + '; move the decimal ' + Math.abs(be) + ' places ' + (be >= 0 ? 'left' : 'right') + '.');
      }
      var astr = parseFloat(a.toPrecision(10)).toString();
      $(SLUG + '-out').textContent = pretty(astr, be);
      lines.push('Result: ' + pretty(astr, be));
      lines.push('Check: ' + astr + ' \u00D7 10^' + be + ' = ' + (a * Math.pow(10, be)));
    } else {
      var aa = parseFloat(raw);
      var bb = parseInt($(SLUG + '-b').value, 10);
      if (isNaN(aa)) { err('Enter the coefficient a.'); return; }
      if (isNaN(bb)) { err('Enter the exponent b.'); return; }
      var val = aa * Math.pow(10, bb);
      var label = mode === 'sci-std' ? 'scientific' : 'engineering';
      lines.push('Standard form = a \u00D7 10^b = ' + aa + ' \u00D7 10^' + bb);
      lines.push('Move the decimal point ' + Math.abs(bb) + ' place' + (Math.abs(bb) === 1 ? '' : 's') + ' ' + (bb >= 0 ? 'right' : 'left') + '.');
      $(SLUG + '-out').textContent = String(val);
      lines.push('Result: ' + val);
    }
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  function syncMode() {
    var rev = $(SLUG + '-mode').value === 'sci-std' || $(SLUG + '-mode').value === 'eng-std';
    $(SLUG + '-bwrap').classList.toggle('hidden', !rev);
    $(SLUG + '-x').previousElementSibling.textContent = rev ? 'Coefficient a' : 'Number';
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-mode', 'change', function () { syncMode(); calc(); });
    TN.on(SLUG + '-x', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-b', 'input', TN.debounce(calc, 400));
    syncMode(); calc();
  } catch (e) {}
})();