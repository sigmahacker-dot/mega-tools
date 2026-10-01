/* Planet Name Generator — Greek-inspired mythic names + star-catalog designations. */
(function () {
  'use strict';
  var SLUG = 'planet-name-generator';

  var PRE = ['Zeph', 'Astr', 'Nyx', 'Hel', 'Ther', 'Kry', 'Xan', 'Vor', 'Lyr', 'Mor', 'Pel', 'Thal', 'Eos', 'Sel', 'Andr', 'Cass', 'Or', 'Pyr', 'Gal', 'Hydr', 'Oph', 'Cyg', 'Drac', 'Phoen', 'Cor', 'Aqu', 'Capr', 'Sag', 'Taur', 'Gemini'];
  var MID = ['yr', 'os', 'ia', 'on', 'ara', 'eos', 'ion', 'ora', 'is', 'us'];
  var SUF = ['ria', ' Prime', ' Minor', ' Major', ' II', ' III', ' IV', ''];
  var STARS = ['Kepler', 'TRAPPIST', 'Gliese', 'Proxima', 'HD', 'K2', 'TOI', 'Wolf', 'LHS', 'Ross', 'Tau Ceti', 'Epsilon Eridani'];
  var LETTERS = ['b', 'c', 'd', 'e', 'f', 'g'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function mythic() {
    var name = cap(pick(PRE).trim() + pick(MID)) + pick(SUF);
    return name.replace(/\s+/g, ' ').trim();
  }
  function catalog() {
    var star = pick(STARS);
    var num = 1 + Math.floor(Math.random() * 9999);
    return star + '-' + num + pick(LETTERS);
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
        var style = TN.el(SLUG + '-style').value;
        var seen = {}, out = [], guard = 0;
        while (out.length < 10 && guard < 300) {
          guard++;
          var s = style === 'mixed' ? pick(['mythic', 'catalog']) : style;
          var n = s === 'catalog' ? catalog() : mythic();
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
