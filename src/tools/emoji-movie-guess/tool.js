/* Emoji Movie Guessing — 60+ emoji puzzles, letter hints, scoring. */
(function () {
  'use strict';
  var SLUG = 'emoji-movie-guess';
  var BANK = [
    ['🦁👑','The Lion King'],['🧊❄️👸','Frozen'],['🕷️🕸️🏙️','Spider-Man'],['🦇🌃','Batman'],
    ['⚡🧙‍♂️🦉','Harry Potter'],['🚢🧊💔','Titanic'],['🦖🏝️','Jurassic Park'],['👻🏠','Ghostbusters'],
    ['🧜‍♀️🌊','The Little Mermaid'],['🤖💚🌱','Wall-E'],['🐭👨‍🍳','Ratatouille'],['🐟🔍','Finding Nemo'],
    ['🚀🌌⏳','Interstellar'],['🌊🌀⛵','Moana'],['🐉🔥','How to Train Your Dragon'],['🎈🏠👴','Up'],
    ['🐼🥋','Kung Fu Panda'],['👽📞🚲','E.T.'],['🦈🏖️','Jaws'],['🧛🩸','Dracula'],
    ['🧟‍♂️🧠','Zombieland'],['🤡🎈😱','It'],['🔪🚿🏨','Psycho'],['👹📼','The Ring'],
    ['🧙‍♂️💍🌋','The Lord of the Rings'],['⚔️🌟🚀','Star Wars'],['🖖👽🚀','Star Trek'],
    ['🤖🚗💥','Transformers'],['🦍🏙️','King Kong'],['🐋⚓','Moby Dick'],['🏴‍☠️💰','Pirates of the Caribbean'],
    ['🧞‍♂️🪔','Aladdin'],['💤👸🏰','Sleeping Beauty'],['🍎👸⛏️','Snow White'],['👠🎃🕛','Cinderella'],
    ['🌹👹🏰','Beauty and the Beast'],['🧜‍♂️🔱','Aquaman'],['⚡🔨','Thor'],['🛡️🇺🇸','Captain America'],
    ['💚👊','The Hulk'],['🕷️🐜','Ant-Man'],['🧙‍♂️👁️','Doctor Strange'],['🐈‍⬛🎩','Puss in Boots'],
    ['🐷🕷️🕸️',"Charlotte's Web"],['🐰🥕🏙️','Zootopia'],['🦊🐶','The Fox and the Hound'],
    ['🐘🎪','Dumbo'],['🦌🌲','Bambi'],['🐻🍯🌲','Winnie the Pooh'],['🚂💨','The Polar Express'],
    ['🎅🎄','Home Alone'],['👦🏠😈','Home Alone'],['🔫🕶️👽','Men in Black'],['🦖🌋','Jurassic World'],
    ['🐒🗽','Planet of the Apes'],['🧊🚢','The Ice Age'],['🐿️🌰','Ice Age'],['🐧🐾','Happy Feet'],
    ['🐝🌼','Bee Movie'],['🦗🎸','A Bug\'s Life'],['🐜🏋️','Antz'],['🦎🏜️','Rango'],
    ['🐢🥷🍕','Teenage Mutant Ninja Turtles'],['🧽🍍','SpongeBob SquarePants'],['👾🕹️','Wreck-It Ralph'],
    ['🎮👾','Pixels'],['🧸🔫','Ted'],['🤖👦❤️','Big Hero 6'],['🚗🏁','Cars'],
    ['✈️🌍','Around the World in 80 Days'],['🗼💘','Midnight in Paris']
  ];
  var order = [], pos = 0, score = 0, streak = 0, solved = 0;
  var revealed = [], hintsUsed = 0, playing = false;

  function $(id) { return document.getElementById(id); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

  function paintLetters() {
    var title = BANK[order[pos]][1];
    var out = '';
    for (var i = 0; i < title.length; i++) {
      var ch = title[i];
      if (/[a-zA-Z0-9]/.test(ch)) out += (revealed[i] ? ch : '_') + ' ';
      else out += ch + ' ';
    }
    $('emoji-movie-guess-letters').textContent = out.trim();
  }

  function newPuzzle() {
    if (pos >= order.length) {
      $('emoji-movie-guess-emoji').textContent = '🏁';
      $('emoji-movie-guess-letters').textContent = '';
      $('emoji-movie-guess-msg').textContent = 'You finished all ' + BANK.length + ' movies with ' + score + ' points! Restart to play again.';
      setPlaying(false);
      return;
    }
    var p = BANK[order[pos]];
    hintsUsed = 0;
    revealed = p[1].split('').map(function () { return false; });
    $('emoji-movie-guess-emoji').textContent = p[0];
    paintLetters();
    $('emoji-movie-guess-guess').value = '';
    $('emoji-movie-guess-guess').focus();
  }

  function setPlaying(on) {
    playing = on;
    $('emoji-movie-guess-guess').disabled = !on;
    $('emoji-movie-guess-submit').disabled = !on;
    $('emoji-movie-guess-hint').disabled = !on;
    $('emoji-movie-guess-skip').disabled = !on;
  }

  function start() {
    order = shuffle(BANK.map(function (_, i) { return i; }));
    pos = 0; score = 0; streak = 0; solved = 0;
    $('emoji-movie-guess-score').textContent = '0';
    $('emoji-movie-guess-streak').textContent = '0';
    $('emoji-movie-guess-done').textContent = '0';
    $('emoji-movie-guess-msg').textContent = 'Guess the movie!';
    $('emoji-movie-guess-start').textContent = '↻ Restart';
    setPlaying(true);
    newPuzzle();
  }

  function guess() {
    if (!playing || pos >= order.length) return;
    var g = $('emoji-movie-guess-guess').value.trim();
    if (!g) return;
    var title = BANK[order[pos]][1];
    if (norm(g) === norm(title)) {
      streak++; solved++;
      var pts = Math.max(2, 10 - hintsUsed * 2);
      score += pts;
      $('emoji-movie-guess-score').textContent = score;
      $('emoji-movie-guess-streak').textContent = streak;
      $('emoji-movie-guess-done').textContent = solved;
      $('emoji-movie-guess-msg').textContent = '✓ Correct! It was "' + title + '". +' + pts + ' points.';
      pos++;
      newPuzzle();
    } else {
      streak = 0;
      $('emoji-movie-guess-streak').textContent = '0';
      $('emoji-movie-guess-msg').textContent = '✗ Not quite — try again or take a hint!';
    }
  }

  function hint() {
    if (!playing || pos >= order.length) return;
    var title = BANK[order[pos]];
    var hidden = [];
    for (var i = 0; i < title[1].length; i++) {
      if (/[a-zA-Z0-9]/.test(title[1][i]) && !revealed[i]) hidden.push(i);
    }
    if (!hidden.length) return;
    revealed[hidden[Math.floor(Math.random() * hidden.length)]] = true;
    hintsUsed++;
    paintLetters();
    $('emoji-movie-guess-msg').textContent = '💡 Letter revealed (' + hintsUsed + ' hint' + (hintsUsed > 1 ? 's' : '') + ' used).';
  }

  function skip() {
    if (!playing || pos >= order.length) return;
    var title = BANK[order[pos]][1];
    streak = 0;
    $('emoji-movie-guess-streak').textContent = '0';
    $('emoji-movie-guess-msg').textContent = 'Skipped — it was "' + title + '".';
    pos++;
    newPuzzle();
  }

  try {
    TN.on('emoji-movie-guess-start', 'click', start);
    TN.on('emoji-movie-guess-submit', 'click', guess);
    TN.on('emoji-movie-guess-hint', 'click', hint);
    TN.on('emoji-movie-guess-skip', 'click', skip);
    TN.on('emoji-movie-guess-guess', 'keydown', function (e) { if (e.key === 'Enter') guess(); });
  } catch (e) { /* never throw on load */ }
})();
