/* Weapon Name Generator — fantasy weapon names with legendary epithets. */
(function () {
  'use strict';
  var SLUG = 'weapon-name-generator';

  var NAMES = {
    sword: ['Dawnbreaker', 'Oathkeeper', 'Nightfall', 'Kingsbane', 'Stormblade', 'Frostmourne', 'Emberbrand', 'Soulreaver', 'Thornblade', 'Lightbringer', 'Doomcaller', 'Ravensong', 'Iron Vow', 'Silent Edge', 'Wyrmfang', 'Starfall Blade', 'Bloodletter', 'Mooncleaver'],
    axe: ['Skullsplitter', 'Oathbreaker', 'Thundermaul', 'Rage of the North', 'Bonechewer', 'Stormcaller', 'Ironjaw', 'The Widowmaker', 'Frostbite', 'Emberaxe', 'Doombringer', 'Headhunter', 'Mountainfall', 'Bloodwrath', 'Oakensplitter', 'The Executioner'],
    bow: ['Whisperwind', 'Eagle Eye', 'Thornstring', 'Moonshot', 'Silent Rain', 'The Long Goodbye', 'Starfall', 'Windchaser', 'Nightdraw', 'Heartseeker', 'Oakheart', 'The Patient One', 'Swift Justice', 'Farseer', 'String of Storms', 'Dawn Archer'],
    dagger: ['Widow\u2019s Kiss', 'Shadowbite', 'The Quiet One', 'Ratsbane', 'Needle', 'Backstabber', 'Venomtip', 'Moonshard', 'The Whisper', 'Guttersnipe', 'Fang of Night', 'Pale Sting', 'The Last Word', 'Cobweb', 'Thornprick', 'Silent Oath'],
    hammer: ['Worldbreaker', 'Thunderfall', 'Oathkeeper\u2019s End', 'Mountainheart', 'The Judge', 'Skullcrusher', 'Dawnmaul', 'Iron Testament', 'Stormforged', 'The Argument Ender', 'Bonegrinder', 'Kingsfall', 'Earthshaker', 'The Anvil', 'Righteous Fury', 'Doomhammer'],
    staff: ['The World Tree\u2019s Branch', 'Stormcaller', 'Archmage\u2019s Pride', 'Root of Ages', 'The Comet\u2019s Tail', 'Whisperwood', 'Starlight Rod', 'The Wanderer\u2019s Friend', 'Emberheart Staff', 'Tidecaller', 'The Frozen Word', 'Oakensong', 'Moonwell Staff', 'The Blind Seer', 'Rune of Dawn', 'Serpent Coil'],
    spear: ['Dawnpiercer', 'The Long Reach', 'Stormlance', 'Oath of the Hunt', 'Skyfall Spear', 'Thorn of the Vale', 'The King\u2019s Reach', 'Moonstrike', 'Serpent Fang', 'Iron Tide', 'The Unbroken Line', 'Windrider', 'Blood of the Boar', 'Starlance', 'The First Hunt', 'Grave Marker']
  };
  var EPITHETS = ['of the Fallen King', 'of the Nine Winds', 'of Eternal Night', 'of the First Flame', 'of Whispered Oaths', 'of the Broken Crown', 'of the Deep Dark', 'of the Last Dawn', 'of a Thousand Battles', 'of the Silent Gods', 'of the Howling Peaks', 'of the Drowned Empire', 'of the Ashen Wastes', 'of the Moonlit Hunt', 'the Oathkeeper', 'the Kingslayer', 'the Dawnbringer', 'the Night\u2019s Edge', 'the Storm\u2019s Wrath', 'the Unforgiven'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

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
        var type = TN.el(SLUG + '-type').value;
        var bank = NAMES[type] || NAMES.sword;
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 200) {
          guard++;
          var n = pick(bank) + ', ' + pick(EPITHETS);
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'The forge went cold. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
