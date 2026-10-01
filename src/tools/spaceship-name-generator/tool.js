/* Spaceship Name Generator — ship names by class with registry numbers. */
(function () {
  'use strict';
  var SLUG = 'spaceship-name-generator';

  var CLASSES = {
    frigate: ['Swiftwind', 'Dart', 'Kestrel', 'Arrowhead', 'Skirmisher', 'Peregrine', 'Jackrabbit', 'Comet Chaser', 'Starling', 'Hornet', 'Firefly', 'Sparrowhawk', 'Zephyr', 'Whippet', 'Corsair', 'Interceptor', 'Longbow', 'Rapier', 'Cutlass', 'Saber'],
    cruiser: ['Valiant', 'Resolute', 'Endeavor', 'Horizon', 'Meridian', 'Vanguard', 'Sentinel', 'Odyssey', 'Constellation', 'Dauntless', 'Intrepid', 'Sovereign', 'Triumph', 'Vigilant', 'Aegis', 'Halcyon', 'Pioneer', 'Wayfarer', 'Nomad', 'Emissary'],
    dreadnought: ['Oblivion', 'Doombringer', 'Ironclad', 'Worldender', 'Leviathan', 'Dread Sovereign', 'Annihilator', 'Starcrusher', 'Judgment', 'Obliterator', 'Behemoth', 'Warhammer', 'Extinction', 'Ragnarok', 'Apocalypse', 'Deathknell', 'Maelstrom', 'Tyrant', 'Overlord', 'Nightfall'],
    shuttle: ['Puddle Jumper', 'Firefly', 'Dragonfly', 'Moth', 'Bumblebee', 'Wisp', 'Gnat', 'Skimmer', 'Dart', 'Minnie', 'Tadpole', 'Sparrow', 'Hummingbird', 'Midge', 'Flea', 'Cricket', 'Doodlebug', 'Skipper', 'Tug', 'Ferry'],
    carrier: ['Colossus', 'Mother of Stars', 'Ark Royal', 'Nest of Eagles', 'Grand Harbor', 'Skyforge', 'Fleetheart', 'Bastion', 'Citadel', 'Stronghold', 'Haven', 'Sanctuary', 'Cradle', 'Hive Prime', 'Dockmaster', 'Waystation', 'Port of Call', 'Anchorage', 'Depot', 'Mothership']
  };
  var PREFIX = ['ISS', 'SSV', 'CSV', 'HSV', 'UNV', 'RSS'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cssText = 'cursor:pointer;flex:1';
      var b = document.createElement('div');
      b.style.fontWeight = '600';
      b.textContent = t.name;
      var s = document.createElement('div');
      s.className = 'muted';
      s.style.fontSize = '.78rem';
      s.textContent = t.cls + ' · ' + t.reg;
      res.appendChild(b);
      res.appendChild(s);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      var full = t.name + ' (' + t.reg + ')';
      function doCopy() {
        TN.copy(full).then(function (ok) {
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
        var cls = TN.el(SLUG + '-class').value;
        var bank = CLASSES[cls] || CLASSES.frigate;
        var clsName = cls.charAt(0).toUpperCase() + cls.slice(1);
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 200) {
          guard++;
          var name = pick(bank);
          var reg = pick(PREFIX) + '-' + (100 + Math.floor(Math.random() * 900));
          var key = name;
          if (!seen[key]) {
            seen[key] = true;
            out.push({ name: name, reg: reg, cls: clsName });
          }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
