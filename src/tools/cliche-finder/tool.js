(function () {
  'use strict';
  var P = 'cliche-finder-', ERR = P + 'error';
  var LIST = ["at the end of the day", "think outside the box", "win-win", "low-hanging fruit", "ballpark figure", "best of both worlds", "bottom line", "crystal clear", "diamond in the rough", "easier said than done", "elephant in the room", "game changer", "going forward", "in a nutshell", "it is what it is", "move the needle", "needless to say", "par for the course", "rain check", "silver lining", "the whole nine yards", "tip of the iceberg", "when push comes to shove", "break the ice", "hit the nail on the head", "piece of cake", "once in a blue moon", "under the weather", "bite the bullet", "break a leg", "call it a day", "cut corners", "down to earth", "hit the road", "jump on the bandwagon", "let the cat out of the bag", "miss the boat", "on cloud nine", "over the moon", "play it by ear", "raining cats and dogs", "read between the lines", "sit tight", "sleep on it", "spill the beans", "take with a grain of salt", "the ball is in your court", "time flies", "up in the air", "wild goose chase", "worth its weight in gold", "from zero to hero", "a blessing in disguise", "actions speak louder than words", "better late than never", "curiosity killed the cat", "every cloud has a silver lining", "fit as a fiddle", "give the benefit of the doubt", "head over heels", "icing on the cake", "in hot water", "kill two birds with one stone", "leave no stone unturned", "let sleeping dogs lie", "light at the end of the tunnel", "method to my madness", "needle in a haystack", "off the beaten path", "out of the blue", "pushing the envelope", "raise the bar", "rule of thumb", "shot in the dark", "speak of the devil", "take the bull by the horns", "through thick and thin", "trial by fire", "turn over a new leaf", "a whole new ball game", "works like a charm", "back to square one", "burn the midnight oil", "by the skin of your teeth", "cost an arm and a leg", "crack of dawn", "cut to the chase", "down the rabbit hole", "acid test", "doom and gloom", "chalk and cheese", "whole nine yards"];
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var RES = LIST.map(function (c) { return { c: c, re: new RegExp('\\b' + escRe(c).replace(/ /g, '\\s+') + '\\b', 'gi') }; });
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var out = TN.el(P + 'out'), body = TN.el(P + 'body');
      if (!t.trim()) {
        out.textContent = 'Highlights appear here as you type.'; out.className = 'muted';
        body.innerHTML = '<tr><td colspan="2" class="muted">No clichés found yet.</td></tr>';
        TN.el(P + 'count').textContent = '0'; TN.el(P + 'unique').textContent = '0';
        return;
      }
      var hits = [], i, m;
      for (i = 0; i < RES.length; i++) {
        RES[i].re.lastIndex = 0;
        var n = 0;
        while ((m = RES[i].re.exec(t)) !== null) { n++; if (n > 500) break; if (m[0].length === 0) RES[i].re.lastIndex++; }
        if (n) hits.push({ c: RES[i].c, n: n });
      }
      hits.sort(function (a, b) { return b.n - a.n; });
      var total = hits.reduce(function (s, h) { return s + h.n; }, 0);
      var html = TN.esc(t);
      var sorted = RES.slice().sort(function (a, b) { return b.c.length - a.c.length; });
      for (i = 0; i < sorted.length; i++) {
        sorted[i].re.lastIndex = 0;
        html = html.replace(sorted[i].re, function (mm) { return '<mark>' + mm + '</mark>'; });
      }
      out.innerHTML = html; out.className = '';
      TN.el(P + 'count').textContent = total;
      TN.el(P + 'unique').textContent = hits.length;
      body.innerHTML = hits.length ? hits.map(function (h) {
        return '<tr><td>' + TN.esc(h.c) + '</td><td>' + h.n + '</td></tr>';
      }).join('') : '<tr><td colspan="2" class="muted">No clichés found — nice, original writing!</td></tr>';
    } catch (e) { TN.setErr(ERR, 'Could not scan for clichés. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 200));
    update();
  } catch (e) { /* never throw on load */ }
})();
