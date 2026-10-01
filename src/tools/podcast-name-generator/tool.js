/* Podcast Name Generator — topic interpolated into format banks. */
(function () {
  'use strict';
  var SLUG = 'podcast-name-generator';

  var ADJ = ['Ultimate','Modern','Bold','Curious','Daily','Honest','Raw','Smart','Unfiltered','Everyday'];
  var FORMATS = [
    function (t) { return 'The ' + t + ' Show'; },
    function (t) { return t + ' Talks'; },
    function (t) { return t + ' Unplugged'; },
    function (t) { return 'Deep Dive: ' + t; },
    function (t) { return 'The ' + t + ' Podcast'; },
    function (t) { return t + ' & Beyond'; },
    function (t) { return 'All About ' + t; },
    function (t) { return t + ' Weekly'; },
    function (t) { return 'The ' + t + ' Files'; },
    function (t) { return 'Inside ' + t; },
    function (t) { return t + ' Decoded'; },
    function (t) { return 'Real Talk: ' + t; },
    function (t) { return 'The ' + t + ' Hour'; },
    function (t) { return t + ' Stories'; },
    function (t) { return 'Beyond ' + t; },
    function (t) { return pick(ADJ) + ' ' + t; },
    function (t) { return 'The ' + pick(ADJ) + ' ' + t + ' Podcast'; },
    function (t) { return 'Zero to ' + t; },
    function (t) { return t + ' Masterminds'; },
    function (t) { return 'Talking ' + t; }
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

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
      if (!raw) { TN.setErr(SLUG + '-error', 'Please enter your podcast topic.'); return; }
      var t = raw.split(' ').map(cap).join(' ');
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 200) {
        guard++;
        var n = pick(FORMATS)(t);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
