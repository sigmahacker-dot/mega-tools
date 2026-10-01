/* Mission Statement Generator — assemble mission statements from name/values/audience. */
(function () {
  'use strict';
  var SLUG = 'mission-statement-generator';

  function joinValues(v) {
    if (v.length === 1) return v[0];
    if (v.length === 2) return v[0] + ' and ' + v[1];
    return v.slice(0, -1).join(', ') + ', and ' + v[v.length - 1];
  }

  /* each function: (name, aud, vals, valStr) -> string */
  var STYLES = {
    inspiring: [
      function (n, a, v, vs) { return 'At ' + n + ', we believe ' + a + ' deserve better. Through ' + vs + ', we turn everyday challenges into moments of possibility.'; },
      function (n, a, v, vs) { return 'Our mission at ' + n + ' is simple: bring ' + vs + ' to everything we do for ' + a + ', and never settle for ordinary.'; },
      function (n, a, v, vs) { return n + ' exists to inspire ' + a + ' — guided by ' + vs + ', we build what matters and leave the rest behind.'; },
      function (n, a, v, vs) { return 'We started ' + n + ' with one conviction: that ' + vs + ' can change how ' + a + ' experience the world.'; }
    ],
    professional: [
      function (n, a, v, vs) { return n + ' delivers dependable results for ' + a + ' through ' + vs + ' and disciplined execution.'; },
      function (n, a, v, vs) { return 'Our mission is to serve ' + a + ' with excellence, grounded in ' + vs + ' and a commitment to measurable outcomes.'; },
      function (n, a, v, vs) { return 'At ' + n + ', we partner with ' + a + ' to achieve lasting success, guided by ' + vs + '.'; },
      function (n, a, v, vs) { return n + ' is dedicated to setting the standard for ' + a + ' — ' + vs + ' in every engagement, without exception.'; }
    ],
    bold: [
      function (n, a, v, vs) { return n + ' is here to disrupt the status quo for ' + a + '. ' + vs.charAt(0).toUpperCase() + vs.slice(1) + ' — no compromises, no excuses.'; },
      function (n, a, v, vs) { return 'We don\u2019t follow the industry. At ' + n + ', we redefine it for ' + a + ' through ' + vs + '.'; },
      function (n, a, v, vs) { return 'Good enough is the enemy. ' + n + ' exists to give ' + a + ' the best, powered by ' + vs + '.'; },
      function (n, a, v, vs) { return n + ': ' + vs + ', aimed squarely at ' + a + ' who refuse to settle.'; }
    ],
    playful: [
      function (n, a, v, vs) { return 'At ' + n + ', we make life easier (and way more fun) for ' + a + ' — with ' + vs + ' and a smile.'; },
      function (n, a, v, vs) { return 'Our mission? Delight ' + a + ' daily. Our method? ' + vs.charAt(0).toUpperCase() + vs.slice(1) + '. Our mascot? Still TBD.'; },
      function (n, a, v, vs) { return n + ' believes ' + a + ' deserve ' + vs + ' — plus a little joy in every interaction.'; },
      function (n, a, v, vs) { return 'We\u2019re ' + n + ', and we\u2019re on a mission to bring ' + vs + ' to ' + a + ', one happy customer at a time.'; }
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
      res.style.cssText = 'cursor:pointer;flex:1';
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
        var name = TN.el(SLUG + '-name').value.trim();
        var aud = TN.el(SLUG + '-audience').value.trim();
        var vals = TN.el(SLUG + '-values').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 4);
        if (!name) { TN.setErr(SLUG + '-error', 'Type your company or org name first.'); return; }
        if (!aud) { TN.setErr(SLUG + '-error', 'Tell us who you serve.'); return; }
        if (!vals.length) { TN.setErr(SLUG + '-error', 'Add at least one core value.'); return; }
        var vs = joinValues(vals);
        var style = TN.el(SLUG + '-style').value;
        var bank = STYLES[style] || STYLES.inspiring;
        render(bank.map(function (fn) { return fn(name, aud, vals, vs); }));
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not draft statements. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
