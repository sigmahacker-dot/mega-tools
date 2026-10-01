(function () {
  'use strict';
  var ERR = 'ascii-table-reference-error';
  var CTRL = ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'HT', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI',
    'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US'];
  var ENT = { 34: '&quot;', 38: '&amp;', 60: '&lt;', 62: '&gt;', 160: '&nbsp;' };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hex(n) { return n.toString(16).toUpperCase().padStart(2, '0'); }
  function oct(n) { return n.toString(8).padStart(3, '0'); }
  function render(q) {
    q = (q || '').trim();
    var ql = q.toLowerCase();
    var rows = [];
    for (var i = 0; i < 128; i++) {
      var isCtrl = i < 32 || i === 127;
      var ch = isCtrl ? '' : String.fromCharCode(i);
      var name = isCtrl ? (i === 127 ? 'DEL' : CTRL[i]) : ch;
      var ok = !q;
      if (!ok) {
        ok = String(i) === q || ('0x' + hex(i)).toLowerCase() === ql || hex(i).toLowerCase() === ql ||
          (!isCtrl && ch.toLowerCase() === ql) || name.toLowerCase().indexOf(ql) !== -1;
      }
      if (ok) rows.push({ i: i, ch: ch, name: name, isCtrl: isCtrl });
    }
    TN.el('ascii-count').textContent = rows.length;
    TN.el('ascii-body').innerHTML = rows.map(function (r) {
      return '<tr><td><strong>' + r.i + '</strong></td><td>0x' + hex(r.i) + '</td><td>' + oct(r.i) + '</td>' +
        '<td style="font-family:ui-monospace,monospace">' + (r.isCtrl ? '<span class="muted">—</span>' : esc(r.ch)) + '</td>' +
        '<td>' + (r.isCtrl ? '<span class="muted">' + r.name + '</span>' : esc(r.name)) + '</td>' +
        '<td>' + (ENT[r.i] ? esc(ENT[r.i]) : '<span class="muted">—</span>') + '</td></tr>';
    }).join('') || '<tr><td colspan="6" class="muted">No matches.</td></tr>';
  }
  try {
    TN.on('ascii-q', 'input', function () { TN.clearErr(ERR); render(TN.el('ascii-q').value); });
    render('');
  } catch (e) { /* never throw on load */ }
})();