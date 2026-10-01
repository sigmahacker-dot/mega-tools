(function () {
  'use strict';
  var P = 'weasel-word-highlighter-', ERR = P + 'error';
  var LIST = ["very", "really", "just", "quite", "rather", "actually", "basically", "literally", "totally", "completely", "absolutely", "definitely", "probably", "possibly", "maybe", "perhaps", "somewhat", "somehow", "anyway", "anyways", "stuff", "a lot", "lots of", "many", "much", "nice", "good", "bad", "big", "small", "thing", "something", "anything", "everything", "nothing", "extremely", "incredibly", "highly", "deeply", "truly", "genuinely", "honestly", "frankly", "clearly", "obviously", "evidently", "apparently", "seemingly", "presumably", "arguably", "virtually", "essentially", "fundamentally", "generally", "usually", "normally", "typically", "often", "sometimes", "rarely", "hardly", "barely", "scarcely", "almost", "nearly", "about", "around", "approximately", "roughly", "more or less", "sort of", "kind of", "type of", "a bit", "a little", "a little bit", "up to", "in my opinion", "i think", "i feel", "i believe", "seems to", "appears to", "tends to", "in order to", "due to the fact", "at this point in time", "in the event that", "for all intents and purposes", "it goes without saying", "needless to say", "as a matter of fact", "in fact", "needless", "utilize", "leverage", "synergy", "robust", "seamless", "cutting-edge", "state-of-the-art", "world-class", "best-in-class", "thought leader", "deep dive", "drill down", "circle back", "touch base", "take offline", "actionable", "bandwidth", "deliverable", "going forward", "moving forward", "at the end of the day", "low-hanging fruit", "paradigm shift", "game-changer", "next level", "unpack", "double-click", "boil the ocean", "herding cats", "drink the kool-aid", "move the needle"];
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var RES = LIST.map(function (w) { return { w: w, re: new RegExp('\\b' + escRe(w).replace(/ /g, '\\s+') + '\\b', 'gi') }; });
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var out = TN.el(P + 'out'), body = TN.el(P + 'body');
      if (!t.trim()) {
        out.textContent = 'Highlights appear here as you type.'; out.className = 'muted';
        body.innerHTML = '<tr><td colspan="2" class="muted">No weasel words found yet.</td></tr>';
        TN.el(P + 'count').textContent = '0'; TN.el(P + 'unique').textContent = '0'; TN.el(P + 'density').textContent = '0%';
        return;
      }
      var hits = [], i, m;
      for (i = 0; i < RES.length; i++) {
        RES[i].re.lastIndex = 0;
        var n = 0;
        while ((m = RES[i].re.exec(t)) !== null) { n++; if (n > 500) break; if (m[0].length === 0) RES[i].re.lastIndex++; }
        if (n) hits.push({ w: RES[i].w, n: n });
      }
      hits.sort(function (a, b) { return b.n - a.n; });
      var total = hits.reduce(function (s, h) { return s + h.n; }, 0);
      var words = (t.match(/\S+/g) || []).length;
      var html = TN.esc(t);
      var sorted = RES.slice().sort(function (a, b) { return b.w.length - a.w.length; });
      for (i = 0; i < sorted.length; i++) {
        sorted[i].re.lastIndex = 0;
        html = html.replace(sorted[i].re, function (mm) { return '<mark>' + mm + '</mark>'; });
      }
      out.innerHTML = html; out.className = '';
      TN.el(P + 'count').textContent = total;
      TN.el(P + 'unique').textContent = hits.length;
      TN.el(P + 'density').textContent = words ? (100 * total / words).toFixed(1) + '%' : '0%';
      body.innerHTML = hits.length ? hits.map(function (h) {
        return '<tr><td>' + TN.esc(h.w) + '</td><td>' + h.n + '</td></tr>';
      }).join('') : '<tr><td colspan="2" class="muted">No weasel words found — tight writing!</td></tr>';
    } catch (e) { TN.setErr(ERR, 'Could not scan for weasel words. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 200));
    update();
  } catch (e) { /* never throw on load */ }
})();
