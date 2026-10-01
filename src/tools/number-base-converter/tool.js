(function () {
  'use strict';
  var P = 'number-base-converter-';
  var ERR = P + 'error';
  var KEYS = ['bin', 'oct', 'dec', 'hex'];
  var CFG = {
    bin: { name: 'Binary', re: /^[01]+$/, hint: 'only 0 and 1' },
    oct: { name: 'Octal', re: /^[0-7]+$/, hint: 'only digits 0–7' },
    dec: { name: 'Decimal', re: /^[0-9]+$/, hint: 'only digits 0–9' },
    hex: { name: 'Hexadecimal', re: /^[0-9a-fA-F]+$/, hint: 'only digits 0–9 and letters A–F' }
  };
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function blank() {
    KEYS.forEach(function (k) { var el = g(k); if (el) el.value = ''; });
    set('bits', '–'); set('digits', '–'); set('bytes', '–');
  }
  function sync(from) {
    TN.clearErr(ERR);
    var src = g(from);
    if (!src) return;
    var raw = String(src.value).replace(/[\s_]/g, '').replace(/^0[xX]/, '');
    if (raw === '') { blank(); return; }
    var cfg = CFG[from];
    if (raw.charAt(0) === '-') { TN.setErr(ERR, 'Only non-negative integers are supported.'); return; }
    if (!cfg.re.test(raw)) { TN.setErr(ERR, cfg.name + ' accepts ' + cfg.hint + ' — invalid digit found.'); return; }
    var n;
    try {
      n = BigInt((from === 'bin' ? '0b' : from === 'oct' ? '0o' : from === 'hex' ? '0x' : '') + raw);
    } catch (e) { TN.setErr(ERR, 'Could not parse that number.'); return; }
    var vals = { bin: n.toString(2), oct: n.toString(8), dec: n.toString(10), hex: n.toString(16).toUpperCase() };
    KEYS.forEach(function (k) { if (k !== from) { var el = g(k); if (el) el.value = vals[k]; } });
    var bits = vals.bin.length;
    set('bits', String(bits));
    set('digits', String(vals.dec.length));
    set('bytes', String(Math.ceil(bits / 8)));
  }
  try {
    KEYS.forEach(function (k) { TN.on(P + k, 'input', function () { sync(k); }); });
  } catch (e) { /* never throw on load */ }
})();
