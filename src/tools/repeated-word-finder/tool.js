(function () {
  'use strict';
  var P = 'repeated-word-finder-', ERR = P + 'error';
  var DBL = /\b([a-zA-Z']+)\s+\1\b/gi;
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var out = TN.el(P + 'out'), body = TN.el(P + 'body');
      if (!t.trim()) {
        out.textContent = 'Results appear here as you type.'; out.className = 'muted';
        body.innerHTML = '<tr><td colspan="3" class="muted">Frequency table appears here.</td></tr>';
        TN.el(P + 'doubles').textContent = '0'; TN.el(P + 'repeated').textContent = '0'; TN.el(P + 'top').textContent = '–';
        return;
      }
      var dbl = 0, dm;
      DBL.lastIndex = 0;
      var html = TN.esc(t).replace(DBL, function (m) { dbl++; return '<mark>' + m + '</mark>'; });
      var words = t.toLowerCase().match(/[a-z']+/g) || [];
      var freq = {}, i;
      for (i = 0; i < words.length; i++) {
        var w = words[i].replace(/^'+|'+$/g, '');
        if (w.length < 2) continue;
        freq[w] = (freq[w] || 0) + 1;
      }
      var rows = Object.keys(freq).filter(function (w) { return freq[w] >= 2; })
        .sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 40);
      out.innerHTML = html; out.className = '';
      TN.el(P + 'doubles').textContent = dbl;
      TN.el(P + 'repeated').textContent = rows.length;
      TN.el(P + 'top').textContent = rows.length ? rows[0] + ' ×' + freq[rows[0]] : '–';
      body.innerHTML = rows.length ? rows.map(function (w) {
        return '<tr><td>' + TN.esc(w) + '</td><td>' + freq[w] + '</td><td>' + (100 * freq[w] / words.length).toFixed(1) + '%</td></tr>';
      }).join('') : '<tr><td colspan="3" class="muted">No word repeats more than once.</td></tr>';
    } catch (e) { TN.setErr(ERR, 'Could not analyze the text. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    update();
  } catch (e) { /* never throw on load */ }
})();
