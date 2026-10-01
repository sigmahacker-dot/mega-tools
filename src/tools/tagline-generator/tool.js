/* Tagline Generator — keyword-driven taglines from proven slogan templates. */
(function () {
  'use strict';
  var SLUG = 'tagline-generator';

  /* {k1},{k2},{k3} = keywords, {K1} = capitalized first keyword */
  var TPL = {
    classic: [
      '{K1}, done right.', 'The art of {k1}.', '{K1} for life.', 'Experience {k1}.',
      'Where {k1} meets {k2}.', 'The {k1} standard.', 'Simply {k1}.', '{K1}, perfected.',
      'Good {k1}, great days.', 'The home of {k1}.', '{K1} you can trust.', 'Real {k1}, real results.'
    ],
    playful: [
      '{K1} makes everything better.', 'Warning: {k1} may cause smiling.', 'Put some {k1} in your day.',
      'Life\u2019s too short for bad {k1}.', '{K1}? Yes please.', 'Happiness, now with {k1}.',
      '{K1} o\u2019clock, all day long.', 'Powered by {k1} and good vibes.', '{K1}: it\u2019s a lifestyle.',
      'More {k1}, more fun.', 'Keep calm and {k1} on.', 'A little {k1} goes a long way.'
    ],
    bold: [
      '{K1}. No compromises.', 'Own your {k1}.', '{K1} without limits.', 'Built for {k1}. Built for you.',
      'Dare to {k1}.', '{K1} at full throttle.', 'Unleash {k1}.', 'The future is {k1}.',
      '{K1} redefined.', 'Go big on {k1}.', 'Zero excuses. Pure {k1}.', 'Command your {k1}.'
    ],
    minimal: [
      '{K1}.', 'Just {k1}.', '{k1} / {k2}.', 'Less noise. More {k1}.', '{K1}, daily.',
      '{k1} + {k2}.', 'Pure {k1}.', 'Hello, {k1}.', '{K1} essentials.', 'The {k1} edit.',
      '{k1}, {k2}, done.', 'All {k1}, all day.'
    ]
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function fill(tpl, kw) {
    var k1 = kw[0], k2 = kw[1] || kw[0], k3 = kw[2] || kw[0];
    return tpl.replace(/\{K1\}/g, cap(k1)).replace(/\{k1\}/g, k1).replace(/\{k2\}/g, k2).replace(/\{k3\}/g, k3);
  }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cssText = 'cursor:pointer;flex:1;font-weight:600';
      res.textContent = t;
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      function doCopy() {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      }
      btn.addEventListener('click', doCopy);
      res.addEventListener('click', doCopy);
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var raw = TN.el(SLUG + '-keywords').value.trim();
        if (!raw) { TN.setErr(SLUG + '-error', 'Type at least one keyword first.'); return; }
        var kw = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 3);
        var tone = TN.el(SLUG + '-tone').value;
        var bank = TPL[tone] || TPL.classic;
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 200) {
          guard++;
          var t = fill(pick(bank), kw);
          if (!seen[t]) { seen[t] = true; out.push(t); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate taglines. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
