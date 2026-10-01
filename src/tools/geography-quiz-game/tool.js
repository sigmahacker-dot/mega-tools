/* Geography Quiz — 85 country/capital pairs, multiple choice, streak scoring. */
(function () {
  'use strict';
  var SLUG = 'geography-quiz-game';
  var BANK = [
    ['Pakistan','Islamabad'],['India','New Delhi'],['China','Beijing'],['Japan','Tokyo'],
    ['South Korea','Seoul'],['Thailand','Bangkok'],['Vietnam','Hanoi'],['Indonesia','Jakarta'],
    ['Malaysia','Kuala Lumpur'],['Philippines','Manila'],['Bangladesh','Dhaka'],['Sri Lanka','Colombo'],
    ['Nepal','Kathmandu'],['Afghanistan','Kabul'],['Iran','Tehran'],['Iraq','Baghdad'],
    ['Saudi Arabia','Riyadh'],['Turkey','Ankara'],['Egypt','Cairo'],['Morocco','Rabat'],
    ['Algeria','Algiers'],['Nigeria','Abuja'],['Kenya','Nairobi'],['Ethiopia','Addis Ababa'],
    ['Ghana','Accra'],['South Africa','Pretoria'],['France','Paris'],['Germany','Berlin'],
    ['Italy','Rome'],['Spain','Madrid'],['Portugal','Lisbon'],['United Kingdom','London'],
    ['Netherlands','Amsterdam'],['Belgium','Brussels'],['Switzerland','Bern'],['Austria','Vienna'],
    ['Poland','Warsaw'],['Greece','Athens'],['Sweden','Stockholm'],['Norway','Oslo'],
    ['Denmark','Copenhagen'],['Finland','Helsinki'],['Russia','Moscow'],['Ukraine','Kyiv'],
    ['United States','Washington, D.C.'],['Canada','Ottawa'],['Mexico','Mexico City'],['Brazil','Brasília'],
    ['Argentina','Buenos Aires'],['Chile','Santiago'],['Peru','Lima'],['Colombia','Bogotá'],
    ['Australia','Canberra'],['New Zealand','Wellington'],['Fiji','Suva'],['Papua New Guinea','Port Moresby'],
    ['Kazakhstan','Astana'],['Uzbekistan','Tashkent'],['Turkmenistan','Ashgabat'],['Mongolia','Ulaanbaatar'],
    ['Israel','Jerusalem'],['Jordan','Amman'],['Lebanon','Beirut'],['Qatar','Doha'],
    ['United Arab Emirates','Abu Dhabi'],['Oman','Muscat'],['Yemen',"Sana'a"],['Kuwait','Kuwait City'],
    ['Cuba','Havana'],['Jamaica','Kingston'],['Ireland','Dublin'],['Iceland','Reykjavik'],
    ['Czech Republic','Prague'],['Hungary','Budapest'],['Romania','Bucharest'],['Serbia','Belgrade'],
    ['Croatia','Zagreb'],['Bulgaria','Sofia'],['Senegal','Dakar'],['Tanzania','Dodoma'],
    ['Uganda','Kampala'],['Zimbabwe','Harare'],['Myanmar','Naypyidaw'],['Cambodia','Phnom Penh'],
    ['Laos','Vientiane'],['Georgia','Tbilisi'],['Armenia','Yerevan'],['Azerbaijan','Baku'],
    ['Burkina Faso','Ouagadougou']
  ];
  var order = [], pos = 0, score = 0, streak = 0, answered = false, current = null;

  function $(id) { return document.getElementById(id); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function start() {
    order = shuffle(BANK.map(function (_, i) { return i; }));
    pos = 0; score = 0; streak = 0;
    $('geography-quiz-game-score').textContent = '0';
    $('geography-quiz-game-streak').textContent = '0';
    $('geography-quiz-game-msg').textContent = 'What is the capital of…?';
    $('geography-quiz-game-start').textContent = '↻ Restart';
    next();
  }

  function next() {
    if (pos >= order.length) {
      $('geography-quiz-game-q').textContent = '🏁 Done!';
      $('geography-quiz-game-opts').innerHTML = '';
      $('geography-quiz-game-msg').textContent = 'You finished all ' + BANK.length + ' questions with ' + score + ' points. Restart to play again!';
      $('geography-quiz-game-next').disabled = true;
      return;
    }
    answered = false;
    $('geography-quiz-game-next').disabled = true;
    current = BANK[order[pos]];
    $('geography-quiz-game-q').textContent = current[0];
    $('geography-quiz-game-qnum').textContent = (pos + 1) + '/' + BANK.length;
    // build 4 options: correct + 3 random distinct capitals
    var opts = [current[1]];
    var pool = shuffle(BANK.map(function (b) { return b[1]; }).filter(function (c) { return c !== current[1]; }));
    for (var i = 0; i < 3; i++) opts.push(pool[i]);
    opts = shuffle(opts);
    var box = $('geography-quiz-game-opts');
    box.innerHTML = '';
    opts.forEach(function (cap) {
      var b = document.createElement('button');
      b.className = 'btn btn-outline';
      b.style.cssText = 'padding:14px 8px;font-size:16px';
      b.textContent = cap;
      b.addEventListener('click', function () { answer(cap, b); });
      box.appendChild(b);
    });
  }

  function answer(cap, btn) {
    if (answered) return;
    answered = true;
    var btns = $('geography-quiz-game-opts').children;
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      if (btns[i].textContent === current[1]) btns[i].style.background = '#c8e6c9';
    }
    if (cap === current[1]) {
      streak++;
      var pts = 10 + (streak - 1) * 2;
      score += pts;
      $('geography-quiz-game-score').textContent = score;
      $('geography-quiz-game-streak').textContent = streak;
      $('geography-quiz-game-msg').textContent = '✓ Correct! +' + pts + ' points.';
    } else {
      btn.style.background = '#ffcdd2';
      streak = 0;
      $('geography-quiz-game-streak').textContent = '0';
      $('geography-quiz-game-msg').textContent = '✗ Wrong — the capital of ' + current[0] + ' is ' + current[1] + '.';
    }
    pos++;
    $('geography-quiz-game-next').disabled = false;
  }

  try {
    TN.on('geography-quiz-game-start', 'click', start);
    TN.on('geography-quiz-game-next', 'click', next);
  } catch (e) { /* never throw on load */ }
})();
