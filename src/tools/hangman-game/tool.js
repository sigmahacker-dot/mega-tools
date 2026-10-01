(function () {
  'use strict';
  var P = 'hangman-game-';
  var ERR = P + 'error';
  var WORDS = [
    ['ELEPHANT', 'Animals'], ['GIRAFFE', 'Animals'], ['PENGUIN', 'Animals'], ['KANGAROO', 'Animals'],
    ['DOLPHIN', 'Animals'], ['CHEETAH', 'Animals'], ['CROCODILE', 'Animals'], ['BUTTERFLY', 'Animals'],
    ['OCTOPUS', 'Animals'], ['LEOPARD', 'Animals'], ['RABBIT', 'Animals'], ['TIGER', 'Animals'],
    ['ZEBRA', 'Animals'], ['MONKEY', 'Animals'], ['SNAKE', 'Animals'], ['WHALE', 'Animals'],
    ['EAGLE', 'Animals'], ['SHARK', 'Animals'], ['BEAR', 'Animals'], ['WOLF', 'Animals'],
    ['PIZZA', 'Food'], ['SPAGHETTI', 'Food'], ['CHOCOLATE', 'Food'], ['SANDWICH', 'Food'],
    ['PANCAKE', 'Food'], ['WATERMELON', 'Food'], ['POPCORN', 'Food'], ['CHEESE', 'Food'],
    ['BURGER', 'Food'], ['SALAD', 'Food'], ['COOKIE', 'Food'], ['HONEY', 'Food'],
    ['BREAD', 'Food'], ['APPLE', 'Food'], ['BANANA', 'Food'], ['ORANGE', 'Food'],
    ['GRAPE', 'Food'], ['CARROT', 'Food'], ['POTATO', 'Food'], ['TOMATO', 'Food'],
    ['SOCCER', 'Sports'], ['TENNIS', 'Sports'], ['CRICKET', 'Sports'], ['RUGBY', 'Sports'],
    ['BOXING', 'Sports'], ['SWIMMING', 'Sports'], ['CYCLING', 'Sports'], ['RUNNING', 'Sports'],
    ['GOLF', 'Sports'], ['HOCKEY', 'Sports'], ['SKIING', 'Sports'], ['SURFING', 'Sports'],
    ['KARATE', 'Sports'], ['YOGA', 'Sports'], ['DARTS', 'Sports'],
    ['LAPTOP', 'Objects'], ['GUITAR', 'Objects'], ['UMBRELLA', 'Objects'], ['CAMERA', 'Objects'],
    ['ROCKET', 'Objects'], ['CASTLE', 'Objects'], ['CANDLE', 'Objects'], ['MIRROR', 'Objects'],
    ['PILLOW', 'Objects'], ['BLANKET', 'Objects'], ['BOTTLE', 'Objects'], ['CHAIR', 'Objects'],
    ['TABLE', 'Objects'], ['PHONE', 'Objects'], ['CLOCK', 'Objects'], ['BOOK', 'Objects'],
    ['PENCIL', 'Objects'], ['KEYBOARD', 'Objects'], ['WINDOW', 'Objects'], ['BRIDGE', 'Objects'],
    ['MOUNTAIN', 'Nature'], ['RIVER', 'Nature'], ['DESERT', 'Nature'], ['VOLCANO', 'Nature'],
    ['RAINBOW', 'Nature'], ['THUNDER', 'Nature'], ['OCEAN', 'Nature'], ['FOREST', 'Nature'],
    ['CLOUD', 'Nature'], ['STORM', 'Nature'], ['SNOWFLAKE', 'Nature'], ['WATERFALL', 'Nature'],
    ['SUNSET', 'Nature'], ['MEADOW', 'Nature'], ['ISLAND', 'Nature'],
    ['DOCTOR', 'Professions'], ['PILOT', 'Professions'], ['CHEF', 'Professions'], ['FARMER', 'Professions'],
    ['ASTRONAUT', 'Professions'], ['TEACHER', 'Professions'], ['BAKER', 'Professions'], ['DRIVER', 'Professions'],
    ['NURSE', 'Professions'], ['ARTIST', 'Professions']
  ];
  var word = '', category = '', guessed = [], wrong = 0, finished = false, letterBtns = {};
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var canvas = g('canvas'), ctx = canvas ? canvas.getContext('2d') : null;
  function line(x1, y1, x2, y2) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function drawGallows(stage) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    line(20, 188, 130, 188);
    line(55, 188, 55, 20);
    line(55, 20, 155, 20);
    line(155, 20, 155, 48);
    if (stage >= 1) { ctx.beginPath(); ctx.arc(155, 68, 20, 0, Math.PI * 2); ctx.stroke(); }
    if (stage >= 2) line(155, 88, 155, 132);
    if (stage >= 3) line(155, 98, 130, 118);
    if (stage >= 4) line(155, 98, 180, 118);
    if (stage >= 5) line(155, 132, 135, 162);
    if (stage >= 6) line(155, 132, 175, 162);
  }
  function renderWord(reveal) {
    var w = g('word');
    if (!w) return;
    var html = '';
    for (var i = 0; i < word.length; i++) {
      var ch = word.charAt(i);
      html += '<span class="hg-slot">' + (reveal || guessed.indexOf(ch) !== -1 ? ch : '&nbsp;') + '</span>';
    }
    w.innerHTML = html;
  }
  function buildLetters() {
    var box = g('letters');
    if (!box) return;
    box.innerHTML = '';
    letterBtns = {};
    for (var c = 65; c <= 90; c++) {
      (function (L) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = L;
        b.setAttribute('aria-label', 'Guess ' + L);
        b.addEventListener('click', function () { guess(L); });
        box.appendChild(b);
        letterBtns[L] = b;
      })(String.fromCharCode(c));
    }
  }
  function showResult(html) {
    var res = g('result');
    if (res) { res.innerHTML = html; res.classList.remove('hidden'); }
  }
  function hideResult() {
    var res = g('result');
    if (res) { res.innerHTML = ''; res.classList.add('hidden'); }
  }
  function guess(L) {
    if (finished || guessed.indexOf(L) !== -1) return;
    guessed.push(L);
    var btn = letterBtns[L];
    var hit = word.indexOf(L) !== -1;
    if (btn) { btn.disabled = true; btn.classList.add(hit ? 'good' : 'bad'); }
    if (!hit) {
      wrong++;
      set('wrong', wrong + ' / 6');
      drawGallows(wrong);
      if (wrong >= 6) {
        finished = true;
        renderWord(true);
        showResult('<p>💀 <strong>Game over!</strong> The word was <strong>' + word + '</strong>.</p>');
      }
      return;
    }
    renderWord(false);
    var allFound = true;
    for (var i = 0; i < word.length; i++) {
      if (guessed.indexOf(word.charAt(i)) === -1) { allFound = false; break; }
    }
    if (allFound) {
      finished = true;
      showResult('<p>🎉 <strong>You guessed it!</strong> The word was <strong>' + word + '</strong> with ' + wrong + ' wrong guess' + (wrong === 1 ? '' : 'es') + '.</p>');
    }
  }
  function newWord() {
    var pick = WORDS[Math.floor(Math.random() * WORDS.length)];
    word = pick[0]; category = pick[1];
    guessed = []; wrong = 0; finished = false;
    TN.clearErr(ERR);
    hideResult();
    set('category', category);
    set('wrong', '0 / 6');
    drawGallows(0);
    buildLetters();
    renderWord(false);
  }
  try {
    TN.on(P + 'new', 'click', newWord);
    document.addEventListener('keydown', function (e) {
      var k = String(e.key || '').toUpperCase();
      if (/^[A-Z]$/.test(k) && letterBtns[k] && !letterBtns[k].disabled) guess(k);
    });
    newWord();
  } catch (e) { /* never throw on load */ }
})();
