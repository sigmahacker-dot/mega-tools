/* YouTube Title Generator — proven title templates */
(function () {
  'use strict';
  var input = TN.el('youtube-title-generator-input');
  var list = TN.el('youtube-title-generator-list');
  if (!input || !list) return;

  var TEMPLATES = [
    'I Tried {K} for 30 Days \u2014 Here\u2019s What Happened',
    '10 {K} Mistakes Beginners Always Make',
    'The Ultimate {K} Guide (Step by Step)',
    'Why {K} Is Harder Than You Think',
    'I Spent 24 Hours Doing {K} (Challenge)',
    'Don\u2019t Start {K} Until You Watch This',
    'What NOBODY Tells You About {K}',
    'Is {K} Worth It in 2026? (Honest Review)',
    'How I Mastered {K} in Just 7 Days',
    '{K}: 7 Secrets the Pros Won\u2019t Tell You'
  ];

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function generate() {
    try {
      TN.clearErr('youtube-title-generator-error');
      var kw = input.value.trim();
      if (!kw) { TN.setErr('youtube-title-generator-error', 'Type your video keyword first.'); return; }
      var K = cap(kw);
      list.innerHTML = '';
      TEMPLATES.forEach(function (tpl, i) {
        var title = tpl.split('{K}').join(K);
        var row = document.createElement('div');
        row.className = 'copy-row mt';
        var res = document.createElement('div');
        res.className = 'result';
        var lab = document.createElement('div');
        lab.className = 'muted';
        lab.style.fontSize = '.78rem';
        lab.textContent = 'Title ' + (i + 1);
        var val = document.createElement('div');
        val.textContent = title;
        res.appendChild(lab);
        res.appendChild(val);
        var btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm';
        btn.type = 'button';
        btn.textContent = 'Copy';
        function doCopy() {
          TN.copy(title).then(function (ok) {
            btn.textContent = ok ? 'Copied ✓' : 'Copy';
            if (!ok) TN.setErr('youtube-title-generator-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
            setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
          });
        }
        btn.addEventListener('click', doCopy);
        res.style.cursor = 'pointer';
        res.addEventListener('click', doCopy);
        row.appendChild(res);
        row.appendChild(btn);
        list.appendChild(row);
      });
    } catch (e) {
      TN.setErr('youtube-title-generator-error', 'Could not generate titles. Please try again.');
    }
  }

  TN.on('youtube-title-generator-generate', 'click', generate);
  TN.on('youtube-title-generator-input', 'keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); generate(); }
  });
})();
