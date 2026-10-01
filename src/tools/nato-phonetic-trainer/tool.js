/* NATO Phonetic Alphabet Trainer — learn, quiz, spell. Official ITU spellings. */
(function () {
  'use strict';
  var S = 'nato-phonetic-trainer';
  var NATO = [
    ['A', 'Alfa'], ['B', 'Bravo'], ['C', 'Charlie'], ['D', 'Delta'],
    ['E', 'Echo'], ['F', 'Foxtrot'], ['G', 'Golf'], ['H', 'Hotel'],
    ['I', 'India'], ['J', 'Juliett'], ['K', 'Kilo'], ['L', 'Lima'],
    ['M', 'Mike'], ['N', 'November'], ['O', 'Oscar'], ['P', 'Papa'],
    ['Q', 'Quebec'], ['R', 'Romeo'], ['S', 'Sierra'], ['T', 'Tango'],
    ['U', 'Uniform'], ['V', 'Victor'], ['W', 'Whiskey'], ['X', 'X-ray'],
    ['Y', 'Yankee'], ['Z', 'Zulu']
  ];
  var DIGITS = { '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Niner' };
  var order = NATO.map(function (_, i) { return i; });
  var pos = 0, flipped = false;
  var qi = 0, ok = 0, bad = 0;

  function showMode(m) {
    ['learn', 'quiz', 'spell'].forEach(function (x) {
      TN.el(S + '-' + x).classList.toggle('hidden', x !== m);
      var b = TN.el(S + '-m-' + x);
      b.classList.toggle('btn-outline', x !== m);
    });
  }
  function drawCard() {
    var e = NATO[order[pos]];
    TN.el(S + '-face').textContent = flipped ? e[0] + ' — ' + e[1] : e[0];
    TN.el(S + '-pos').textContent = (pos + 1) + ' / 26';
  }
  function nextQ() {
    qi = Math.floor(Math.random() * 26);
    TN.el(S + '-q').textContent = NATO[qi][0];
    TN.el(S + '-a').value = '';
    TN.el(S + '-fb').textContent = '';
    TN.el(S + '-a').focus();
  }
  function score() {
    TN.el(S + '-ok').textContent = String(ok);
    TN.el(S + '-bad').textContent = String(bad);
    var t = ok + bad;
    TN.el(S + '-acc').textContent = t ? Math.round(100 * ok / t) + '%' : '–';
  }
  function check() {
    var v = TN.el(S + '-a').value.trim().toLowerCase().replace(/[^a-z-]/g, '');
    var want = NATO[qi][1].toLowerCase();
    var fb = TN.el(S + '-fb');
    if (!v) return;
    if (v === want) { ok++; fb.style.color = '#4ade80'; fb.textContent = '✓ Correct!'; }
    else { bad++; fb.style.color = '#f87171'; fb.textContent = '✗ It is "' + NATO[qi][1] + '".'; }
    score();
    setTimeout(nextQ, 900);
  }
  function spell() {
    var w = TN.el(S + '-word').value.toUpperCase();
    var out = [];
    for (var i = 0; i < w.length; i++) {
      var c = w[i];
      if (c === ' ') { out.push('<span class="muted">· pause ·</span>'); continue; }
      var idx = c >= 'A' && c <= 'Z' ? c.charCodeAt(0) - 65 : -1;
      if (idx >= 0) out.push('<b>' + c + '</b> ' + TN.esc(NATO[idx][1]));
      else if (DIGITS[c]) out.push('<b>' + c + '</b> ' + DIGITS[c]);
      else out.push('<span class="muted">' + TN.esc(c) + '</span>');
    }
    TN.el(S + '-spellout').innerHTML = out.length ? out.join('<br>') : '<span class="muted">Type a word above.</span>';
  }

  try {
    if (!TN.el(S + '-card')) return;
    ['learn', 'quiz', 'spell'].forEach(function (m) {
      TN.on(S + '-m-' + m, 'click', function () { showMode(m); if (m === 'quiz') nextQ(); });
    });
    TN.on(S + '-card', 'click', function () { flipped = !flipped; drawCard(); });
    TN.on(S + '-prev', 'click', function () { pos = (pos + 25) % 26; flipped = false; drawCard(); });
    TN.on(S + '-next', 'click', function () { pos = (pos + 1) % 26; flipped = false; drawCard(); });
    TN.on(S + '-shuf', 'click', function () {
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = order[i]; order[i] = order[j]; order[j] = t;
      }
      pos = 0; flipped = false; drawCard();
    });
    TN.on(S + '-check', 'click', check);
    TN.on(S + '-a', 'keydown', function (e) { if (e.key === 'Enter') check(); });
    TN.on(S + '-skip', 'click', nextQ);
    TN.on(S + '-reset', 'click', function () { ok = 0; bad = 0; score(); nextQ(); });
    TN.on(S + '-word', 'input', spell);
    drawCard(); score(); spell();
  } catch (e) { /* never throw on load */ }
})();
