/* Instagram Caption Templates — 40+ categorized templates with fill-in blanks. */
(function () {
  'use strict';

  var SLUG = 'instagram-caption-templates';
  var lastCaption = '';

  var BANK = {
    'Motivational': [
      'Monday mindset: [goal] loading… 💪 #mondaymotivation #goals',
      'Small steps every day lead to [big result]. Keep going. ✨',
      'Don\'t wait for opportunity. Create [opportunity]. 🚀',
      'Your only limit is [limiting belief]. Break it today. 🔥',
      'Progress > perfection. Day [number] of becoming [adjective]. 🌱'
    ],
    'Funny': [
      'I\'m not lazy, I\'m on [activity] mode. 😴',
      'My bed is a magical place where I suddenly remember [thing I forgot]. 🛏️',
      'Adulting is hard, so I\'m [funny activity] instead. 🤷',
      'I put the "pro" in [procrastination-related word]. 😎',
      'Running late is my cardio. Today\'s excuse: [excuse]. 🏃'
    ],
    'Travel': [
      'Lost in [place], found myself. ✈️ #wanderlust #[place]adventures',
      '[Place] diaries: day [number] and I never want to leave. 🌍',
      'Collect moments, not [things]. Currently collecting in [place]. 📸',
      'Passport: stamped. Heart: full. Next stop: [destination]. 🧳',
      'Views like this make [long journey] worth it. #travelgram'
    ],
    'Food': [
      'Current mood: [food] o\'clock. 🍕 #foodie',
      'Life is short. Eat the [dessert]. 🍰',
      'Powered by [food] and [drink]. ☕',
      'Recipe for happiness: 1 part [ingredient], 2 parts [ingredient]. 😋',
      'I followed my heart and it led me to [restaurant/food]. ❤️'
    ],
    'Selfie': [
      'Just me, [adjective] as ever. 💁 #selfie',
      'Confidence level: [outfit/item]. ✨',
      'New [haircut/outfit/mood], who dis? 😏',
      'Smiling because [reason]. 😊',
      'Serving [adjective] looks and [adjective] energy. 💅'
    ],
    'Business': [
      'Behind every [product/service] is [number] hours of [hard work]. 💼',
      'We just launched [thing]! Link in bio. 🚀 #smallbusiness',
      'Client win: [result] for [client type]. This is why we do it. 📈',
      'Lesson learned this week: [lesson]. #entrepreneur',
      'From [humble start] to [milestone] — thank you for [number] followers! 🙏'
    ],
    'Love & Friends': [
      'You + me + [activity] = perfect day. ❤️',
      'My favorite [person] doing my favorite [thing]. 🥰',
      'Grateful for [name] and their endless [quality]. 💕',
      'Partners in [crime/activity] since [year]. 👯',
      'Home is wherever [person] is. 🏠❤️'
    ],
    'Fitness': [
      'Sweat now, shine later. Today: [workout]. 💦 #fitness',
      'Stronger than my [excuse] today. 🏋️',
      '[Number] km down, [goal] to go. 🏃 #runner',
      'The only bad workout is [the one you skipped]. Let\'s go! 🔥',
      'Sore today, [adjective] tomorrow. #gymlife'
    ],
    'Nature': [
      'Nature doesn\'t hurry, yet everything [verb]. 🌿',
      'Chasing [sunsets/waterfalls] in [place]. 🌅',
      'Vitamin [D/sea] loading… 🏖️',
      'The mountains are calling and I must [verb]. ⛰️',
      'Green therapy: [number] minutes in [place]. 🌳'
    ]
  };

  function blanksOf(tpl) {
    var m = tpl.match(/\[([^\]]+)\]/g) || [];
    return m.map(function (x) { return x.slice(1, -1); });
  }

  function renderCats() {
    var catSel = TN.el(SLUG + '-cat');
    catSel.innerHTML = Object.keys(BANK).map(function (c) {
      return '<option value="' + TN.esc(c) + '">' + TN.esc(c) + '</option>';
    }).join('');
    renderTpls();
  }

  function renderTpls() {
    var cat = TN.el(SLUG + '-cat').value;
    var tplSel = TN.el(SLUG + '-tpl');
    tplSel.innerHTML = BANK[cat].map(function (t, i) {
      return '<option value="' + i + '">' + TN.esc(t.slice(0, 60)) + (t.length > 60 ? '…' : '') + '</option>';
    }).join('');
    renderBlanks();
  }

  function renderBlanks() {
    var cat = TN.el(SLUG + '-cat').value;
    var tpl = BANK[cat][parseInt(TN.el(SLUG + '-tpl').value, 10)];
    var blanks = blanksOf(tpl);
    var box = TN.el(SLUG + '-blanks');
    if (!blanks.length) { box.innerHTML = '<p class="muted">No blanks in this template — just fill and copy.</p>'; return; }
    box.innerHTML = blanks.map(function (b, i) {
      return '<div class="field"><label for="' + SLUG + '-b' + i + '">[' + TN.esc(b) + ']</label>' +
        '<input class="input" type="text" id="' + SLUG + '-b' + i + '" data-blank="' + TN.esc(b) + '" placeholder="' + TN.esc(b) + '"></div>';
    }).join('');
  }

  function fill() {
    TN.clearErr(SLUG + '-error');
    var cat = TN.el(SLUG + '-cat').value;
    var tpl = BANK[cat][parseInt(TN.el(SLUG + '-tpl').value, 10)];
    var inputs = TN.el(SLUG + '-blanks').querySelectorAll('[data-blank]');
    var caption = tpl;
    for (var i = 0; i < inputs.length; i++) {
      var val = inputs[i].value.trim();
      if (!val) { TN.setErr(SLUG + '-error', 'Fill in every [blank] first.'); return; }
      caption = caption.replace('[' + inputs[i].getAttribute('data-blank') + ']', val);
    }
    lastCaption = caption;
    TN.el(SLUG + '-out').textContent = caption;
    TN.el(SLUG + '-count').textContent = caption.length + ' characters, ' + caption.split(/\s+/).length + ' words.';
  }

  function surprise() {
    var cats = Object.keys(BANK);
    var cat = cats[Math.floor(Math.random() * cats.length)];
    TN.el(SLUG + '-cat').value = cat;
    renderTpls();
    TN.el(SLUG + '-tpl').value = String(Math.floor(Math.random() * BANK[cat].length));
    renderBlanks();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-cat')) return;
      renderCats();
      TN.el(SLUG + '-cat').addEventListener('change', renderTpls);
      TN.el(SLUG + '-tpl').addEventListener('change', renderBlanks);
      TN.on(SLUG + '-fill', 'click', fill);
      TN.on(SLUG + '-rand', 'click', surprise);
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastCaption) { TN.setErr(SLUG + '-error', 'Fill a caption first.'); return; }
        TN.copy(lastCaption).then(function () { TN.clearErr(SLUG + '-error'); })
          .catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();