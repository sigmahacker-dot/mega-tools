/* Affirmation Generator — confidence / calm / motivation banks. */
(function () {
  'use strict';
  var SLUG = 'affirmation-generator';

  var BANKS = {
    confidence: [
      "I trust myself and my decisions.",
      "I am capable of handling whatever comes my way.",
      "My voice matters, and I speak with confidence.",
      "I believe in my abilities and my worth.",
      "I stand tall in who I am.",
      "I am enough, exactly as I am right now.",
      "I turn self-doubt into self-belief.",
      "I have survived every hard day so far — I can handle this one too.",
      "I deserve the same kindness I give to others.",
      "I walk into every room knowing I belong there.",
      "My confidence grows every time I try.",
      "I am proud of how far I have come.",
      "I do not need permission to be myself.",
      "I choose courage over comfort today.",
      "I am the author of my own story."
    ],
    calm: [
      "I breathe in peace and breathe out tension.",
      "This moment is enough; I do not need to rush it.",
      "I release what I cannot control.",
      "My mind is quiet and my heart is steady.",
      "I give myself permission to rest.",
      "Calm flows through me with every breath.",
      "I am safe in this present moment.",
      "I let go of yesterday's worries.",
      "Stillness is my strength.",
      "I move through my day with ease and grace.",
      "My thoughts slow down; my body relaxes.",
      "I am grounded, centered, and at peace.",
      "I choose serenity over stress.",
      "Everything I need is already within me.",
      "I soften my shoulders and unclench my jaw — I am okay."
    ],
    motivation: [
      "I take one step forward, no matter how small.",
      "My goals are worth my effort today.",
      "I turn obstacles into stepping stones.",
      "Discipline carries me when motivation fades.",
      "I am building the life I want, one action at a time.",
      "I do not wait for the perfect moment — I start now.",
      "My future self is cheering for today's effort.",
      "I am stronger than my excuses.",
      "Small progress is still progress.",
      "I show up, I try, I improve.",
      "I turn 'someday' into 'day one'.",
      "My hard work compounds into results.",
      "I focus on what I can do right now.",
      "I am unstoppable when I refuse to quit.",
      "Today I choose action over overthinking."
    ]
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function render(items, cat) {
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
      lab.textContent = cat.charAt(0).toUpperCase() + cat.slice(1) + ' · ' + (i + 1);
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

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      var cat = TN.el(SLUG + '-category').value;
      var bank = BANKS[cat] || BANKS.confidence;
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 200) {
        guard++;
        var a = pick(bank);
        if (!seen[a]) { seen[a] = true; out.push(a); }
      }
      render(out, cat);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate affirmations. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
