(function () {
  'use strict';
  var P = 'bulls-and-cows-game-';
  function g(id) { return document.getElementById(P + id); }
  var secret = '', tries = 0, over = false, best = null;
  var LS = 'tn-bulls-and-cows-game-best';
  try { var b0 = localStorage.getItem(LS); if (b0) best = parseInt(b0, 10); } catch (e) {}
  function newSecret() {
    var ds = [];
    while (ds.length < 4) {
      var d = Math.floor(Math.random() * 10);
      if (ds.length === 0 && d === 0) continue;
      if (ds.indexOf(d) === -1) ds.push(d);
    }
    return ds.join('');
  }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function renderBest() { var el = g('best'); if (el) el.textContent = best === null ? '—' : String(best); }
  function valid(s) {
    if (!/^[0-9]{4}$/.test(s)) return 'Enter exactly 4 digits.';
    if (s[0] === '0') return 'The guess can\'t start with 0.';
    var seen = {};
    for (var i = 0; i < 4; i++) { if (seen[s[i]]) return 'Digits must not repeat.'; seen[s[i]] = 1; }
    return null;
  }
  function score(s) {
    var a = 0, b = 0, i;
    for (i = 0; i < 4; i++) if (s[i] === secret[i]) a++;
    for (i = 0; i < 4; i++) for (var j = 0; j < 4; j++) if (i !== j && s[i] === secret[j]) b++;
    return [a, b];
  }
  function doGuess() {
    if (over) return;
    var inp = g('guess');
    var s = inp ? inp.value.trim() : '';
    var err = valid(s);
    if (err) { TN.setErr(P + 'error', err); return; }
    TN.clearErr(P + 'error');
    var sc = score(s);
    tries++;
    var t = g('tries'); if (t) t.textContent = String(tries);
    var hist = g('history');
    if (hist) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;background:#292524;border-radius:8px;padding:6px 12px';
      var good = sc[0] === 4;
      row.innerHTML = '<span style="font-size:20px;letter-spacing:5px;font-weight:700">' + TN.esc(s) + '</span>' +
        '<span class="muted">→</span>' +
        '<span style="font-weight:800;color:' + (good ? '#4ade80' : '#fbbf24') + '">' + sc[0] + 'A' + sc[1] + 'B</span>' +
        '<span class="muted" style="font-size:12px">#' + tries + '</span>';
      hist.insertBefore(row, hist.firstChild);
    }
    if (inp) { inp.value = ''; inp.focus(); }
    if (sc[0] === 4) {
      over = true;
      if (best === null || tries < best) {
        best = tries;
        try { localStorage.setItem(LS, String(best)); } catch (e) {}
        renderBest();
      }
      status('🎉 You cracked it in ' + tries + ' ' + (tries === 1 ? 'guess' : 'guesses') + '! The number was ' + secret + '.');
    } else {
      status(sc[0] + 'A' + sc[1] + 'B — ' + (sc[0] + sc[1] === 0 ? 'no digits match at all.' : 'keep going!'));
    }
  }
  function reset() {
    secret = newSecret(); tries = 0; over = false;
    TN.clearErr(P + 'error');
    var t = g('tries'); if (t) t.textContent = '0';
    var hist = g('history'); if (hist) hist.innerHTML = '';
    var inp = g('guess'); if (inp) inp.value = '';
    renderBest();
    status('New secret number chosen. Make your first guess!');
  }
  try {
    if (!g('guess')) return;
    TN.on(P + 'go', 'click', doGuess);
    TN.on(P + 'guess', 'keydown', function (e) { if (e.key === 'Enter') doGuess(); });
    TN.on(P + 'new', 'click', reset);
    TN.on(P + 'reveal', 'click', function () { if (!over) { over = true; status('The secret was ' + secret + '. Start a new game to try again.'); } });
    reset();
  } catch (e) { /* never throw on load */ }
})();
