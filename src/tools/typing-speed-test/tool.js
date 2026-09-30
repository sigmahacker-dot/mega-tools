(function () {
  'use strict';
  var P = 'typing-speed-test-';
  function g(id) { return document.getElementById(P + id); }

  var textBox = g('text'), input = g('input');
  if (!textBox || !input) return;

  var DURATION = 60;

  var PARAS = [
    'The old lighthouse stood on the cliff for over a hundred years, guiding ships safely through the darkest storms. Its keeper climbed the winding stairs each evening, polishing the great lamp until it shone like a second moon.',
    'Learning to play the piano takes patience more than talent. At first your fingers stumble over the keys, but slowly the scales become smooth and the melodies begin to flow like water over stones.',
    'A river of stars stretched across the night sky as the campers sat quietly around the fire. Somewhere in the distance an owl called, and the flames crackled, sending sparks dancing upward into the dark.',
    'The market was alive with color and noise on Saturday morning. Vendors called out their prices, children weaved between the stalls, and the smell of fresh bread drifted from the corner bakery.',
    'Scientists believe that regular exercise and good sleep are the two most powerful habits for a healthy mind. Even a short daily walk can sharpen focus, lift your mood, and spark brand new ideas.',
    'Deep in the jungle, a hidden waterfall tumbled into a crystal pool where colorful birds gathered at dawn. The explorer held her breath, sketching quickly, afraid the magic of the moment might vanish.'
  ];

  var para = '', started = false, finished = false, timer = null, startTs = 0, timeLeft = DURATION;

  function set(id, val) { var el = g(id); if (el) el.textContent = val; }

  function pickPara() {
    var next = para;
    while (PARAS.length > 1 && next === para) {
      next = PARAS[Math.floor(Math.random() * PARAS.length)];
    }
    return next;
  }

  function renderText() {
    var html = '';
    for (var i = 0; i < para.length; i++) {
      html += '<span data-i="' + i + '">' + TN.esc(para[i]) + '</span>';
    }
    textBox.innerHTML = html;
  }

  function spans() { return textBox.querySelectorAll('span'); }

  function stats() {
    var typed = input.value, correct = 0;
    var n = Math.min(typed.length, para.length);
    for (var i = 0; i < n; i++) if (typed[i] === para[i]) correct++;
    return { typed: typed.length, correct: correct };
  }

  function liveStats() {
    var s = stats();
    var elapsedMin = (Date.now() - startTs) / 60000;
    var wpm = elapsedMin > 0.01 ? Math.round((s.correct / 5) / elapsedMin) : 0;
    var acc = s.typed > 0 ? Math.round((s.correct / s.typed) * 100) : 100;
    set('wpm', wpm);
    set('acc', acc + '%');
  }

  function paint() {
    var typed = input.value, list = spans();
    for (var i = 0; i < list.length; i++) {
      var sp = list[i];
      sp.className = '';
      if (i < typed.length) {
        sp.className = typed[i] === para[i] ? 'ok' : 'bad';
      } else if (i === typed.length) {
        sp.className = 'cur';
      }
    }
  }

  function tick() {
    timeLeft--;
    set('time', timeLeft);
    var bar = g('bar'); if (bar) bar.style.width = Math.max(0, (timeLeft / DURATION) * 100) + '%';
    if (timeLeft <= 0) finish();
  }

  function verdict(wpm, acc) {
    if (wpm >= 80) return 'Blazing fast — professional-level typing!';
    if (wpm >= 60) return 'Great speed — well above average.';
    if (wpm >= 40) return 'Solid, average-to-good typing. Keep practicing!';
    if (wpm >= 20) return 'A decent start — regular practice will raise this quickly.';
    return 'Everyone starts somewhere — try again and watch it climb.';
  }

  function finish() {
    if (finished) return;
    finished = true;
    if (timer) { clearInterval(timer); timer = null; }
    input.disabled = true;
    var s = stats();
    var elapsedSec = Math.max(1, (Date.now() - startTs) / 1000);
    var minutes = elapsedSec / 60;
    var wpm = Math.round((s.correct / 5) / minutes);
    var acc = s.typed > 0 ? Math.round((s.correct / s.typed) * 100) : 0;
    set('wpm', wpm);
    set('acc', acc + '%');
    var res = g('result');
    if (res) {
      res.innerHTML = '<p><strong>Your score: ' + wpm + ' WPM</strong> with ' + acc + '% accuracy.</p>' +
        '<p class="muted">' + TN.esc(verdict(wpm, acc)) + ' (' + s.correct + ' correct of ' + s.typed + ' characters in ' + Math.round(elapsedSec) + 's)</p>';
      TN.show(P + 'result');
    }
  }

  function reset(newPara) {
    if (timer) { clearInterval(timer); timer = null; }
    if (newPara) para = pickPara();
    started = false; finished = false; timeLeft = DURATION; startTs = 0;
    input.value = '';
    input.disabled = false;
    renderText();
    paint();
    set('time', DURATION);
    set('wpm', 0);
    set('acc', '100%');
    var bar = g('bar'); if (bar) bar.style.width = '100%';
    TN.hide(P + 'result');
    TN.clearErr(P + 'error');
  }

  TN.on(input, 'input', function () {
    if (finished) return;
    if (!started) {
      started = true;
      startTs = Date.now();
      timer = setInterval(tick, 1000);
    }
    paint();
    liveStats();
    if (input.value.length >= para.length) finish();
  });

  TN.on(input, 'paste', function (e) {
    if (e && e.preventDefault) e.preventDefault();
    TN.setErr(P + 'error', 'Pasting is disabled — type it yourself, that\u2019s the whole point!');
  });

  TN.on(P + 'new', 'click', function () { reset(true); input.focus(); });
  TN.on(P + 'restart', 'click', function () { reset(false); input.focus(); });

  reset(true);
})();
