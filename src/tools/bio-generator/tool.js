/* Bio Generator — template-based bio variants */
(function () {
  'use strict';
  var nameEl = TN.el('bio-generator-name');
  var profEl = TN.el('bio-generator-profession');
  var intEl = TN.el('bio-generator-interests');
  var toneEl = TN.el('bio-generator-tone');
  var list = TN.el('bio-generator-list');
  if (!nameEl || !profEl || !toneEl || !list) return;

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function article(w) {
    if (!w) return 'a';
    return /^[aeiou]/i.test(w.trim()) ? 'an' : 'a';
  }
  function interests() {
    var raw = intEl ? intEl.value : '';
    return raw.split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 0; });
  }
  function pickN(arr, n) {
    var a = arr.slice().sort(function () { return Math.random() - 0.5; });
    return a.slice(0, n);
  }

  var TEMPLATES = {
    professional: [
      function (n, p, ins) { return n + ' | ' + cap(p) + ' turning ideas into results. ' + ins.join(' · ') + ' enthusiast. DM open for collaborations.'; },
      function (n, p, ins) { return cap(article(p)) + ' ' + p + ' passionate about ' + ins.slice(0, 2).join(' and ') + '. Sharing insights on ' + p + (ins[2] ? ' and ' + ins[2] : '') + '. Let\u2019s connect.'; },
      function (n, p, ins) { return 'Hi, I\u2019m ' + n + ' \u2014 ' + article(p) + ' ' + p + ' focused on ' + ins.join(', ') + '. New posts every week.'; },
      function (n, p, ins) { return n + ' | ' + cap(p) + '\n' + ins.join(' · ') + '\nDM for business inquiries.'; }
    ],
    funny: [
      function (n, p, ins) { return n + ' | Professional ' + p + ' by day, ' + ins[0] + ' enthusiast by night. Powered by ' + (ins[1] || 'coffee') + ' and poor decisions.'; },
      function (n, p, ins) { return 'Warning: ' + n + ' talks about ' + ins[0] + ' way too much. ' + cap(p) + ' (allegedly). ' + cap(ins[1] || 'memes') + ' apologist.'; },
      function (n, p, ins) { return n + ' \u2014 I ' + p + ' for a living and ' + ins[0] + ' for fun. Hobbies include ' + (ins[1] || 'napping') + ' and avoiding responsibilities.'; },
      function (n, p, ins) { return 'Part-time ' + p + ', full-time ' + ins[0] + ' lover. ' + n + ' does not share ' + (ins[1] || 'snacks') + '. You\u2019ve been warned.'; }
    ],
    minimalist: [
      function (n, p, ins) { return n + ' \u2014 ' + p + '.'; },
      function (n, p, ins) { return n + ' | ' + ins.slice(0, 2).join(' · '); },
      function (n, p, ins) { return cap(p) + '. ' + cap(ins[0]) + '. ' + cap(ins[1] || 'More soon') + '.'; },
      function (n, p, ins) { return n + ' · ' + p + ' · ' + ins[0]; }
    ],
    inspirational: [
      function (n, p, ins) { return n + ' | ' + cap(p) + ' chasing dreams and ' + ins[0] + '. Every day is a new page \u2014 make yours count.'; },
      function (n, p, ins) { return 'Dream big, start small. I\u2019m ' + n + ', ' + article(p) + ' ' + p + ' on a journey through ' + ins.slice(0, 2).join(' and ') + '.'; },
      function (n, p, ins) { return n + ' \u2014 turning ' + ins[0] + ' into purpose. ' + cap(p) + ' by craft, dreamer by heart.'; },
      function (n, p, ins) { return 'Your story matters. I\u2019m ' + n + ', ' + article(p) + ' ' + p + ' sharing ' + ins.slice(0, 2).join(', ') + ' and lessons along the way.'; }
    ],
    emoji: [
      function (n, p, ins) { return '✨ ' + n + ' ✨\n📍 Pakistan | 💼 ' + cap(p || 'creator') + '\n❤️ ' + (ins[0] || 'good vibes') + ' | 🌟 ' + (ins[1] || 'new adventures'); },
      function (n, p, ins) { return '👑 ' + n + '\n💼 ' + cap(p || 'creator') + ' by day, ' + (ins[0] || 'dreamer') + ' by night 🌙\n☕ Fueled by chai & ' + (ins[1] || 'good vibes'); },
      function (n, p, ins) { return '🌸 Hi, I\u2019m ' + n + '!\n🎨 ' + cap(p || 'creative soul') + '\n💭 Into ' + (ins[0] || 'creativity') + ', ' + (ins[1] || 'music') + ' & ' + (ins[2] || 'sunsets 🌅') + '\n💌 DM open!'; },
      function (n, p, ins) { return '🚀 ' + n + ' | ' + cap(p || 'dreamer') + '\n🎯 Mission: ' + (ins[0] || 'chasing dreams') + '\n💪 ' + (ins[1] || 'positive vibes') + ' only\n📩 Collabs? Let\u2019s talk!'; },
      function (n, p, ins) { return '💫 ' + n + ' 💫\n📸 ' + cap(p || 'storyteller') + '\n🌈 ' + (ins[0] || 'adventures') + ' · ' + (ins[1] || 'photography') + '\n🦋 Living my best life'; },
      function (n, p, ins) { return '🎭 ' + n + ' \u2014 ' + article(p || 'creative') + ' ' + (p || 'creative') + '\n🍕 Loves ' + (ins[0] || 'good food') + ' & ' + (ins[1] || 'great company') + '\n⚡ Part-time legend, full-time ' + (ins[2] || 'vibes'); },
      function (n, p, ins) { return '🌙 Night owl | ☀️ Day dreamer\n👋 ' + n + ' · 💼 ' + cap(p || 'creator') + '\n🎵 ' + (ins[0] || 'music') + ' enthusiast\n💌 Say hi, don\u2019t be shy!'; },
      function (n, p, ins) { return '💎 ' + n + '\n🔥 ' + cap(p || 'hustler') + ' making moves\n🏆 Into ' + (ins[0] || 'big goals') + ' & ' + (ins[1] || 'bigger dreams') + '\n📲 Follow the journey 👇'; },
      function (n, p, ins) { return '🦋 ' + n + ' 🦋\n🌺 ' + cap(p || 'free spirit') + ' from Pakistan 🇵🇰\n✈️ ' + (ins[0] || 'travelling') + ' · 📖 ' + (ins[1] || 'reading') + ' · 🎨 ' + (ins[2] || 'creating') + '\n💖 Spread love, not hate'; },
      function (n, p, ins) { return '⭐ ' + n.toUpperCase() + ' ⭐\n💼 ' + cap(p || 'creator') + ' | 🎯 ' + (ins[0] || 'dream chaser') + '\n💬 ' + (ins[1] || 'Storytime') + ' every week\n🔔 Turn on notifications!'; }
    ]
  };

  function generate() {
    try {
      TN.clearErr('bio-generator-error');
      var n = nameEl.value.trim();
      var p = profEl.value.trim().toLowerCase();
      if (!n) { TN.setErr('bio-generator-error', 'Please enter your name.'); return; }
      if (!p) { TN.setErr('bio-generator-error', 'Please enter your profession.'); return; }
      var ins = interests();
      if (ins.length < 2) ins = ins.concat(['creativity', 'good vibes']).slice(0, 2);
      if (ins.length < 3) ins.push('new adventures');
      var tone = toneEl.value;
      var tpl = TEMPLATES[tone] || TEMPLATES.professional;
      list.innerHTML = '';
      tpl.forEach(function (fn, i) {
        var bio = fn(n, p, pickN(ins, 3));
        var row = document.createElement('div');
        row.className = 'copy-row mt';
        var res = document.createElement('div');
        res.className = 'result';
        res.style.whiteSpace = 'pre-line';
        var label = document.createElement('div');
        label.className = 'muted';
        label.style.fontSize = '.78rem';
        label.textContent = 'Bio ' + (i + 1);
        var val = document.createElement('div');
        val.textContent = bio;
        res.appendChild(label);
        res.appendChild(val);
        var btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm';
        btn.type = 'button';
        btn.textContent = 'Copy';
        btn.addEventListener('click', function () {
          TN.copy(bio).then(function (ok) {
            btn.textContent = ok ? 'Copied ✓' : 'Copy';
            if (!ok) TN.setErr('bio-generator-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
            setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
          });
        });
        res.style.cursor = 'pointer';
        res.addEventListener('click', function () { btn.click(); });
        row.appendChild(res);
        row.appendChild(btn);
        list.appendChild(row);
      });
    } catch (e) {
      TN.setErr('bio-generator-error', 'Could not generate bios. Please try again.');
    }
  }

  var customEl = TN.el('bio-generator-custom');
  var sprinkled = TN.el('bio-generator-sprinkled');

  var EMOJI_POOL = ['✨', '🌟', '💖', '🔥', '⭐', '🌊', '💫', '🎉', '💯', '🚀', '🌈', '💪', '😍', '🤩', '💎', '🌸', '🍀', '🎨', '📸', '🎵', '💡', '🌙', '☀️', '🦋', '🌺', '🍕', '☕', '🎮', '🏔️', '✈️'];

  function sprinkle() {
    try {
      TN.clearErr('bio-generator-error');
      var t = customEl ? customEl.value.trim() : '';
      if (!t) { TN.setErr('bio-generator-error', 'Please write your own bio first.'); return; }
      var words = t.split(/\s+/);
      var out = words.map(function (w, i) {
        // Tasteful: ~1 emoji per 1–2 words; never break the words themselves
        if (i > 0 && Math.random() < 0.6) {
          return w + ' ' + EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
        }
        return w;
      }).join(' ');
      if (!sprinkled) return;
      sprinkled.innerHTML = '';
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.whiteSpace = 'pre-line';
      var label = document.createElement('div');
      label.className = 'muted';
      label.style.fontSize = '.78rem';
      label.textContent = 'Sprinkled bio';
      var val = document.createElement('div');
      val.textContent = out;
      res.appendChild(label);
      res.appendChild(val);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        TN.copy(out).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          if (!ok) TN.setErr('bio-generator-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      });
      res.style.cursor = 'pointer';
      res.addEventListener('click', function () { btn.click(); });
      row.appendChild(res);
      row.appendChild(btn);
      sprinkled.appendChild(row);
    } catch (e) {
      TN.setErr('bio-generator-error', 'Could not sprinkle emojis. Please try again.');
    }
  }

  TN.on('bio-generator-generate', 'click', generate);
  TN.on('bio-generator-sprinkle', 'click', sprinkle);
})();
