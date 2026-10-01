/* Blog Outline Generator — titles + H2/H3 outline + intro hook. */
(function () {
  'use strict';
  var SLUG = 'blog-outline-generator';

  var TITLE_T = [
    function (t) { return 'The Ultimate Guide to ' + t + ' in 2026'; },
    function (t) { return '10 ' + t + ' Tips Every Beginner Should Know'; },
    function (t) { return 'How to Master ' + t + ': A Step-by-Step Guide'; },
    function (t) { return t + ' Mistakes You\u2019re Probably Making (And How to Fix Them)'; },
    function (t) { return 'Everything You Need to Know About ' + t; },
    function (t) { return 'Why ' + t + ' Matters More Than Ever'; },
    function (t) { return 'The Beginner\u2019s Roadmap to ' + t; },
    function (t) { return '15 Proven ' + t + ' Strategies That Actually Work'; }
  ];
  var SECTIONS = [
    { h: 'What Is %T% and Why It Matters', subs: ['A simple definition', 'Why it matters right now', 'Who this guide is for'] },
    { h: 'Getting Started With %T%', subs: ['What you need before you begin', 'The basics explained simply', 'Common beginner questions'] },
    { h: 'The Core Principles of %T%', subs: ['Principle 1: start small', 'Principle 2: stay consistent', 'Principle 3: measure and adjust'] },
    { h: 'Common %T% Mistakes to Avoid', subs: ['Mistake 1 and the fix', 'Mistake 2 and the fix', 'Mistake 3 and the fix'] },
    { h: 'Advanced %T% Tips', subs: ['Level up your approach', 'Tools and resources worth using', 'Learning from the pros'] },
    { h: 'Your %T% Action Plan', subs: ['Your first 7 days', 'Your first 30 days', 'How to track progress'] }
  ];
  var HOOKS = [
    'Most people get %T% completely wrong — and it costs them time, money, and motivation. This guide fixes that, step by step.',
    'If %T% has ever felt overwhelming, you\u2019re not alone. Here\u2019s the simple, no-fluff path from confused beginner to confident practitioner.',
    'What if everything you thought you knew about %T% was only half the story? Let\u2019s start from zero and build it right.'
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function copyRow(text, label) {
    var row = document.createElement('div');
    row.className = 'copy-row mt';
    var res = document.createElement('div');
    res.className = 'result';
    res.style.cursor = 'pointer';
    if (label) {
      var lab = document.createElement('div');
      lab.className = 'muted';
      lab.style.fontSize = '.78rem';
      lab.textContent = label;
      res.appendChild(lab);
    }
    var val = document.createElement('div');
    val.textContent = text;
    res.appendChild(val);
    var btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-sm';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      TN.copy(text).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        if (!ok) TN.setErr(SLUG + '-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
        setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
      });
    });
    res.addEventListener('click', function () { btn.click(); });
    row.appendChild(res);
    row.appendChild(btn);
    return row;
  }

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      var raw = TN.el(SLUG + '-topic').value.trim();
      if (!raw) { TN.setErr(SLUG + '-error', 'Please enter your blog topic.'); return; }
      var t = raw.toLowerCase();
      var T = cap(t);

      // Titles
      var titlesEl = TN.el(SLUG + '-titles');
      titlesEl.innerHTML = '';
      var h3 = document.createElement('h3');
      h3.textContent = 'Title options';
      titlesEl.appendChild(h3);
      var seen = {}, count = 0, guard = 0;
      while (count < 5 && guard < 100) {
        guard++;
        var title = pick(TITLE_T)(T);
        if (!seen[title]) { seen[title] = true; count++; titlesEl.appendChild(copyRow(title, 'Title ' + count)); }
      }

      // Outline
      var outEl = TN.el(SLUG + '-outline');
      outEl.innerHTML = '';
      var h3b = document.createElement('h3');
      h3b.textContent = 'Outline';
      outEl.appendChild(h3b);
      var lines = [];
      lines.push('INTRO HOOK');
      lines.push(pick(HOOKS).split('%T%').join(t));
      lines.push('');
      SECTIONS.forEach(function (s, i) {
        lines.push('H2: ' + (i + 1) + '. ' + s.h.split('%T%').join(T));
        s.subs.forEach(function (sub) { lines.push('   H3: ' + sub); });
        lines.push('');
      });
      lines.push('CONCLUSION');
      lines.push('Recap the key takeaways and end with one clear call to action.');
      var fullText = lines.join('\n');
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
