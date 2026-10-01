/* Email Subject Line Generator — topic + tone -> 10 hook-based lines. */
(function () {
  'use strict';
  var SLUG = 'email-subject-line-generator';

  var TPL = {
    curious: [
      function (t) { return 'The truth about ' + t + ' (nobody tells you this)'; },
      function (t) { return 'What I learned about ' + t + ' surprised me'; },
      function (t) { return 'You won\u2019t believe what happened with ' + t; },
      function (t) { return 'The ' + t + ' secret hiding in plain sight'; },
      function (t) { return 'Why everyone is talking about ' + t; },
      function (t) { return 'I tried ' + t + ' so you don\u2019t have to'; },
      function (t) { return 'The one ' + t + ' question nobody asks'; },
      function (t) { return 'What\u2019s really going on with ' + t + '?'; }
    ],
    urgent: [
      function (t) { return 'Last chance: ' + t + ' ends tonight'; },
      function (t) { return 'Only 24 hours left for ' + t; },
      function (t) { return 'Don\u2019t miss out on ' + t; },
      function (t) { return t + ': doors close at midnight'; },
      function (t) { return 'Final call — ' + t + ' spots almost gone'; },
      function (t) { return 'Today only: ' + t; },
      function (t) { return 'Your ' + t + ' opportunity expires soon'; },
      function (t) { return 'Act now: ' + t + ' won\u2019t wait'; }
    ],
    friendly: [
      function (t) { return 'A little something about ' + t + ' for you'; },
      function (t) { return 'Hey! Quick thought on ' + t; },
      function (t) { return 'You\u2019ll love this ' + t + ' update'; },
      function (t) { return 'Sharing my favorite ' + t + ' find'; },
      function (t) { return 'Made this ' + t + ' guide just for you'; },
      function (t) { return 'Good news about ' + t + '!'; },
      function (t) { return 'Let\u2019s talk about ' + t; },
      function (t) { return 'Your weekly ' + t + ' dose is here'; }
    ],
    professional: [
      function (t) { return t + ': key insights and next steps'; },
      function (t) { return 'Your ' + t + ' briefing for this week'; },
      function (t) { return 'New research on ' + t; },
      function (t) { return t + ' — quarterly update'; },
      function (t) { return 'Action required: ' + t + ' review'; },
      function (t) { return 'Best practices for ' + t + ' in 2026'; },
      function (t) { return 'Your ' + t + ' report is ready'; },
      function (t) { return 'Industry outlook: ' + t; }
    ],
    funny: [
      function (t) { return 'This ' + t + ' email is 10% off seriousness'; },
      function (t) { return 'Warning: ' + t + ' puns inside'; },
      function (t) { return 'We put the \u201cfun\u201d in ' + t; },
      function (t) { return t + ': now with 100% more awesome'; },
      function (t) { return 'Breaking: local inbox discovers ' + t; },
      function (t) { return 'Your ' + t + ' horoscope says \u201copen me\u201d'; },
      function (t) { return 'Plot twist: this ' + t + ' email is actually fun'; },
      function (t) { return 'Free ' + t + ' advice (worth every penny)'; }
    ]
  };

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
      if (!raw) { TN.setErr(SLUG + '-error', 'Please enter your email topic.'); return; }
      var t = raw.toLowerCase();
      var tone = TN.el(SLUG + '-tone').value;
      var bank = TPL[tone] || TPL.curious;
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 300) {
        guard++;
        var s = bank[Math.floor(Math.random() * bank.length)](t);
        if (!seen[s]) { seen[s] = true; out.push(s); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate subject lines. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
