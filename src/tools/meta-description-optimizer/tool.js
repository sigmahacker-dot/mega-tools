(function () {
  'use strict';
  var P = 'meta-description-optimizer-', ERR = P + 'error';
  var WIDTHS = { i: 4, l: 4, j: 4, t: 5, f: 6, r: 6, ' ': 5, '.': 5, ',': 5, ':': 5, ';': 5, '!': 5, "'": 4, '-': 6, 'm': 13, 'w': 13, 'M': 14, 'W': 15 };
  function pxWidth(s) {
    var w = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      w += WIDTHS[c] !== undefined ? WIDTHS[c] : (/[A-Z]/.test(c) ? 10 : 9);
    }
    return w;
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var chars = t.length, px = pxWidth(t);
      TN.el(P + 'chars').textContent = chars;
      TN.el(P + 'px').textContent = px + 'px';
      var score = 0, tips = [];
      if (chars >= 120 && chars <= 160) { score += 40; } else if (chars >= 70) { score += 20; tips.push('Aim for 120–160 characters.'); } else { tips.push('Too short — add detail and a call to action.'); }
      if (px <= 920) { score += 30; } else { score += 5; tips.push('Likely truncated on desktop (over ~920px). Trim wide characters.'); }
      if (/[.!?…]$/.test(t.trim())) { score += 15; } else if (t.trim()) { tips.push('End with a full stop so it does not look cut off.'); }
      if (/\b(book|buy|discover|explore|get|learn|shop|try|visit|call)\b/i.test(t)) { score += 15; } else if (t.trim()) { tips.push('Add a call to action: book, discover, explore, learn…'); }
      var grade = !t.trim() ? '–' : (score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D');
      var sc = TN.el(P + 'score');
      sc.textContent = grade === '–' ? '–' : grade + ' (' + score + ')';
      sc.style.color = grade === 'A' ? '#4D7C0F' : grade === 'B' ? '#65a30d' : grade === 'C' ? '#d97706' : (grade === 'D' ? '#dc2626' : '');
      var maxChars = 0, acc = 0;
      while (maxChars < t.length && acc + (WIDTHS[t[maxChars]] !== undefined ? WIDTHS[t[maxChars]] : 9) <= 920) { acc += (WIDTHS[t[maxChars]] !== undefined ? WIDTHS[t[maxChars]] : 9); maxChars++; }
      var shown = t.length <= maxChars ? t : t.slice(0, maxChars).replace(/\s+\S*$/, '') + ' …';
      TN.el(P + 'pdesc').textContent = t.trim() ? shown : 'Your meta description preview appears here…';
      TN.el(P + 'tips').textContent = tips.length ? 'Tips: ' + tips.join(' ') : 'Looks great — length, width and CTA all check out.';
    } catch (e) { TN.setErr(ERR, 'Could not analyze the description. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 120));
    update();
  } catch (e) { /* never throw on load */ }
})();
