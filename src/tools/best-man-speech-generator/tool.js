/* Best Man Speech Generator — outline with anecdotes, jokes, heartfelt middle, toast. */
(function () {
  'use strict';
  var SLUG = 'best-man-speech-generator';

  var JOKES = {
    gentle: [
      'They say marriage is about compromise — {g} compromised by agreeing that {p} is always right.',
      '{g} once told me he would never settle down. Technically, he was right — {p} is way out of his league.',
      'I have known {g} for years, and I can confirm: {p}, you are getting a man who still cannot fold a fitted sheet.'
    ],
    cheeky: [
      'Marriage is like a phone battery, {g} — it starts at 100% and you spend forever looking for a charger.',
      '{g} asked me for advice about marriage. I said: "Say yes, apologize often, and never mention the camping trip."',
      'They say you should marry your best friend. {g} tried — I said no. Lucky for him, {p} said yes.'
    ]
  };
  var ADVICE = [
    'Never go to bed angry — stay up and plot revenge like a normal couple. (Kidding. Talk it out.)',
    'The secret to a happy marriage: {g}, learn these three words — "you were right."',
    'Marriage is a team sport. Pass the snacks, share the remote, and always take your partner\u2019s side in public.'
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function fill(s, g, p) { return s.replace(/\{g\}/g, g).replace(/\{p\}/g, p); }

  var current = '';
  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var you = TN.el(SLUG + '-you').value.trim() || '[Your Name]';
        var groom = TN.el(SLUG + '-groom').value.trim() || '[Groom]';
        var partner = TN.el(SLUG + '-partner').value.trim() || '[Partner]';
        var know = TN.el(SLUG + '-know').value;
        var tone = TN.el(SLUG + '-tone').value;
        var jokeStyle = TN.el(SLUG + '-joke').value;
        var memory = TN.el(SLUG + '-memory').value.trim();

        var L = [];
        L.push('BEST MAN SPEECH — outline for ' + you);
        L.push('');
        L.push('1. OPENING');
        L.push('   "Good evening everyone. For those who do not know me, I am ' + you + ', ' + groom + '\u2019s ' + (know === 'brothers' ? 'brother' : know === 'cousins' ? 'cousin' : know.replace(' friends', '')) + ' and very nervous best man."');
        L.push('   Thank the guests and say how honored you are.');
        L.push('');
        L.push('2. FUNNY STORY');
        if (memory) {
          L.push('   Tell the story: "' + memory + '."');
          L.push('   Punchline idea: "And that was the day we learned ' + groom + ' should never be trusted with ' + (memory.indexOf('tent') !== -1 ? 'camping gear' : 'important responsibilities') + '."');
        } else {
          L.push('   [Add your own funny story about ' + groom + ' here — the more specific, the funnier.]');
        }
        if (jokeStyle !== 'none') {
          L.push('');
          L.push('3. JOKE');
          L.push('   ' + fill(pick(JOKES[jokeStyle]), groom, partner));
        }
        L.push('');
        L.push((jokeStyle !== 'none' ? '4' : '3') + '. HEARTFELT MIDDLE');
        if (tone === 'funny') {
          L.push('   "All jokes aside — I have watched ' + groom + ' grow from someone who ate cereal for dinner into someone who eats cereal for dinner WITH ' + partner + '. That is growth."');
        } else if (tone === 'short') {
          L.push('   "' + groom + ' is the best person I know, and ' + partner + ' makes him even better. That is all I need to say."');
        } else {
          L.push('   "' + groom + ' has been there for me through everything. Seeing him this happy with ' + partner + ' — I have never seen him like this, and I hope I never see him any other way."');
        }
        L.push('   Welcome ' + partner + ' to the family: say what you admire about them.');
        L.push('');
        L.push('5. ADVICE');
        L.push('   ' + fill(pick(ADVICE), groom, partner));
        L.push('');
        L.push('6. TOAST');
        L.push('   "Everyone, please raise your glasses. To ' + groom + ' and ' + partner + ' — may your love be modern enough to survive the times, and old-fashioned enough to last forever. Cheers!"');
        current = L.join('\n');
        TN.el(SLUG + '-output').textContent = current;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not build the speech. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Build your speech first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Build your speech first.'); return; }
      TN.downloadText(current, 'best-man-speech.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
