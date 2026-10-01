/* Webinar Title Generator — topic + audience -> 10 titles + subtitles. */
(function () {
  'use strict';
  var SLUG = 'webinar-title-generator';

  var TITLES = [
    function (t) { return 'How to Master ' + T(t) + ' in 60 Minutes'; },
    function (t) { return 'The ' + T(t) + ' Masterclass'; },
    function (t) { return T(t) + ' Secrets the Pros Don\u2019t Share'; },
    function (t) { return 'From Beginner to Confident: ' + T(t) + ' Live'; },
    function (t) { return 'The Ultimate ' + T(t) + ' Workshop'; },
    function (t) { return T(t) + ' in 2026: What\u2019s Working Now'; },
    function (t) { return '5 ' + T(t) + ' Strategies You Can Use Today'; },
    function (t) { return 'The ' + T(t) + ' Bootcamp'; },
    function (t) { return 'Stop Guessing: ' + T(t) + ' Made Simple'; },
    function (t) { return 'Live Training: ' + T(t) + ' From Zero to Results'; },
    function (t) { return 'The ' + T(t) + ' Playbook Revealed'; },
    function (t) { return T(t) + ' Q&A: Ask Us Anything Live'; },
    function (t) { return 'Double Your ' + T(t) + ' Results This Quarter'; },
    function (t) { return 'The Fast Track to ' + T(t) + ' Success'; }
  ];
  var SUBS = [
    function (a) { return 'A live workshop for ' + a + '.'; },
    function (a) { return 'Free training designed for ' + a + '.'; },
    function (a) { return 'What every ' + aSing(a) + ' needs to know in 2026.'; },
    function (a) { return 'Join hundreds of ' + a + ' learning this live.'; },
    function (a) { return 'A no-fluff session built for ' + a + '.'; },
    function (a) { return 'Real strategies, real examples — made for ' + a + '.'; }
  ];

  function T(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function aSing(a) {
    // naive singularization for subtitle grammar
    if (/s$/.test(a)) return a.slice(0, -1);
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (it) {
      var text = it.title + ' — ' + it.sub;
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var val = document.createElement('div');
      val.style.fontWeight = '600';
      val.textContent = it.title;
      var sub = document.createElement('div');
      sub.className = 'muted';
      sub.textContent = it.sub;
      res.appendChild(val);
      res.appendChild(sub);
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
      list.appendChild(row);
    });
  }

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      var rawT = TN.el(SLUG + '-topic').value.trim();
      var rawA = TN.el(SLUG + '-audience').value.trim();
      if (!rawT) { TN.setErr(SLUG + '-error', 'Please enter your webinar topic.'); return; }
      if (!rawA) { TN.setErr(SLUG + '-error', 'Please enter your target audience.'); return; }
      var t = rawT.toLowerCase();
      var a = rawA.toLowerCase();
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 300) {
        guard++;
        var title = pick(TITLES)(t);
        if (!seen[title]) {
          seen[title] = true;
          out.push({ title: title, sub: pick(SUBS)(a) });
        }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate titles. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
