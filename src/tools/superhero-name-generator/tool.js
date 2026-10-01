/* Superhero Name Generator — hero/villain adjective+noun combos + powers. */
(function () {
  'use strict';
  var SLUG = 'superhero-name-generator';

  var HERO_ADJ = ['Atomic','Cosmic','Crimson','Cyber','Electric','Frost','Golden','Iron','Lunar','Neon','Quantum','Radiant','Shadow','Solar','Steel','Thunder','Turbo','Ultraviolet','Velocity','Vortex','Wild','Zenith','Blaze','Storm'];
  var HERO_NOUN = ['Falcon','Fox','Guardian','Hawk','Knight','Panther','Phantom','Phoenix','Ranger','Sentinel','Shield','Specter','Striker','Tiger','Titan','Viper','Warden','Wolf','Arrow','Blade','Comet','Dynamo','Eagle','Spark'];
  var HERO_POWER = ['flight','super strength','telekinesis','invisibility','lightning control','rapid healing','time manipulation','shapeshifting','energy blasts','mind reading','teleportation','ice generation','fire manipulation','enhanced speed','force fields','animal communication','technopathy','gravity control','plasma projection','sonic scream'];
  var VIL_ADJ = ['Dark','Dread','Malevolent','Sinister','Venomous','Wicked','Cruel','Grim','Savage','Twisted','Vile','Ruthless','Ominous','Forsaken','Hollow','Iron','Obsidian','Ruin','Nightmare','Crimson'];
  var VIL_NOUN = ['Doom','Havoc','Nightmare','Reaper','Venom','Warlock','Wraith','Tyrant','Marauder','Butcher','Crypt','Fang','Ghoul','Hex','Jackal','Kraken','Lich','Mauler','Nemesis','Overlord'];
  var VIL_POWER = ['shadow manipulation','soul draining','fear projection','necromancy','mind control','venom generation','chaos magic','life-force siphoning','nightmare inducement','blood manipulation','plague spreading','bone manipulation','dark teleportation','rage empowerment','illusion casting','storm summoning','metal bending','poison immunity','void walking','pain amplification'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function genOne(lean) {
    var adj = lean === 'hero' ? pick(HERO_ADJ) : pick(VIL_ADJ);
    var noun = lean === 'hero' ? pick(HERO_NOUN) : pick(VIL_NOUN);
    var power = lean === 'hero' ? pick(HERO_POWER) : pick(VIL_POWER);
    var name = Math.random() < 0.6 ? 'The ' + adj + ' ' + noun : adj + ' ' + noun;
    return name + ' — Power: ' + power;
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
      var lean = TN.el(SLUG + '-lean').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genOne(lean);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
