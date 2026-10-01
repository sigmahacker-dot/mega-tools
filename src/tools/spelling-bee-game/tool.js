/* Spelling Bee — spoken words via SpeechSynthesis, definitions, streak scoring. */
(function () {
  'use strict';
  var SLUG = 'spelling-bee-game';
  var BANK = [
    ['beautiful','pleasing the senses or mind; lovely'],
    ['necessary','required; needed'],
    ['rhythm','a strong, regular repeated pattern of sound or movement'],
    ['embarrass','to cause someone to feel awkward or ashamed'],
    ['occurrence','an incident or event'],
    ['separate','to divide into different parts'],
    ['definitely','without doubt; certainly'],
    ['accommodate','to provide space for someone or something'],
    ['conscience','the part of you that tells you right from wrong'],
    ['fluorescent','glowing brightly under ultraviolet light'],
    ['hierarchy','a system ranking people or things one above another'],
    ['liaison','a connection or cooperation between people'],
    ['millennium','a period of one thousand years'],
    ['noticeable','easy to see or notice'],
    ['occasion','a particular time or special event'],
    ['playwright','a person who writes plays'],
    ['questionnaire','a set of written questions used to gather information'],
    ['rhinoceros','a large mammal with one or two horns on its nose'],
    ['souvenir','a keepsake reminding you of a place or event'],
    ['threshold','the level at which something starts; a doorway sill'],
    ['vacuum','a space entirely empty of matter'],
    ['weather','the state of the atmosphere: rain, sun, wind, etc.'],
    ['weird','strange or uncanny'],
    ['yacht','a medium-sized sailing or powered boat'],
    ['zealous','full of passionate energy for a cause'],
    ['entrepreneur','a person who starts and runs a business'],
    ['bureaucracy','administration through departments and officials'],
    ['camouflage','disguise that blends with surroundings'],
    ['dilemma','a difficult choice between two options'],
    ['etiquette','the rules of polite behavior'],
    ['fascinate','to strongly attract or interest'],
    ['gauge','to measure or estimate'],
    ['harass','to trouble or annoy persistently'],
    ['ignorance','lack of knowledge or information'],
    ['jealous','envious of someone else\u2019s advantages'],
    ['knowledge','facts and skills acquired through experience'],
    ['leisure','free time for enjoyment'],
    ['maintenance','keeping something in good condition'],
    ['neighbor','a person living near you'],
    ['obstacle','something that blocks progress'],
    ['parallel','side by side, never meeting'],
    ['pneumonia','a serious illness of the lungs'],
    ['privilege','a special right or advantage'],
    ['receipt','written proof of payment'],
    ['rhyme','words with matching ending sounds'],
    ['schedule','a plan of times for events'],
    ['siege','a military blockade of a place'],
    ['tomorrow','the day after today'],
    ['unnecessary','not needed'],
    ['village','a small community in the countryside'],
    ['warrant','an official authorization'],
    ['xylophone','a musical instrument with wooden bars'],
    ['yesterday','the day before today'],
    ['zebra','an African animal with black-and-white stripes'],
    ['abundance','a very large quantity of something'],
    ['brilliant','exceptionally clever or bright'],
    ['courage','bravery in facing danger'],
    ['dazzling','extremely impressive; shining brightly'],
    ['envelope','a paper cover for a letter'],
    ['friendship','a close relationship between friends']
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

  function speak(word) {
    try {
      if (!('speechSynthesis' in window)) {
        $('spelling-bee-game-msg').textContent = '⚠ Speech not supported in this browser — use the definition clue.';
        return;
      }
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(word);
      u.rate = 0.85;
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch (e) {
      $('spelling-bee-game-msg').textContent = '⚠ Could not play audio — use the definition clue.';
    }
  }

  function setPlaying(on) {
    playing = on;
    $('spelling-bee-game-guess').disabled = !on;
    $('spelling-bee-game-submit').disabled = !on;
    $('spelling-bee-game-hear').disabled = !on;
    $('spelling-bee-game-skip').disabled = !on;
  }

  function newWord(autoSpeak) {
    if (pos >= order.length) {
      $('spelling-bee-game-def').textContent = '🏁 All words done!';
      $('spelling-bee-game-msg').textContent = 'You spelled ' + solved + ' of ' + BANK.length + ' correctly with ' + score + ' points. Restart to play again!';
      setPlaying(false);
      return;
    }
    $('spelling-bee-game-def').textContent = '“' + BANK[order[pos]][1] + '”';
    $('spelling-bee-game-guess').value = '';
    $('spelling-bee-game-guess').focus();
    if (autoSpeak) setTimeout(function () { speak(BANK[order[pos]][0]); }, 300);
  }

  function start() {
    order = shuffle(BANK.map(function (_, i) { return i; }));
    pos = 0; score = 0; streak = 0; solved = 0;
    $('spelling-bee-game-score').textContent = '0';
    $('spelling-bee-game-streak').textContent = '0';
    $('spelling-bee-game-done').textContent = '0/' + BANK.length;
    $('spelling-bee-game-msg').textContent = 'Listen to the word, then spell it!';
    $('spelling-bee-game-start').textContent = '↻ Restart';
    setPlaying(true);
    newWord(true);
  }

  function check() {
    if (!playing || pos >= order.length) return;
    var g = $('spelling-bee-game-guess').value.trim().toLowerCase();
    if (!g) return;
    var word = BANK[order[pos]][0];
    if (g === word) {
      streak++; solved++;
      var pts = 10 + (streak - 1) * 2;
      score += pts;
      $('spelling-bee-game-score').textContent = score;
      $('spelling-bee-game-streak').textContent = streak;
      $('spelling-bee-game-done').textContent = (pos + 1) + '/' + BANK.length;
      $('spelling-bee-game-msg').textContent = '✓ Correct! "' + word + '" +' + pts + ' points.';
      pos++;
      newWord(true);
    } else {
      streak = 0;
      $('spelling-bee-game-streak').textContent = '0';
      $('spelling-bee-game-msg').textContent = '✗ Not quite — listen again and try once more!';
      speak(word);
    }
  }

  function skip() {
    if (!playing || pos >= order.length) return;
    streak = 0;
    $('spelling-bee-game-streak').textContent = '0';
    $('spelling-bee-game-done').textContent = (pos + 1) + '/' + BANK.length;
    $('spelling-bee-game-msg').textContent = 'Skipped — the word was "' + BANK[order[pos]][0] + '".';
    pos++;
    newWord(true);
  }

  try {
    TN.on('spelling-bee-game-start', 'click', start);
    TN.on('spelling-bee-game-submit', 'click', check);
    TN.on('spelling-bee-game-skip', 'click', skip);
    TN.on('spelling-bee-game-hear', 'click', function () {
      if (playing && pos < order.length) speak(BANK[order[pos]][0]);
    });
    TN.on('spelling-bee-game-guess', 'keydown', function (e) { if (e.key === 'Enter') check(); });
  } catch (e) { /* never throw on load */ }
})();
