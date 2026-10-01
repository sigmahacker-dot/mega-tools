(function () {
  'use strict';
  var P = 'headline-analyzer-', ERR = P + 'error';
  var POWER = 'proven|secret|ultimate|free|guaranteed|new|best|top|amazing|incredible|powerful|essential|complete|definitive|step-by-step|easy|quick|fast|simple|effective|exclusive|limited|urgent|now|today|discover|unlock|master|boost|double|triple|skyrocket|win|save|money|profit|growth|hack|trick|mistake|warning|shocking|surprising|unbelievable|jaw-dropping|mind-blowing|insane|crazy|brilliant|genius|smart|proven|tested|guarantee|risk-free|bonus|guide|checklist|blueprint|formula|system|method|case study|data|research|science|expert|insider'.split('|');
  var EMO = 'love|hate|fear|happy|joy|excited|thrilled|amazed|worried|anxious|angry|frustrated|hope|dream|desire|passion|brave|bold|confident|proud|ashamed|guilty|lonely|sad|heartbreaking|inspiring|empowering|life-changing|unforgettable|stunning|breathtaking|magical|dreamy|cozy|wild|adventure|escape|freedom|discover|wonder|awe|curious|fascinating'.split('|');
  var COMMON = ('a|the|and|of|to|in|for|on|with|is|are|you|your|how|what|why|when|this|that|it|be|as|at|by|an|or|we|our|their|his|her|its').split('|');
  function hasAny(words, bank) {
    var found = [];
    for (var i = 0; i < bank.length; i++) {
      var re = new RegExp('\\b' + bank[i].replace(/-/g, '[- ]') + '\\b', 'i');
      if (re.test(words)) found.push(bank[i]);
    }
    return found;
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var t = (TN.el(P + 'input').value || '').trim();
      var chars = t.length;
      var words = t ? t.split(/\s+/).filter(Boolean) : [];
      TN.el(P + 'chars').textContent = chars;
      TN.el(P + 'words').textContent = words.length;
      var body = TN.el(P + 'body'), sc = TN.el(P + 'score');
      if (!t) {
        sc.textContent = '–';
        body.innerHTML = '<tr><td class="muted" colspan="2">Type a headline to analyze it.</td></tr>';
        return;
      }
      var score = 0, rows = [];
      function row(label, ok, detail) {
        rows.push('<tr><td>' + label + '</td><td>' + (ok ? '<span style="color:#4D7C0F">✓</span> ' : '<span style="color:#d97706">•</span> ') + TN.esc(detail) + '</td></tr>');
      }
      var lenOk = chars >= 55 && chars <= 70;
      score += lenOk ? 25 : (chars >= 40 && chars <= 90 ? 12 : 0);
      row('Length', lenOk, chars + ' chars (ideal 55–70)');
      var wOk = words.length >= 6 && words.length <= 9;
      score += wOk ? 15 : (words.length >= 4 && words.length <= 12 ? 7 : 0);
      row('Word count', wOk, words.length + ' words (ideal 6–9)');
      var pw = hasAny(t, POWER);
      score += pw.length ? Math.min(20, 10 + pw.length * 3) : 0;
      row('Power words', pw.length > 0, pw.length ? pw.slice(0, 6).join(', ') : 'none found — try: proven, secret, ultimate, free');
      var em = hasAny(t, EMO);
      score += em.length ? Math.min(15, 8 + em.length * 3) : 0;
      row('Emotional words', em.length > 0, em.length ? em.slice(0, 6).join(', ') : 'none found — try: amazing, unforgettable, stunning');
      var uncommon = words.filter(function (w) { return COMMON.indexOf(w.toLowerCase().replace(/[^a-z]/g, '')) === -1; }).length;
      var uPct = words.length ? Math.round(100 * uncommon / words.length) : 0;
      var uOk = uPct >= 20 && uPct <= 40;
      score += uOk ? 15 : 7;
      row('Uncommon words', uOk, uPct + '% uncommon (ideal 20–40%)');
      var hasNum = /\d/.test(t);
      score += hasNum ? 10 : 0;
      row('Number included', hasNum, hasNum ? 'numbers lift click-through' : 'adding a number often helps');
      var grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
      sc.textContent = score + ' / ' + grade;
      sc.style.color = grade === 'A' ? '#4D7C0F' : grade === 'B' ? '#65a30d' : grade === 'C' ? '#d97706' : '#dc2626';
      body.innerHTML = rows.join('');
    } catch (e) { TN.setErr(ERR, 'Could not analyze the headline. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 120));
    update();
  } catch (e) { /* never throw on load */ }
})();
