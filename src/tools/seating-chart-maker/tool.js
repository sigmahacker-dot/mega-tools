(function () {
  'use strict';
  var ERR = 'seating-chart-maker-error';
  var lastGrid = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function assign() {
    TN.clearErr(ERR);
    var rows = Math.min(20, Math.max(1, parseInt(TN.el('seat-rows').value, 10) || 1));
    var cols = Math.min(20, Math.max(1, parseInt(TN.el('seat-cols').value, 10) || 1));
    var guests = TN.el('seat-guests').value.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
    var seats = rows * cols;
    if (!guests.length) { TN.setErr(ERR, 'Enter at least one guest name.'); return; }
    if (guests.length > seats) { TN.setErr(ERR, guests.length + ' guests but only ' + seats + ' seats — add more rows or columns.'); return; }
    var order = shuffle(guests.slice());
    lastGrid = [];
    var html = '<table class="data"><tbody>';
    var k = 0;
    for (var r = 0; r < rows; r++) {
      var row = [];
      html += '<tr>';
      for (var c = 0; c < cols; c++) {
        var seatNo = r * cols + c + 1;
        var name = k < order.length ? order[k++] : null;
        row.push(name);
        html += '<td style="min-width:120px"><strong>S' + seatNo + '</strong><br>' +
          (name ? esc(name) : '<span class="muted">— empty —</span>') + '</td>';
      }
      html += '</tr>';
      lastGrid.push(row);
    }
    html += '</tbody></table>';
    TN.el('seat-grid').innerHTML = html;
    TN.el('seat-count').textContent = seats;
    TN.el('seat-filled').textContent = guests.length;
  }
  try {
    TN.on('seat-go', 'click', assign);
    TN.on('seat-dl', 'click', function () {
      if (!lastGrid.length) { TN.setErr(ERR, 'Assign seats first.'); return; }
      TN.clearErr(ERR);
      var lines = ['SEATING CHART', ''], n = 0;
      lastGrid.forEach(function (row) {
        row.forEach(function (name) {
          n++;
          lines.push('Seat ' + n + ': ' + (name || '(empty)'));
        });
        lines.push('');
      });
      var b = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'seating-chart.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
    TN.el('seat-grid').innerHTML = '<p class="muted">Enter guests and press Assign seats.</p>';
  } catch (e) { /* never throw on load */ }
})();