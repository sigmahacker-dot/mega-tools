(function () {
  'use strict';
  var P = 'palindrome-checker-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function longestPal(s) {
    var n = s.length, best = '';
    if (!n) return '';
    function expand(l, r) {
      while (l >= 0 && r < n && s[l] === s[r]) { l--; r++; }
      return s.slice(l + 1, r);
    }
    for (var c = 0; c < n; c++) {
      var o1 = expand(c, c), o2 = expand(c, c + 1);
      if (o1.length > best.length) best = o1;
      if (o2.length > best.length) best = o2;
      if (best.length > n - c) break;
    }
    return best;
  }
  function check() {
    try {
      TN.clearErr(ERR);
      var t = g('input') ? g('input').value : '';
      var ignCase = g('case') && g('case').checked;
      var ignSpace = g('space') && g('space').checked;
      var ignPunct = g('punct') && g('punct').checked;
      var s = t;
      if (ignSpace) s = s.replace(/\s+/g, '');
      if (ignPunct) s = s.replace(/[^a-zA-Z0-9]/g, '');
      if (ignCase) s = s.toLowerCase();
      var res = g('result'), ln = g('len'), lo = g('longest');
      if (!s) {
        res.textContent = '–'; ln.textContent = '0'; lo.textContent = '–';
        return;
      }
      var i = 0, j = s.length - 1, ok = true;
      while (i < j) { if (s[i] !== s[j]) { ok = false; break; } i++; j--; }
      res.textContent = ok ? 'Yes ✓' : 'No ✗';
      res.style.color = ok ? '#4D7C0F' : '#dc2626';
      ln.textContent = s.length.toLocaleString('en-US');
      var lp = longestPal(s);
      lo.textContent = lp.length >= 2 ? (lp.length > 40 ? lp.slice(0, 40) + '…' : lp) + ' (' + lp.length + ')' : '–';
    } catch (e) { TN.setErr(ERR, 'Could not check the text. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(check, 120));
    ['case', 'space', 'punct'].forEach(function (k) { TN.on(P + k, 'change', check); });
    check();
  } catch (e) { /* never throw on load */ }
})();
