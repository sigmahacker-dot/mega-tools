/* App Name Generator — brandable names via syllable blending, compounds, suffix fusion. */
(function () {
  'use strict';
  var SLUG = 'app-name-generator';

  var PRE = ['Snap', 'Task', 'Flow', 'Sync', 'Bright', 'Swift', 'Nova', 'Pixel', 'Cloud', 'Dash', 'Echo', 'Flux', 'Glow', 'Hive', 'Jet', 'Kick', 'Loop', 'Mint', 'Nudge', 'Orbit', 'Peak', 'Quest', 'Rally', 'Spark', 'Trek', 'Volt', 'Wave', 'Zap', 'Zen', 'Zoom', 'Blink', 'Chirp', 'Doodle', 'Fable', 'Glimpse', 'Halo', 'Ivy', 'Jolt', 'Kindle', 'Lumen'];
  var MID = ['a', 'e', 'i', 'o', 'u', 'er', 'ar', 'or', 'ly', 'ia', 'io', 'ix', 'ex', 'ax'];
  var SUF = ['ly', 'ify', 'io', 'ora', 'ero', 'ina', 'able', 'wise', 'hub', 'lab', 'base', 'port', 'stack', 'ship', 'scape', 'verse', 'grid', 'line', 'path', 'spot'];
  var WORD2 = ['Forge', 'Nest', 'Pilot', 'Scout', 'Bloom', 'Craft', 'Drift', 'Flare', 'Grove', 'Harbor', 'Kindred', 'Lantern', 'Meadow', 'North', 'Pioneer', 'Quill', 'Relay', 'Sage', 'Tide', 'Union', 'Vista', 'Whistle', 'Yonder', 'Zephyr'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* split a word into rough syllable-ish chunks for blending */
  function chunks(word) {
    var w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w.length <= 4) return [w];
    var cut = 2 + Math.floor(Math.random() * Math.max(1, w.length - 4));
    return [w.slice(0, cut), w.slice(cut)];
  }
  function blend(a, b) {
    var ca = chunks(a), cb = chunks(b);
    return cap(ca[0] + cb[cb.length - 1]);
  }

  function makeName(kw, style) {
    var s = style === 'mixed' ? pick(['blend', 'compound', 'suffix']) : style;
    var k = (kw || '').replace(/[^a-zA-Z]/g, '');
    if (s === 'blend') {
      var a = k || pick(PRE), b = pick(PRE.concat(WORD2));
      return blend(a, b);
    }
    if (s === 'compound') {
      var x = k ? cap(k) : pick(PRE);
      return x + pick(WORD2);
    }
    var r = k ? cap(k) : pick(PRE);
    return r + pick(SUF);
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
        var kw = TN.el(SLUG + '-kw').value.trim();
        var style = TN.el(SLUG + '-style').value;
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 200) {
          guard++;
          var n = makeName(kw, style);
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
