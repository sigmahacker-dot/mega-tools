(function () {
  'use strict';
  var P = 'syllable-counter-', ERR = P + 'error';
  function syl(word) {
    var w = String(word).toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]e|ed|[^laeiouy]es)$/, '').replace(/^y/, '');
    var m = w.match(/[aeiouy]{1,2}/g);
    var n = m ? m.length : 0;
    return n > 0 ? n : 1;
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var words = t.match(/[A-Za-z']+/g) || [];
      var total = 0, rows = [], seen = {};
      for (var i = 0; i < words.length; i++) {
        var w = words[i].replace(/^'+|'+$/g, '');
        if (!/[a-zA-Z]/.test(w)) continue;
        var n = syl(w);
        total += n;
        var key = w.toLowerCase();
        if (!seen[key]) { seen[key] = 1; if (rows.length < 60) rows.push('<tr><td>' + TN.esc(w) + '</td><td>' + n + '</td></tr>'); }
      }
      TN.el(P + 'total').textContent = total.toLocaleString('en-US');
      TN.el(P + 'words').textContent = words.length.toLocaleString('en-US');
      TN.el(P + 'avg').textContent = words.length ? (total / words.length).toFixed(2) : '0';
      TN.el(P + 'body').innerHTML = rows.length ? rows.join('')
        : '<tr><td colspan="2" class="muted">Per-word breakdown appears here.</td></tr>';
    } catch (e) { TN.setErr(ERR, 'Could not count syllables. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    update();
  } catch (e) { /* never throw on load */ }
})();
