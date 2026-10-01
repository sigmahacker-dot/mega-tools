(function () {
  'use strict';
  var P = 'magic-8-ball-';
  var ERR = P + 'error';
  var AFF = [
    'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes, definitely.',
    'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
    'Yes.', 'Signs point to yes.'
  ];
  var NEU = [
    'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.',
    'Cannot predict now.', 'Concentrate and ask again.'
  ];
  var NEG = [
    "Don't count on it.", 'My reply is no.', 'My sources say no.',
    'Outlook not so good.', 'Very doubtful.'
  ];
  var ALL = AFF.concat(NEU, NEG);
  var busy = false;
  function g(id) { return document.getElementById(P + id); }
  function shake() {
    if (busy) return;
    var qEl = g('q'), ball = g('ball'), ans = g('answer'), btn = g('shake');
    if (!qEl || !ball || !ans) return;
    TN.clearErr(ERR);
    if (!qEl.value.trim()) { TN.setErr(ERR, 'Ask the ball a question first.'); qEl.focus(); return; }
    busy = true;
    if (btn) btn.disabled = true;
    ans.textContent = '…';
    ball.classList.remove('m8b-shake');
    void ball.offsetWidth;
    ball.classList.add('m8b-shake');
    setTimeout(function () {
      ball.classList.remove('m8b-shake');
      ans.textContent = ALL[Math.floor(Math.random() * ALL.length)];
      busy = false;
      if (btn) btn.disabled = false;
    }, 680);
  }
  try {
    TN.on(P + 'shake', 'click', shake);
    TN.on(P + 'q', 'keydown', function (e) { if (e.key === 'Enter') shake(); });
  } catch (e) { /* never throw on load */ }
})();
