/* Dragon Name Generator — draconic syllables + title epithets. */
(function () {
  'use strict';
  var SLUG = 'dragon-name-generator';

  var PRE = ['Ash','Blaze','Brim','Cinder','Drak','Ember','Flame','Furn','Ign','Magm','Pyre','Scal','Sear','Smok','Soot','Thar','Vul','Wyr','Char','Coal','Flare','Heat','Scorch','Tar'];
  var MID = ['a','ax','e','ex','i','ix','o','or','u','ur','ae','ai','au','eo','ia','ou'];
  var SUF = ['ax','axyx','gor','moth','nax','rath','saur','thrax','vex','zyx','dor','gar','thos','vax','zax','mor','nor','thur','xar','zoth'];
  var TITLES = ['the Ashwing','the Embermaw','the Stormcaller','the Nightflame','the Goldhoard','the Skyrender','the Frostbane','the Dreadwing','the Cinderheart','the Ironhide','the Shadowflame','the Thunderclaw','the Bonechewer','the Starswallower','the Mistweaver','the Doombringer','the Flamekeeper','the Wyrmking','the Scalebane','the Firetongue','the Deepwyrm','the Craglord','the Ashen Maw','the Worldscorcher'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function genName(withTitle) {
    var n = cap(pick(PRE) + pick(MID) + pick(SUF));
    if (withTitle) n += ' ' + pick(TITLES);
    return n;
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
      var withTitle = TN.el(SLUG + '-title').value === 'yes';
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genName(withTitle);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
