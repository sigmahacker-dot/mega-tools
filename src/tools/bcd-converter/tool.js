(function () {
  'use strict';
  var P = 'bcd-converter-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function nibbleOf(d) { return d.toString(2).padStart(4, '0'); }
  function decToBcd(decStr, packed) {
    var digits = decStr.split('');
    var rows = digits.map(function (d, i) {
      return { digit: d, nibble: nibbleOf(parseInt(d, 10)), hex: parseInt(d, 10).toString(16).toUpperCase() };
    });
    var nibbles = rows.map(function (r) { return r.nibble; });
    var bytes = [];
    if (packed) {
      var ns = nibbles.slice();
      if (ns.length % 2) ns.unshift('0000'); // pad high nibble
      for (var i = 0; i < ns.length; i += 2) bytes.push(ns[i] + ns[i + 1]);
    } else {
      nibbles.forEach(function (nb) { bytes.push('0000' + nb); });
    }
    var hex = bytes.map(function (b) { return parseInt(b, 2).toString(16).toUpperCase().padStart(2, '0'); });
    return { rows: rows, bytes: bytes, hex: hex };
  }
  function convert() {
    try {
      TN.clearErr(ERR);
      var dir = g('dir').value, packed = g('pack').value === 'packed';
      var raw = g('in').value.trim();
      if (!raw) { TN.setErr(ERR, 'Type an input value first.'); return; }
      if (dir === 'd2b') {
        if (!/^\d+$/.test(raw)) { TN.setErr(ERR, 'Decimal input must contain digits only (no sign, no decimal point).'); return; }
        if (raw.length > 24) { TN.setErr(ERR, 'Keep the number to 24 digits or fewer.'); return; }
        var r = decToBcd(raw, packed);
        TN.show(P + 'out');
        g('result').textContent = r.bytes.join(' ');
        g('result').setAttribute('data-r', r.bytes.join(' '));
        g('result-l').textContent = packed ? 'Packed BCD (nibbles)' : 'Unpacked BCD (nibbles)';
        g('hex').textContent = r.hex.join(' ');
        g('table').innerHTML = r.rows.map(function (row) {
          return '<tr><td><b>' + row.digit + '</b></td><td><code>' + row.nibble + '</code></td><td><code>' + row.hex + '</code></td></tr>';
        }).join('');
      } else {
        var groups = raw.split(/[\s,;|]+/).filter(Boolean);
        if (!groups.length) { TN.setErr(ERR, 'Type BCD nibbles, e.g. 1001 0011.'); return; }
        var digits = '';
        for (var i = 0; i < groups.length; i++) {
          var grp = groups[i];
          if (!/^[01]{4}$/.test(grp) && !/^[01]{8}$/.test(grp)) { TN.setErr(ERR, 'Group "' + grp + '" is not 4 or 8 bits of 0/1.'); return; }
          var nbs = grp.length === 8 ? [grp.slice(0, 4), grp.slice(4)] : [grp];
          for (var j = 0; j < nbs.length; j++) {
            var v = parseInt(nbs[j], 2);
            if (v > 9) { TN.setErr(ERR, 'Invalid BCD nibble "' + nbs[j] + '" (= ' + v + '): BCD digits must be 0000–1001.'); return; }
            digits += String(v);
          }
        }
        var dec = digits.replace(/^0+(?=\d)/, '') || '0';
        var r2 = decToBcd(dec, true);
        TN.show(P + 'out');
        g('result').textContent = dec;
        g('result').setAttribute('data-r', dec);
        g('result-l').textContent = 'Decoded decimal';
        g('hex').textContent = r2.hex.join(' ');
        g('table').innerHTML = r2.rows.map(function (row) {
          return '<tr><td><b>' + row.digit + '</b></td><td><code>' + row.nibble + '</code></td><td><code>' + row.hex + '</code></td></tr>';
        }).join('');
      }
    } catch (e) { TN.setErr(ERR, e.message || 'Could not convert.'); }
  }
  try {
    if (!TN.el(P + 'convert')) return;
    TN.on(P + 'convert', 'click', convert);
    TN.on(P + 'dir', 'change', function () {
      g('in').placeholder = g('dir').value === 'd2b' ? 'Decimal: 259' : 'BCD: 1001 0011';
      g('in').value = g('dir').value === 'd2b' ? '259' : '0010 0101 1001';
      TN.hide(P + 'out');
    });
    TN.on(P + 'copy', 'click', function () {
      var r = g('result').getAttribute('data-r');
      if (r) TN.copy(r);
    });
  } catch (e) { /* never throw on load */ }
})();
