/* Content Idea Generator — niche interpolated across 10 formats. */
(function () {
  'use strict';
  var SLUG = 'content-idea-generator';

  var FORMATS = [
    { f: 'How-to', t: function (n) { return 'How to get started with ' + n + ' in 7 simple steps'; } },
    { f: 'Listicle', t: function (n) { return '15 ' + n + ' tips that actually work in 2026'; } },
    { f: 'Story', t: function (n) { return 'My first year doing ' + n + ': what I learned the hard way'; } },
    { f: 'Myth-busting', t: function (n) { return '7 myths about ' + n + ' that everyone believes'; } },
    { f: 'Case study', t: function (n) { return 'How I grew my ' + n + ' results by 300% in 90 days'; } },
    { f: 'Comparison', t: function (n) { return n + ' for beginners vs. pros: what changes'; } },
    { f: 'Beginner guide', t: function (n) { return 'The complete beginner\u2019s guide to ' + n; } },
    { f: 'Mistakes', t: function (n) { return '10 common ' + n + ' mistakes (and how to fix them)'; } },
    { f: 'Trends', t: function (n) { return n + ' trends to watch this year'; } },
    { f: 'Behind-the-scenes', t: function (n) { return 'A day in my life doing ' + n + ' (honest version)'; } },
    { f: 'How-to', t: function (n) { return 'The exact ' + n + ' routine I follow every morning'; } },
    { f: 'Listicle', t: function (n) { return '9 tools every ' + n + ' lover should know about'; } },
    { f: 'Story', t: function (n) { return 'I tried ' + n + ' for 30 days — here\u2019s what happened'; } },
    { f: 'Myth-busting', t: function (n) { return 'Stop believing these ' + n + ' lies'; } },
    { f: 'Comparison', t: function (n) { return 'Cheap vs. expensive ' + n + ': is it worth it?'; } }
  ];

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (it) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var lab = document.createElement('div');
      lab.className = 'muted';
      lab.style.fontSize = '.78rem';
      lab.textContent = it.f;
      var val = document.createElement('div');
      val.textContent = it.t;
      res.appendChild(lab);
      res.appendChild(val);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        TN.copy(it.t).then(function (ok) {
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
      var raw = TN.el(SLUG + '-niche').value.trim();
      if (!raw) { TN.setErr(SLUG + '-error', 'Please enter your niche.'); return; }
      var n = raw.toLowerCase();
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 300) {
        guard++;
        var f = FORMATS[Math.floor(Math.random() * FORMATS.length)];
        var t = f.t(n);
        if (!seen[t]) { seen[t] = true; out.push({ f: f.f, t: t }); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate ideas. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
