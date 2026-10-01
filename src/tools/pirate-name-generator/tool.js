/* Pirate Name Generator — pirate names with epithets + ship names. */
(function () {
  'use strict';
  var SLUG = 'pirate-name-generator';

  var FIRST = ['Anne','Bartholomew','Calico','Edward','Grace','Henry','Jack','Mary','Ned','Peg','Sal','Tom','Will','Bess','Davy','Flint','Morgan','Roberts','Teach','Vane','Rackham','Kidd','Hornigold','Bellamy','Avery'];
  var EPITHET = ['Blackhand','One-Eye','Redbeard','Ironhook','Deadeye','Sharktooth','Goldtooth','Stormbeard','Saltbeard','Bonecrusher','Cutthroat','Seadog','Barnacle','Plankwalker','Rumrunner','Cannonball',"Mermaid's-Bane",'the Terrible','the Cruel','the Red','the Dread','the Bold','the Fearless','the Notorious'];
  var SHIP_ADJ = ['Salty','Rusty','Golden','Crimson','Black','Silent','Roaring','Drunken','Howling','Wandering','Sunken','Lucky','Cursed','Jolly','Gallant','Dread'];
  var SHIP_NOUN = ['Serpent','Revenge','Fortune','Kraken','Siren','Albatross','Cutlass','Tempest','Widow','Reaper','Mariner','Doubloon','Leviathan','Corsair','Buccaneer','Galleon','Scallywag','Tidecaller','Stormpetrel','Barnacle'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function genOne(mode) {
    if (mode === 'ship') return 'The ' + pick(SHIP_ADJ) + ' ' + pick(SHIP_NOUN);
    var ep = pick(EPITHET);
    if (/^the /.test(ep)) return pick(FIRST) + ' ' + ep;
    return pick(FIRST) + ' \u201c' + ep + '\u201d';
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
      var mode = TN.el(SLUG + '-mode').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genOne(mode);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
