(function () {
  'use strict';
  var P = 'passive-voice-highlighter-', ERR = P + 'error';
  var IRR = 'written|taken|broken|spoken|chosen|driven|eaten|fallen|forgotten|frozen|given|hidden|ridden|risen|shaken|stolen|worn|torn|born|built|sent|spent|dealt|felt|kept|left|slept|swept|taught|thought|brought|bought|caught|fought|sought|done|gone|grown|known|shown|thrown|drawn|begun|drunk|sung|sunk|rung|swum|become|overcome|understood|paid|said|heard|made|had|laid|paid|found|wound|bound|ground|meant|dreamt|learnt|burnt|spelt|smelt|knelt|leapt|wept|crept|slept|lost|shot|cut|put|set|hit|hurt|split|spread|shut|cast|burst|cost|bid|upset|broadcast|forecast|overheard|misunderstood|withdrawn|overdone|redone|undone|forgiven|mistaken|overtaken|undergone|withstood|withheld|upheld|beheld';
  var RE = new RegExp('\\b(am|is|are|was|were|be|being|been)\\b(\\s+(?:\\w+\\s+){0,2}?)\\b([a-z]+(?:ed|en|ne)\\b|' + IRR + '\\b)', 'gi');
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var out = TN.el(P + 'out');
      if (!t.trim()) {
        out.textContent = 'Highlights appear here as you type.';
        out.className = 'muted';
        TN.el(P + 'count').textContent = '0';
        TN.el(P + 'ratio').textContent = '0%';
        return;
      }
      var count = 0;
      var html = TN.esc(t).replace(RE, function (m) { count++; return '<mark>' + m + '</mark>'; });
      out.innerHTML = html;
      out.className = '';
      var sents = (t.match(/[^.!?…]+[.!?…]+/g) || []).filter(function (s) { return /[A-Za-z0-9]/.test(s); }).length;
      TN.el(P + 'count').textContent = count;
      TN.el(P + 'ratio').textContent = sents ? Math.round(100 * count / sents) + '%' : '0%';
    } catch (e) { TN.setErr(ERR, 'Could not highlight the text. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    update();
  } catch (e) { /* never throw on load */ }
})();
