/* Podcast Episode Title Generator — topic interpolated into 20 formats. */
(function () {
  'use strict';
  var SLUG = 'podcast-episode-title-generator';

  var FORMATS = [
    function (t) { return 'Ep. ' + ep() + ': ' + T(t) + ' — The Complete Guide'; },
    function (t) { return 'How to Master ' + T(t) + ' (Step by Step)'; },
    function (t) { return 'The Truth About ' + T(t) + ' Nobody Tells You'; },
    function (t) { return 'Why ' + T(t) + ' Matters More Than You Think'; },
    function (t) { return 'I Tried ' + T(t) + ' for 30 Days — Here\u2019s What Happened'; },
    function (t) { return '5 ' + T(t) + ' Mistakes You\u2019re Probably Making'; },
    function (t) { return 'The Beginner\u2019s Guide to ' + T(t); },
    function (t) { return T(t) + ': Myths vs. Reality'; },
    function (t) { return 'What I Wish I Knew About ' + T(t); },
    function (t) { return 'The Future of ' + T(t); },
    function (t) { return T(t) + ' Q&A: Your Questions Answered'; },
    function (t) { return 'From Zero to Hero: My ' + T(t) + ' Journey'; },
    function (t) { return 'The ' + T(t) + ' Playbook'; },
    function (t) { return 'Breaking Down ' + T(t) + ' in 2026'; },
    function (t) { return '7 Surprising Facts About ' + T(t); },
    function (t) { return T(t) + ' Deep Dive'; },
    function (t) { return 'Can ' + T(t) + ' Really Change Your Life?'; },
    function (t) { return 'The Dark Side of ' + T(t); },
    function (t) { return T(t) + ' for Busy People'; },
    function (t) { return 'Everything You Need to Know About ' + T(t); }
  ];

  function ep() { return 1 + Math.floor(Math.random() * 200); }
  function T(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var val = document.createElement('div');
      val.textContent = t;
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
      var raw = TN.el(SLUG + '-topic').value.trim();
      if (!raw) { TN.setErr(SLUG + '-error', 'Please enter your episode topic.'); return; }
      var t = raw.toLowerCase();
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 300) {
        guard++;
        var title = FORMATS[Math.floor(Math.random() * FORMATS.length)](t);
        if (!seen[title]) { seen[title] = true; out.push(title); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate titles. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
