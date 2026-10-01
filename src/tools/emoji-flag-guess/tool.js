/* Emoji Flag Guessing — 65 flag/country pairs, multiple choice, streak scoring. */
(function () {
  'use strict';
  var SLUG = 'emoji-flag-guess';
  var BANK = [
    ['🇵🇰','Pakistan'],['🇮🇳','India'],['🇨🇳','China'],['🇯🇵','Japan'],['🇰🇷','South Korea'],
    ['🇹🇭','Thailand'],['🇻🇳','Vietnam'],['🇮🇩','Indonesia'],['🇲🇾','Malaysia'],['🇵🇭','Philippines'],
    ['🇧🇩','Bangladesh'],['🇱🇰','Sri Lanka'],['🇳🇵','Nepal'],['🇦🇫','Afghanistan'],['🇮🇷','Iran'],
    ['🇮🇶','Iraq'],['🇸🇦','Saudi Arabia'],['🇹🇷','Turkey'],['🇪🇬','Egypt'],['🇲🇦','Morocco'],
    ['🇳🇬','Nigeria'],['🇰🇪','Kenya'],['🇪🇹','Ethiopia'],['🇬🇭','Ghana'],['🇿🇦','South Africa'],
    ['🇫🇷','France'],['🇩🇪','Germany'],['🇮🇹','Italy'],['🇪🇸','Spain'],['🇵🇹','Portugal'],
    ['🇬🇧','United Kingdom'],['🇳🇱','Netherlands'],['🇧🇪','Belgium'],['🇨🇭','Switzerland'],['🇦🇹','Austria'],
    ['🇵🇱','Poland'],['🇬🇷','Greece'],['🇸🇪','Sweden'],['🇳🇴','Norway'],['🇩🇰','Denmark'],
    ['🇫🇮','Finland'],['🇷🇺','Russia'],['🇺🇦','Ukraine'],['🇺🇸','United States'],['🇨🇦','Canada'],
    ['🇲🇽','Mexico'],['🇧🇷','Brazil'],['🇦🇷','Argentina'],['🇨🇱','Chile'],['🇵🇪','Peru'],
    ['🇨🇴','Colombia'],['🇦🇺','Australia'],['🇳🇿','New Zealand'],['🇰🇿','Kazakhstan'],['🇺🇿','Uzbekistan'],
    ['🇲🇳','Mongolia'],['🇮🇱','Israel'],['🇯🇴','Jordan'],['🇱🇧','Lebanon'],['🇶🇦','Qatar'],
    ['🇦🇪','United Arab Emirates'],['🇨🇺','Cuba'],['🇮🇪','Ireland'],['🇮🇸','Iceland'],['🇨🇿','Czech Republic'],
    ['🇭🇺','Hungary'],['🇷🇴','Romania']
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
    $('emoji-flag-guess-score').textContent = '0';
    $('emoji-flag-guess-streak').textContent = '0';
    $('emoji-flag-guess-msg').textContent = "Which country's flag is this?";
    $('emoji-flag-guess-start').textContent = '↻ Restart';
    next();
  }

  function next() {
    if (pos >= order.length) {
      $('emoji-flag-guess-flag').textContent = '🏁';
      $('emoji-flag-guess-opts').innerHTML = '';
      $('emoji-flag-guess-msg').textContent = 'You named all ' + BANK.length + ' flags with ' + score + ' points! Restart to play again.';
      $('emoji-flag-guess-next').disabled = true;
      return;
    }
    answered = false;
    $('emoji-flag-guess-next').disabled = true;
    current = BANK[order[pos]];
    $('emoji-flag-guess-flag').textContent = current[0];
    $('emoji-flag-guess-qnum').textContent = (pos + 1) + '/' + BANK.length;
    var opts = [current[1]];
    var pool = shuffle(BANK.map(function (b) { return b[1]; }).filter(function (c) { return c !== current[1]; }));
    for (var i = 0; i < 3; i++) opts.push(pool[i]);
    opts = shuffle(opts);
    var box = $('emoji-flag-guess-opts');
    box.innerHTML = '';
    opts.forEach(function (country) {
      var b = document.createElement('button');
      b.className = 'btn btn-outline';
      b.style.cssText = 'padding:14px 8px;font-size:16px';
      b.textContent = country;
      b.addEventListener('click', function () { answer(country, b); });
      box.appendChild(b);
    });
  }

  function answer(country, btn) {
    if (answered) return;
    answered = true;
    var btns = $('emoji-flag-guess-opts').children;
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      if (btns[i].textContent === current[1]) btns[i].style.background = '#c8e6c9';
    }
    if (country === current[1]) {
      streak++;
      var pts = 10 + (streak - 1) * 2;
      score += pts;
      $('emoji-flag-guess-score').textContent = score;
      $('emoji-flag-guess-streak').textContent = streak;
      $('emoji-flag-guess-msg').textContent = '✓ Correct — ' + current[1] + '! +' + pts + ' points.';
    } else {
      btn.style.background = '#ffcdd2';
      streak = 0;
      $('emoji-flag-guess-streak').textContent = '0';
      $('emoji-flag-guess-msg').textContent = '✗ That was ' + current[1] + '.';
    }
    pos++;
    $('emoji-flag-guess-next').disabled = false;
  }

  try {
    TN.on('emoji-flag-guess-start', 'click', start);
    TN.on('emoji-flag-guess-next', 'click', next);
  } catch (e) { /* never throw on load */ }
})();
