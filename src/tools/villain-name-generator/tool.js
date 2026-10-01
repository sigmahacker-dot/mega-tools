/* Villain Name Generator — dark titles, ominous names, dread epithets. */
(function () {
  'use strict';
  var SLUG = 'villain-name-generator';

  var TITLES = ['Lord','Lady','Baron','Baroness','Count','Countess','Archon','Dread','Grand','High','Warlord','Overlord','Master','Mistress','Dark','Supreme'];
  var FIRST = ['Malachar','Vorgath','Zethrix','Kainda','Morvain','Xalvador','Nyxara','Drakmor','Seraphex','Ulvric','Vexalia','Korvax','Maelis','Mordeth','Ravok','Sylvar','Xeraphine','Belladonna','Carmilla','Lucretia','Nocturne','Obsidia','Vespera','Zillah'];
  var EPITHETS = ['the Soulrender',"the Night's Bane",'the Pale King','the Ashen Queen','the Doomcaller','the Bloodletter',"the Shadow's Heir",'the Ruin of Kings','the Voiceless One','the Thrice-Cursed','the Hollow Crown','the Eater of Light','the Whisperer','the Iron Mask','the Plaguefather','the Dreadmother','the Bone Collector','the Last Betrayer','the Storm of Knives','the Silent End','the Gravewhisper','the Crimson Pact','the Faceless','the Eternal Hunger'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function genOne() {
    var r = Math.random();
    if (r < 0.45) return pick(TITLES) + ' ' + pick(FIRST) + ' ' + pick(EPITHETS);
    if (r < 0.75) return pick(TITLES) + ' ' + pick(FIRST);
    return pick(FIRST) + ' ' + pick(EPITHETS);
  }

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
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genOne();
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
