/* Wedding Vow Generator — personalized vows from names, promises, and tone. */
(function () {
  'use strict';
  var SLUG = 'wedding-vow-generator';

  var PROMISE_LINES = {
    laughter: ['to make you laugh every single day, especially on the hard ones', 'to never let a day pass without finding something to laugh about together'],
    adventure: ['to seek adventure with you, from grand journeys to small everyday discoveries', 'to say yes to new adventures, as long as we face them together'],
    patience: ['to be patient with you, even when the Wi-Fi is slow and the day is long', 'to meet your bad days with patience and your good days with celebration'],
    honesty: ['to always be honest with you, even when the truth is uncomfortable', 'to tell you the truth with kindness, always'],
    support: ['to stand beside you in every storm and cheer loudest in every triumph', 'to be your biggest supporter, today and always'],
    comfort: ['to hold you close when life gets heavy and remind you that you are never alone', 'to be your comfort and your calm when the world feels loud'],
    growth: ['to grow with you, never apart from you', 'to keep becoming better — for you, for us, for the life we are building'],
    friendship: ['to be your best friend first, in this life and whatever comes next', 'to choose you, every day, as my partner and my dearest friend'],
    home: ['to build a home with you — not just walls, but warmth', 'to make wherever we are feel like home, as long as you are there']
  };

  var OPEN = {
    romantic: ['{p}, from the moment our paths crossed, my life quietly reorganized itself around you.', '{p}, loving you has been the easiest and most extraordinary thing I have ever done.'],
    funny: ['{p}, I stand here today, slightly nervous, mostly hungry, and completely sure about you.', '{p}, they say marriage is a journey — good thing I picked the funniest travel companion.'],
    classic: ['{p}, I take you today in the presence of everyone we love.', '{p}, on this day, before our family and friends, I give you my whole heart.'],
    short: ['{p}, I love you. It is that simple, and it is everything.', '{p}, here is my whole heart, in a few honest words.']
  };
  var CLOSE = {
    romantic: 'You are my favorite hello, my hardest goodbye, and every quiet moment in between. I love you — today, tomorrow, always.',
    funny: 'I promise all of this, and I promise to still love you even when you steal the blankets. Which you will. I love you.',
    classic: 'With this ring and these words, I pledge you my love and my loyalty, for as long as we both shall live.',
    short: 'I choose you. I will keep choosing you. I love you.'
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var current = '';
  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var you = TN.el(SLUG + '-you').value.trim() || '[Your Name]';
        var partner = TN.el(SLUG + '-partner').value.trim() || '[Partner]';
        var tone = TN.el(SLUG + '-tone').value;
        var memory = TN.el(SLUG + '-memory').value.trim();
        var boxes = TN.qsa('#' + SLUG + '-promises input:checked');
        var keys = [];
        for (var i = 0; i < boxes.length; i++) keys.push(boxes[i].value);
        if (!keys.length) { TN.setErr(SLUG + '-error', 'Please tick at least one promise.'); return; }

        var L = [];
        L.push(pick(OPEN[tone]).replace('{p}', partner));
        L.push('');
        if (memory) {
          L.push('I still think about ' + memory + ' — that was when I knew.');
          L.push('');
        }
        L.push('Today, I promise:');
        keys.forEach(function (k) {
          L.push('\u2022 I promise ' + pick(PROMISE_LINES[k]) + '.');
        });
        L.push('');
        L.push(CLOSE[tone]);
        L.push('');
        L.push('\u2014 ' + you);
        current = L.join('\n');
        TN.el(SLUG + '-output').textContent = current;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not write your vows. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your vows first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your vows first.'); return; }
      TN.downloadText(current, 'wedding-vows.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
