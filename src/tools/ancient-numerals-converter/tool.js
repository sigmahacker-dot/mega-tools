(function () {
  'use strict';
  var P = 'ancient-numerals-converter-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  var ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  function toRoman(n) {
    var s = '';
    for (var i = 0; i < ROMAN.length; i++) while (n >= ROMAN[i][0]) { s += ROMAN[i][1]; n -= ROMAN[i][0]; }
    return s;
  }
  function fromRoman(s) {
    s = s.toUpperCase().replace(/\s+/g, '');
    if (!/^[MDCLXVI]+$/.test(s)) throw new Error('Roman numerals use only M, D, C, L, X, V, I.');
    var val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    var total = 0;
    for (var i = 0; i < s.length; i++) {
      var v = val[s[i]], nx = i + 1 < s.length ? val[s[i + 1]] : 0;
      total += v < nx ? -v : v;
    }
    if (toRoman(total) !== s) throw new Error('"' + s + '" is not a well-formed Roman numeral (did you mean ' + toRoman(total) + ' = ' + total + '?).');
    return total;
  }
  var EGYPT = [[1000000, '𓁨'], [100000, '𓆐'], [10000, '𓂭'], [1000, '𓆼'], [100, '𓍢'], [10, '𓎆'], [1, '𓏺']];
  function toEgyptian(n) {
    var s = '', parts = [];
    for (var i = 0; i < EGYPT.length; i++) {
      var c = Math.floor(n / EGYPT[i][0]);
      if (c) { s += EGYPT[i][1].repeat(c); parts.push(c + ' × ' + EGYPT[i][1] + ' (' + EGYPT[i][0] + ')'); n -= c * EGYPT[i][0]; }
    }
    return { s: s || '—', parts: parts };
  }
  function toBabylonian(n) {
    if (n === 0) return { s: '(no zero symbol — Babylonians left a space)', parts: [] };
    var digits = [];
    while (n > 0) { digits.unshift(n % 60); n = Math.floor(n / 60); }
    var s = digits.map(function (d) {
      if (d === 0) return '⋯';
      return '𒌋'.repeat(Math.floor(d / 10)) + '𒁹'.repeat(d % 10);
    }).join('  ');
    var parts = digits.map(function (d, i) { return d + ' × 60^' + (digits.length - 1 - i); });
    return { s: s, parts: parts };
  }
  var MAYAN_D = ['𝋠', '𝋡', '𝋢', '𝋣', '𝋤', '𝋥', '𝋦', '𝋧', '𝋨', '𝋩', '𝋪', '𝋫', '𝋬', '𝋭', '𝋮', '𝋯', '𝋰', '𝋱', '𝋲', '𝋳'];
  function toMayan(n) {
    if (n === 0) return { s: MAYAN_D[0], parts: ['0 (shell glyph)'] };
    var digits = [];
    while (n > 0) { digits.unshift(n % 20); n = Math.floor(n / 20); }
    var s = digits.map(function (d) { return MAYAN_D[d]; }).join(' ');
    var parts = digits.map(function (d, i) { return d + ' × 20^' + (digits.length - 1 - i); });
    return { s: s, parts: parts };
  }
  function convert() {
    try {
      TN.clearErr(ERR);
      var mode = g('mode').value, raw = g('in').value.trim();
      if (!raw) { TN.setErr(ERR, 'Type an input value first.'); return; }
      TN.show(P + 'out');
      var box = g('results'), h = '';
      if (mode === 'roman') {
        var dec;
        try { dec = fromRoman(raw); } catch (e) { TN.setErr(ERR, e.message); return; }
        h = '<h3>Roman → decimal</h3><p style="font-size:1.4em"><code>' + TN.esc(raw.toUpperCase()) + '</code> = <b>' + dec + '</b></p>' +
          '<p class="muted">Decoded left to right: a smaller symbol before a larger one subtracts (IV = 4), otherwise symbols add.</p>';
      } else {
        if (!/^\d+$/.test(raw)) { TN.setErr(ERR, 'Decimal mode needs a positive whole number.'); return; }
        var n = parseInt(raw, 10);
        if (n < 1 || n > 3999999) { TN.setErr(ERR, 'Enter a number from 1 to 3,999,999.'); return; }
        var eg = toEgyptian(n), bb = toBabylonian(n), my = toMayan(n);
        h = '<h3>' + n + ' in ancient systems</h3><table class="data"><tbody>' +
          '<tr><td><b>Roman</b></td><td style="font-size:1.3em"><code>' + (n <= 3999 ? toRoman(n) : '(Romans had no standard form above 3999)') + '</code></td></tr>' +
          '<tr><td><b>Egyptian</b><br><span class="muted">hieroglyphic, additive</span></td><td style="font-size:1.6em">' + eg.s + '<br><span class="muted" style="font-size:0.65em">' + TN.esc(eg.parts.join(' + ')) + '</span></td></tr>' +
          '<tr><td><b>Babylonian</b><br><span class="muted">cuneiform, base 60</span></td><td style="font-size:1.6em">' + bb.s + '<br><span class="muted" style="font-size:0.65em">' + TN.esc(bb.parts.join(' + ')) + '<br>𒁹 = 1, 𒌋 = 10; positions right→left are 60⁰, 60¹, 60²…</span></td></tr>' +
          '<tr><td><b>Mayan</b><br><span class="muted">vigesimal, base 20</span></td><td style="font-size:1.6em">' + my.s + '<br><span class="muted" style="font-size:0.65em">' + TN.esc(my.parts.join(' + ')) + '<br>positions right→left are 20⁰, 20¹, 20²…</span></td></tr>' +
          '</tbody></table>';
      }
      box.innerHTML = h;
    } catch (e) { TN.setErr(ERR, e.message || 'Could not convert.'); }
  }
  try {
    if (!TN.el(P + 'convert')) return;
    TN.on(P + 'convert', 'click', convert);
    TN.on(P + 'mode', 'change', function () {
      g('in').value = g('mode').value === 'roman' ? 'MCMXCIV' : '2026';
      TN.hide(P + 'out');
    });
  } catch (e) { /* never throw on load */ }
})();
