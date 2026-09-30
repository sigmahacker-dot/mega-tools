/* Caption Generator — mood-based caption templates */
(function () {
  'use strict';
  var topicEl = TN.el('caption-generator-topic');
  var moodEl = TN.el('caption-generator-mood');
  var list = TN.el('caption-generator-list');
  if (!topicEl || !moodEl || !list) return;

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  var MOODS = {
    funny: {
      templates: [
        'POV: you finally tried {t} and now there\u2019s no going back.',
        'Me: I don\u2019t need {t}. Also me, 5 minutes later: absolutely needs {t}.',
        'Plot twist: {t} was the best decision I made all week.',
        'Nobody: ... Absolutely nobody: ... Me: let me tell you about {t}.',
        '{T} hits different when you\u2019re not expecting it.',
        'Day 1 of pretending {t} is my entire personality.',
        'If {t} is wrong, I don\u2019t want to be right.',
        'Currently accepting applications for someone to enjoy {t} with me.'
      ],
      tags: ['funny', 'memes', 'lol', 'comedy', 'relatable']
    },
    aesthetic: {
      templates: [
        '{t}, softly.',
        'Golden hour and {t} \u2014 name a better duo.',
        'Romanticizing {t}, one moment at a time.',
        'A quiet kind of magic: {t}.',
        'Collecting moments, not things \u2014 starting with {t}.',
        'In a world of noise, {t} is my soft place to land.',
        '{T}, but make it poetry.',
        'Some things just feel like home. Like {t}.'
      ],
      tags: ['aesthetic', 'vibes', 'softaesthetic', 'goldenhour', 'moodygrams']
    },
    motivational: {
      templates: [
        'Start where you are. {T} is proof that small steps count.',
        'The best time to begin was yesterday. The second best time? Right now \u2014 with {t}.',
        'Discipline beats motivation. {T} taught me that.',
        'Don\u2019t wait for perfect. {T} started messy too.',
        'One year from now you\u2019ll wish you started {t} today.',
        'Progress, not perfection. Here\u2019s my {t} journey.',
        'Doubt kills more dreams than failure. {T} anyway.',
        'Your only competition is who you were yesterday. {T} is my proof.'
      ],
      tags: ['motivation', 'mindset', 'growth', 'nevergiveup', 'dreambig']
    },
    savage: {
      templates: [
        'I don\u2019t chase. I attract \u2014 especially {t}.',
        'Sorry, I can\u2019t hear you over how good {t} is.',
        'Levels to this. {T} is mine.',
        'Unbothered and all about {t}.',
        'I said what I said. {T} > everything.',
        'Keep your opinions, I\u2019ll keep {t}.',
        'Not everyone gets it. {T} isn\u2019t for everyone.',
        'Zero competition when you\u2019re in your own lane \u2014 the {t} lane.'
      ],
      tags: ['savage', 'attitude', 'bossmode', 'unbothered', 'levelup']
    },
    cute: {
      templates: [
        'A little bit of {t} makes everything better.',
        'Happiness is {t} and a cozy day.',
        'Soft moments and {t}.',
        'Cutie with a {t} agenda.',
        '{T} makes my heart do a happy dance.',
        'Sprinkling a little {t} magic on your feed.',
        'Smol joys: {t} edition.',
        'Life is sweet, especially with {t}.'
      ],
      tags: ['cute', 'softlife', 'wholesome', 'cuteness', 'cozyvibes']
    }
  };

  function shuffled(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function addRow(container, label, text) {
    var row = document.createElement('div');
    row.className = 'copy-row mt';
    var res = document.createElement('div');
    res.className = 'result';
    var lab = document.createElement('div');
    lab.className = 'muted';
    lab.style.fontSize = '.78rem';
    lab.textContent = label;
    var val = document.createElement('div');
    val.textContent = text;
    res.appendChild(lab);
    res.appendChild(val);
    var btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-sm';
    btn.type = 'button';
    btn.textContent = 'Copy';
    function doCopy() {
      TN.copy(text).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        if (!ok) TN.setErr('caption-generator-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
        setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
      });
    }
    btn.addEventListener('click', doCopy);
    res.style.cursor = 'pointer';
    res.addEventListener('click', doCopy);
    row.appendChild(res);
    row.appendChild(btn);
    container.appendChild(row);
  }

  function generate() {
    try {
      TN.clearErr('caption-generator-error');
      var topic = topicEl.value.trim();
      if (!topic) { TN.setErr('caption-generator-error', 'Describe your post topic first.'); return; }
      var mood = MOODS[moodEl.value] || MOODS.funny;
      list.innerHTML = '';
      var picks = shuffled(mood.templates).slice(0, 6);
      picks.forEach(function (tpl, i) {
        var c = tpl.split('{T}').join(cap(topic)).split('{t}').join(topic);
        addRow(list, 'Caption ' + (i + 1), c);
      });
      var STOP = { the: 1, a: 1, an: 1, and: 1, or: 1, of: 1, to: 1, at: 1, in: 1, on: 1, for: 1, with: 1, is: 1, are: 1, my: 1 };
      var words = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function (w) { return w.length > 2 && !STOP[w]; }).slice(0, 3);
      var tags = words.map(function (w) { return '#' + w; }).concat(mood.tags.map(function (t) { return '#' + t; }));
      addRow(list, 'Hashtags', tags.join(' '));
    } catch (e) {
      TN.setErr('caption-generator-error', 'Could not generate captions. Please try again.');
    }
  }

  TN.on('caption-generator-generate', 'click', generate);
})();
