/* Riddle Game — 50+ riddles, lenient answer checking, show-answer, scoring. */
(function () {
  'use strict';
  var SLUG = 'riddle-game';
  var BANK = [
    ['I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?','echo'],
    ['You measure my life in hours and I serve you by expiring. I am quick when I am thin and slow when I am fat. What am I?','candle'],
    ['I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?','map'],
    ['What is seen in the middle of March and April that can never be seen at the beginning or end of either month?','the letter R'],
    ['The more of this there is, the less you see. What is it?','darkness'],
    ['What runs but never walks, has a mouth but never talks, has a bed but never sleeps?','river'],
    ['I am always hungry and must always be fed. The finger I touch soon turns red. What am I?','fire'],
    ['What has keys but cannot open a single lock?','piano'],
    ['What has a head and a tail but no body?','coin'],
    ['What gets wetter the more it dries?','towel'],
    ['What has many needles but never sews?','pine tree'],
    ['What has one eye but cannot see?','needle'],
    ['What belongs to you but others use it more than you do?','your name'],
    ['What goes up but never comes down?','your age'],
    ['What can you catch but never throw?','a cold'],
    ['What has hands but cannot clap?','clock'],
    ['What has a neck but no head?','bottle'],
    ['What is full of holes but still holds water?','sponge'],
    ['What question can you never answer yes to?','are you asleep'],
    ['What is always in front of you but cannot be seen?','the future'],
    ['The person who makes it sells it. The person who buys it never uses it. What is it?','coffin'],
    ['What has 13 hearts but no other organs?','a deck of cards'],
    ['What can fill a room but takes up no space?','light'],
    ['If you drop me I am sure to crack, but give me a smile and I will always smile back. What am I?','mirror'],
    ['What has words but never speaks?','book'],
    ['What runs around the whole yard without moving?','fence'],
    ['What can you hold in your right hand but never in your left hand?','your left hand'],
    ['What tastes better than it smells?','your tongue'],
    ['What has a thumb and four fingers but is not alive?','glove'],
    ['What comes once in a minute, twice in a moment, but never in a thousand years?','the letter M'],
    ['What is so fragile that saying its name breaks it?','silence'],
    ['What goes through cities and fields but never moves?','road'],
    ['What has many teeth but cannot bite?','comb'],
    ['What is black when clean and white when dirty?','chalkboard'],
    ['What has an endless supply of letters but starts empty?','mailbox'],
    ['What is easy to get into but hard to get out of?','trouble'],
    ['What kind of band never plays music?','rubber band'],
    ['What has a bottom at the top?','your legs'],
    ['What is at the end of a rainbow?','the letter W'],
    ['What has four wheels and flies?','garbage truck'],
    ['What room has no doors?','mushroom'],
    ['What starts with T, ends with T, and has T in it?','teapot'],
    ['What has legs but does not walk?','table'],
    ['What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?','river'],
    ['The more you take, the more you leave behind. What am I?','footsteps'],
    ['I turn once, what is out will not get in. I turn again, what is in will not get out. What am I?','key'],
    ['What invention lets you look right through a wall?','window'],
    ['What is red and smells like blue paint?','red paint'],
    ['What did the zero say to the eight?','nice belt'],
    ['What has a face and two hands but no arms or legs?','clock'],
    ['What building has the most stories?','library'],
    ['What gets bigger the more you take away from it?','a hole'],
    ['What is always coming but never arrives?','tomorrow']
  ];
  var order = [], pos = 0, score = 0, streak = 0, solved = 0, playing = false;

  function $(id) { return document.getElementById(id); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function norm(s) { return ' ' + s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  function matches(guess, ans) {
    var g = norm(guess), a = norm(ans);
    if (!g.trim()) return false;
    if (g === a) return true;
    // every significant word of the answer appears in the guess, or vice versa
    var aw = a.trim().split(' ').filter(function (w) { return w.length > 2; });
    var gw = g.trim().split(' ').filter(function (w) { return w.length > 2; });
    if (aw.length && aw.every(function (w) { return g.indexOf(' ' + w + ' ') !== -1 || g.indexOf(w) !== -1; })) return true;
    if (gw.length && gw.every(function (w) { return a.indexOf(w) !== -1; })) return true;
    return false;
  }

  function setPlaying(on) {
    playing = on;
    $('riddle-game-guess').disabled = !on;
    $('riddle-game-submit').disabled = !on;
    $('riddle-game-reveal').disabled = !on;
    $('riddle-game-skip').disabled = !on;
  }

  function newRiddle() {
    if (pos >= order.length) {
      $('riddle-game-q').textContent = '🏁 All riddles done!';
      $('riddle-game-msg').textContent = 'You solved ' + solved + ' of ' + BANK.length + ' riddles with ' + score + ' points. Restart to play again!';
      setPlaying(false);
      return;
    }
    $('riddle-game-q').textContent = BANK[order[pos]][0];
    $('riddle-game-guess').value = '';
    $('riddle-game-guess').focus();
  }

  function start() {
    order = shuffle(BANK.map(function (_, i) { return i; }));
    pos = 0; score = 0; streak = 0; solved = 0;
    $('riddle-game-score').textContent = '0';
    $('riddle-game-streak').textContent = '0';
    $('riddle-game-done').textContent = '0';
    $('riddle-game-msg').textContent = 'Type your answer below.';
    $('riddle-game-start').textContent = '↻ Restart';
    setPlaying(true);
    newRiddle();
  }

  function submit() {
    if (!playing || pos >= order.length) return;
    var g = $('riddle-game-guess').value;
    if (!g.trim()) return;
    var ans = BANK[order[pos]][1];
    if (matches(g, ans)) {
      streak++; solved++; score += 10;
      $('riddle-game-score').textContent = score;
      $('riddle-game-streak').textContent = streak;
      $('riddle-game-done').textContent = solved;
      $('riddle-game-msg').textContent = '✓ Correct! The answer was "' + ans + '". +10 points.';
      pos++;
      newRiddle();
    } else {
      streak = 0;
      $('riddle-game-streak').textContent = '0';
      $('riddle-game-msg').textContent = '✗ Not quite — think again or reveal the answer!';
    }
  }

  function reveal() {
    if (!playing || pos >= order.length) return;
    var ans = BANK[order[pos]][1];
    streak = 0;
    $('riddle-game-streak').textContent = '0';
    $('riddle-game-msg').textContent = '👁 The answer was: "' + ans + '". No points this time.';
    pos++;
    newRiddle();
  }

  function skip() {
    if (!playing || pos >= order.length) return;
    streak = 0;
    $('riddle-game-streak').textContent = '0';
    $('riddle-game-msg').textContent = 'Skipped — the answer was "' + BANK[order[pos]][1] + '".';
    pos++;
    newRiddle();
  }

  try {
    TN.on('riddle-game-start', 'click', start);
    TN.on('riddle-game-submit', 'click', submit);
    TN.on('riddle-game-reveal', 'click', reveal);
    TN.on('riddle-game-skip', 'click', skip);
    TN.on('riddle-game-guess', 'keydown', function (e) { if (e.key === 'Enter') submit(); });
  } catch (e) { /* never throw on load */ }
})();
