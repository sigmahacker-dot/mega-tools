(function () {
  'use strict';
  var ERR = 'bingo-card-generator-error';
  var lastGrid = null;
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
  function sampleRange(lo, hi, n) {
    var pool = [];
    for (var i = lo; i <= hi; i++) pool.push(i);
    shuffle(pool);
    return pool.slice(0, n);
  }
  function generate() {
    TN.clearErr(ERR);
    var mode = TN.el('bingo-mode').value;
    var free = TN.el('bingo-free').checked;
    var grid = [[], [], [], [], []];
    if (mode === 'numbers') {
      var cols = [sampleRange(1, 15, 5), sampleRange(16, 30, 5), sampleRange(31, 45, 5), sampleRange(46, 60, 5), sampleRange(61, 75, 5)];
      for (var c = 0; c < 5; c++) for (var r = 0; r < 5; r++) grid[r][c] = String(cols[c][r]);
    } else {
      var words = TN.el('bingo-words').value.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
      if (words.length < (free ? 24 : 25)) { TN.setErr(ERR, 'Enter at least ' + (free ? 24 : 25) + ' words for this card.'); return; }
      var w = shuffle(words.slice()).slice(0, 25);
      for (var r2 = 0; r2 < 5; r2++) for (var c2 = 0; c2 < 5; c2++) grid[r2][c2] = w[r2 * 5 + c2];
    }
    if (free) grid[2][2] = '★ FREE';
    lastGrid = grid;
    TN.el('bingo-head').textContent = TN.el('bingo-title').value.trim() || 'BINGO';
    var letters = ['B', 'I', 'N', 'G', 'O'];
    var html = '<table class="data" style="table-layout:fixed;text-align:center"><thead><tr>';
    letters.forEach(function (l) { html += '<th style="text-align:center;font-size:1.3rem">' + l + '</th>'; });
    html += '</tr></thead><tbody>';
    for (var r3 = 0; r3 < 5; r3++) {
      html += '<tr>';
      for (var c3 = 0; c3 < 5; c3++) {
        var isFree = free && r3 === 2 && c3 === 2;
        html += '<td style="text-align:center;height:56px;font-weight:600' + (isFree ? ';color:#fcd34d' : '') + '">' + esc(grid[r3][c3]) + '</td>';
      }
      html += '</tr>';
    }
    TN.el('bingo-card').innerHTML = html + '</tbody></table>';
  }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  try {
    TN.on('bingo-mode', 'change', function () {
      TN.el('bingo-words-wrap').style.display = TN.el('bingo-mode').value === 'words' ? '' : 'none';
      generate();
    });
    TN.on('bingo-go', 'click', generate);
    TN.on('bingo-free', 'change', generate);
    TN.on('bingo-title', 'input', function () { TN.el('bingo-head').textContent = TN.el('bingo-title').value.trim() || 'BINGO'; });
    TN.on('bingo-print', 'click', function () {
      if (!lastGrid) { TN.setErr(ERR, 'Generate a card first.'); return; }
      TN.clearErr(ERR);
      var w = window.open('', '_blank', 'width=600,height=700');
      if (!w) { TN.setErr(ERR, 'Popup blocked — allow popups to print the card.'); return; }
      var letters = ['B', 'I', 'N', 'G', 'O'];
      var t = '<table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;text-align:center;font-family:sans-serif">';
      t += '<tr>' + letters.map(function (l) { return '<th style="padding:10px;font-size:28px;background:#eee">' + l + '</th>'; }).join('') + '</tr>';
      for (var r = 0; r < 5; r++) {
        t += '<tr>';
        for (var c = 0; c < 5; c++) t += '<td style="padding:18px;font-size:18px;font-weight:bold">' + escHtml(lastGrid[r][c]) + '</td>';
        t += '</tr>';
      }
      w.document.write('<!DOCTYPE html><html><head><title>Bingo Card</title></head><body><h2 style="text-align:center;font-family:sans-serif">' +
        escHtml(TN.el('bingo-head').textContent) + '</h2>' + t + '</table><scr' + 'ipt>window.onload=function(){window.print();}</scr' + 'ipt></body></html>');
      w.document.close();
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();