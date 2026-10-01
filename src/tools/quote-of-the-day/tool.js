/* Quote of the Day — 65 original quotes, date-seeded daily quote + shuffle. */
(function () {
  'use strict';
  var SLUG = 'quote-of-the-day';

  var QUOTES = [
    "Small steps, taken daily, build extraordinary lives.",
    "You don't have to be perfect to begin — you just have to begin.",
    "The hardest part of any journey is the first honest step.",
    "Discipline is choosing what you want most over what you want now.",
    "Your future is built in the quiet hours nobody sees.",
    "Courage isn't the absence of fear — it's action despite it.",
    "Every expert was once a beginner who refused to quit.",
    "You are allowed to start over as many times as you need.",
    "Progress loves the patient and rewards the persistent.",
    "The best time to plant a tree was years ago; the second best time is today.",
    "Doubt kills more dreams than failure ever will.",
    "What you do daily shapes who you become permanently.",
    "A calm mind sees opportunities a busy mind misses.",
    "Success is a series of small wins nobody claps for.",
    "You can't control the wind, but you can always adjust your sails.",
    "The distance between dreams and reality is called action.",
    "Be the person your younger self needed.",
    "Growth begins where comfort ends.",
    "Kindness costs nothing and changes everything.",
    "Your only real competition is who you were yesterday.",
    "Big changes start with tiny, boring, repeated actions.",
    "Don't wait for motivation — start, and motivation will follow.",
    "A setback is a setup for a stronger comeback.",
    "The mind believes what you tell it most often — tell it good things.",
    "Energy flows where attention goes.",
    "You don't need permission to chase what sets your soul on fire.",
    "Mistakes are proof that you are trying.",
    "Consistency beats intensity every single time.",
    "The heaviest weight you'll ever lift is self-doubt.",
    "Today is a fresh page — write something worth reading.",
    "Winners are losers who got up one more time.",
    "Your attitude determines your altitude.",
    "Done is better than perfect.",
    "The secret of getting ahead is getting started.",
    "Dreams don't work unless you do.",
    "Light tomorrow with today.",
    "What lies behind you is nothing compared to what lies ahead of you.",
    "Be stubborn about your goals and flexible about your methods.",
    "The only bad workout is the one you didn't do.",
    "Reading a page a day beats reading nothing for a year.",
    "You are stronger than the story you keep telling yourself.",
    "Focus on progress, not perfection.",
    "Every sunrise is an invitation to try again.",
    "Your potential is endless — stop putting a ceiling on it.",
    "The best project you'll ever work on is you.",
    "Challenges are just opportunities wearing a disguise.",
    "Believe you can, and you're halfway there in spirit.",
    "Action is the foundation key to all success.",
    "Don't count the days — make the days count.",
    "A river cuts through rock not by power, but by persistence.",
    "Your vibe attracts your tribe.",
    "Stars can't shine without darkness.",
    "The comeback is always stronger than the setback.",
    "Plant seeds of effort today; harvest confidence tomorrow.",
    "You were born to stand out — stop trying to fit in.",
    "Patience is not waiting; it's keeping a good attitude while working.",
    "Turn your wounds into wisdom.",
    "The expert in anything was once a beginner at everything.",
    "Your dreams are valid, and so is the work they require.",
    "Let your hustle be quieter than your results.",
    "Obstacles are detours in the right direction.",
    "Hope is the anchor; effort is the sail.",
    "You don't find your path — you build it with every step.",
    "Gratitude turns what you have into enough.",
    "The darkest nights produce the brightest stars.",
    "Keep going — someone is inspired by your persistence."
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function dateSeed() {
    var d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function showToday() {
    var idx = dateSeed() % QUOTES.length;
    var el = TN.el(SLUG + '-today');
    el.innerHTML = '';
    var lab = document.createElement('div');
    lab.className = 'muted';
    lab.style.fontSize = '.78rem';
    var d = new Date();
    lab.textContent = d.toDateString();
    var val = document.createElement('div');
    val.style.fontSize = '1.1rem';
    val.textContent = '\u201c' + QUOTES[idx] + '\u201d';
    el.appendChild(lab);
    el.appendChild(val);
  }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t, i) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var lab = document.createElement('div');
      lab.className = 'muted';
      lab.style.fontSize = '.78rem';
      lab.textContent = 'Quote ' + (i + 1);
      var val = document.createElement('div');
      val.textContent = t;
      res.appendChild(lab);
      res.appendChild(val);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          if (!ok) TN.setErr(SLUG + '-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      });
      res.addEventListener('click', function () { btn.click(); });
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function shuffle() {
    try {
      TN.clearErr(SLUG + '-error');
      render([pick(QUOTES)]);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not shuffle. Please try again.');
    }
  }

  function showTen() {
    try {
      TN.clearErr(SLUG + '-error');
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 200) {
        guard++;
        var q = pick(QUOTES);
        if (!seen[q]) { seen[q] = true; out.push(q); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not load quotes. Please try again.');
    }
  }

  TN.on(SLUG + '-shuffle', 'click', shuffle);
  TN.on(SLUG + '-more', 'click', showTen);
  showToday();
})();
