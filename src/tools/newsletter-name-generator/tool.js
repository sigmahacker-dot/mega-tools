/* Newsletter Name Generator — niche + style format banks. */
(function () {
  'use strict';
  var SLUG = 'newsletter-name-generator';

  var STYLES = {
    classic: [
      function (n) { return 'The ' + n + ' Times'; },
      function (n) { return 'The ' + n + ' Journal'; },
      function (n) { return 'The ' + n + ' Chronicle'; },
      function (n) { return 'The ' + n + ' Gazette'; },
      function (n) { return n + ' Weekly'; },
      function (n) { return 'The Morning ' + n; },
      function (n) { return 'The ' + n + ' Post'; },
      function (n) { return 'Sunday ' + n; }
    ],
    modern: [
      function (n) { return n + ' Brief'; },
      function (n) { return n + ' Digest'; },
      function (n) { return n + ' Signal'; },
      function (n) { return 'The ' + n + ' Edit'; },
      function (n) { return n + '/Decoded'; },
      function (n) { return 'TL;DR ' + n; },
      function (n) { return n + ' Stack'; },
      function (n) { return 'The ' + n + ' Drop'; }
    ],
    playful: [
      function (n) { return 'The Daily ' + n; },
      function (n) { return n + ' & Chill'; },
      function (n) { return 'Oh Hey, ' + n; },
      function (n) { return 'The ' + n + ' Scoop'; },
      function (n) { return n + ' Bits'; },
      function (n) { return 'Good Morning, ' + n; },
      function (n) { return 'The ' + n + ' Party'; },
      function (n) { return n + ' Yum'; }
    ],
    premium: [
      function (n) { return 'The ' + n + ' Review'; },
      function (n) { return n + ' Insider'; },
      function (n) { return 'The ' + n + ' Standard'; },
      function (n) { return n + ' Intelligence'; },
      function (n) { return 'The ' + n + ' Ledger'; },
      function (n) { return n + ' Executive Brief'; },
      function (n) { return 'The ' + n + ' Memo'; },
      function (n) { return n + ' Pro'; }
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
      val.style.fontWeight = '600';
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
      var raw = TN.el(SLUG + '-niche').value.trim();
      if (!raw) { TN.setErr(SLUG + '-error', 'Please enter your newsletter niche.'); return; }
      var n = raw.split(' ').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
      var style = TN.el(SLUG + '-style').value;
      var bank = STYLES[style] || STYLES.classic;
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 300) {
        guard++;
        var name = bank[Math.floor(Math.random() * bank.length)](n);
        if (!seen[name]) { seen[name] = true; out.push(name); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
