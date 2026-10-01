(function () {
  'use strict';
  var P = 'rock-paper-scissors-';
  var ERR = P + 'error';
  var CHOICES = ['rock', 'paper', 'scissors'];
  var EMOJI = { rock: '🪨', paper: '📄', scissors: '✂️' };
  var LABEL = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
  var BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  var you = 0, comp = 0, round = 1, over = false, history = [];
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function setButtons(disabled) {
    CHOICES.forEach(function (c) { var b = g('c-' + c); if (b) b.disabled = disabled; });
  }
  function renderScore() {
    set('you', String(you)); set('comp', String(comp)); set('round', String(round));
  }
  function renderHistory() {
    var ul = g('history');
    if (!ul) return;
    if (!history.length) { ul.innerHTML = '<li class="muted">No rounds played yet.</li>'; return; }
    var html = '';
    history.forEach(function (h, i) {
      var txt = h.r === 'win' ? 'You win the round' : h.r === 'lose' ? 'Computer wins the round' : 'Draw';
      html += '<li>Round ' + (history.length - i) + ': ' + EMOJI[h.p] + ' vs ' + EMOJI[h.c] + ' — ' + txt + '</li>';
    });
    ul.innerHTML = html;
  }
  function play(choice) {
    if (over || CHOICES.indexOf(choice) === -1) return;
    TN.clearErr(ERR);
    var c = CHOICES[Math.floor(Math.random() * 3)], res;
    if (choice === c) res = 'draw';
    else if (BEATS[choice] === c) { res = 'win'; you++; }
    else { res = 'lose'; comp++; }
    history.unshift({ p: choice, c: c, r: res });
    if (history.length > 10) history.pop();
    var resEl = g('result');
    var line = 'You: ' + EMOJI[choice] + ' ' + LABEL[choice] + ' &nbsp;vs&nbsp; Computer: ' + EMOJI[c] + ' ' + LABEL[c] + '<br>';
    line += res === 'win' ? '<strong>You take the round!</strong>' : res === 'lose' ? '<strong>Computer takes the round.</strong>' : 'Draw — replay the round.';
    if (resEl) resEl.innerHTML = '<p>' + line + '</p>';
    if (res !== 'draw') round++;
    renderScore();
    renderHistory();
    if (you === 3 || comp === 3) {
      over = true;
      setButtons(true);
      var win = you === 3;
      if (resEl) resEl.innerHTML = '<p class="rps-final">' + (win ? '🏆 You win the match ' + you + '–' + comp + '!' : '🤖 Computer wins the match ' + comp + '–' + you + '.') + '</p>' +
        '<div class="btn-row center"><button type="button" class="btn btn-primary btn-sm" id="' + P + 'again">Play again</button></div>';
      var again = g('again');
      if (again) again.addEventListener('click', reset);
    }
  }
  function reset() {
    you = 0; comp = 0; round = 1; over = false; history = [];
    TN.clearErr(ERR);
    setButtons(false);
    renderScore();
    renderHistory();
    var resEl = g('result');
    if (resEl) resEl.innerHTML = '<p class="muted">First to 3 round wins takes the match. Good luck!</p>';
  }
  try {
    CHOICES.forEach(function (c) {
      TN.on(P + 'c-' + c, 'click', function () { play(c); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'r' || e.key === 'R') play('rock');
      else if (e.key === 'p' || e.key === 'P') play('paper');
      else if (e.key === 's' || e.key === 'S') play('scissors');
    });
    renderScore();
  } catch (e) { /* never throw on load */ }
})();
