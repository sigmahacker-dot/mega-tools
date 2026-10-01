(function () {
  'use strict';
  var P = 'zigzag-text-generator-', ERR = P + 'error';
  function zigzag(text, rows, gap) {
    var chars = text.split('');
    if (chars.length <= 1 || rows < 2) return text;
    var cols = chars.length * (gap + 1);
    var grid = [];
    for (var r = 0; r < rows; r++) { grid.push(new Array(cols).fill(' ')); }
    var row = 0, dir = 1;
    for (var i = 0; i < chars.length; i++) {
      grid[row][i * (gap + 1)] = chars[i];
      if (row === 0) dir = 1;
      else if (row === rows - 1) dir = -1;
      row += dir;
    }
    return grid.map(function (line) { return line.join('').replace(/\s+$/, ''); }).join('\n');
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var text = TN.el(P + 'input').value || '';
      var rows = parseInt(TN.el(P + 'rows').value, 10);
      var gap = parseInt(TN.el(P + 'gap').value, 10);
      TN.el(P + 'rows-v').textContent = rows;
      TN.el(P + 'gap-v').textContent = gap;
      TN.el(P + 'out').textContent = text ? zigzag(text, rows, gap) : 'Type something to see the zigzag…';
    } catch (e) { TN.setErr(ERR, 'Could not render the zigzag. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 100));
    TN.on(P + 'rows', 'input', update);
    TN.on(P + 'gap', 'input', update);
    TN.on(P + 'copy', 'click', function () {
      var v = TN.el(P + 'out').textContent;
      if (!v || !TN.el(P + 'input').value) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
      TN.clearErr(ERR);
      TN.copy(v).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy art'; }, 1200);
      });
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
