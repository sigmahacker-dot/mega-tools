/* Video Script Outline Generator — topic + length -> hook/intro/points/CTA. */
(function () {
  'use strict';
  var SLUG = 'video-script-outline-generator';

  var HOOKS = [
    'Stop scrolling — this one %T% tip changed everything for me.',
    'Nobody talks about this %T% mistake, and it\u2019s costing you.',
    'In the next few minutes, I\u2019ll show you %T% the easy way.',
    'I wish someone had told me this about %T% sooner.',
    'What if %T% was actually simple? Here\u2019s the proof.'
  ];
  var POINTS = [
    'Start with the basics: what %T% really means',
    'The #1 beginner mistake with %T% (avoid this)',
    'My exact step-by-step %T% process',
    'The tool/resource that makes %T% 10x easier',
    'Real example: %T% done right',
    'What to do when %T% goes wrong',
    'Advanced %T% tactic most people miss',
    'How to measure your %T% progress'
  ];
  var CTAS = [
    'If this helped, hit subscribe — I post %T% tips every week.',
    'Comment your biggest %T% question below and I\u2019ll answer it.',
    'Grab the free %T% checklist linked in the description.',
    'Share this with someone who needs %T% help today.'
  ];
  var POINT_COUNTS = { short: 3, medium: 5, long: 7 };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      var raw = TN.el(SLUG + '-topic').value.trim();
      if (!raw) { TN.setErr(SLUG + '-error', 'Please enter your video topic.'); return; }
      var t = raw.toLowerCase();
      var T = cap(t);
      var len = TN.el(SLUG + '-length').value;
      var nPoints = POINT_COUNTS[len] || 5;

      var hookBank = HOOKS.slice(), hooks = [];
      for (var h = 0; h < 3 && hookBank.length; h++) {
        hooks.push(hookBank.splice(Math.floor(Math.random() * hookBank.length), 1)[0].split('%T%').join(t));
      }
      var pointBank = POINTS.slice(), pts = [];
      for (var p = 0; p < nPoints && pointBank.length; p++) {
        pts.push(pointBank.splice(Math.floor(Math.random() * pointBank.length), 1)[0].split('%T%').join(t));
      }

      var lines = [];
      lines.push('VIDEO SCRIPT OUTLINE — ' + T);
      lines.push('');
      lines.push('HOOK (pick one, first 5 seconds):');
      hooks.forEach(function (hk, i) { lines.push((i + 1) + '. ' + hk); });
      lines.push('');
      lines.push('INTRO (10–15 seconds):');
      lines.push('Welcome viewers, state the topic (' + t + '), and promise the payoff: what they\u2019ll know by the end.');
      lines.push('');
      lines.push('MAIN POINTS:');
      pts.forEach(function (pt, i) { lines.push((i + 1) + '. ' + pt); });
      lines.push('');
      lines.push('CTA (closing):');
      lines.push(pick(CTAS).split('%T%').join(t));
      var fullText = lines.join('\n');

      var outEl = TN.el(SLUG + '-outline');
      outEl.innerHTML = '';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.whiteSpace = 'pre-line';
      res.textContent = fullText;
      outEl.appendChild(res);
      var btnRow = document.createElement('div');
      btnRow.className = 'btn-row mt';
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline';
      btn.type = 'button';
      btn.textContent = 'Copy Full Outline';
      btn.addEventListener('click', function () {
        TN.copy(fullText).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy Full Outline';
          if (!ok) TN.setErr(SLUG + '-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
          setTimeout(function () { btn.textContent = 'Copy Full Outline'; }, 1000);
        });
      });
      btnRow.appendChild(btn);
      outEl.appendChild(btnRow);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate outline. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
