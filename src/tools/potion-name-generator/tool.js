/* Potion Name Generator — fantasy potion names, each with a one-line effect. */
(function () {
  'use strict';
  var SLUG = 'potion-name-generator';

  var VESSEL = ['Potion', 'Elixir', 'Draught', 'Tonic', 'Philter', 'Brew', 'Vial', 'Decoction'];
  var ADJ = ['Ember', 'Moonlit', 'Whispering', 'Crimson', 'Frostbound', 'Golden', 'Shadow', 'Starlit', 'Venomous', 'Luminous', 'Ancient', 'Sparkling', 'Smoldering', 'Glacial', 'Prismatic', 'Nocturnal', 'Radiant', 'Misty', 'Burning', 'Silent'];
  var NOUN = ['Sight', 'Shadows', 'the Phoenix', 'Giants', 'Dreams', 'the Deep', 'Storms', 'Echoes', 'the Dawn', 'Thorns', 'Starlight', 'the Raven', 'Flames', 'Tides', 'Whispers', 'the Serpent', 'Frost', 'the Wolf', 'Embers', 'the Moon'];
  var EFFECTS = [
    'Grants night vision for one hour.',
    'Heals minor wounds on contact.',
    'Makes the drinker weightless for ten minutes.',
    'Lets you breathe underwater for a day.',
    'Shrouds you in shadow until dawn.',
    'Doubles your strength for one battle.',
    'Erases the last hour from your memory.',
    'Lets you speak with animals until sunset.',
    'Turns your skin to stone for five minutes.',
    'Reveals hidden doors and secret paths.',
    'Makes you irresistibly charming for an evening.',
    'Slows time around you for sixty seconds.',
    'Cures any poison coursing through your veins.',
    'Lets you leap three times your height.',
    'Projects your voice across a valley.',
    'Makes you invisible while holding your breath.',
    'Warms you in the coldest blizzard.',
    'Shows you the nearest source of fresh water.',
    'Lets you remember anything you have ever read.',
    'Causes flowers to bloom where you walk.',
    'Makes metal weapons pass through you harmlessly — once.',
    'Grants the courage of a lion for a day.',
    'Lets you understand any written language.',
    'Puts anyone who smells it into a deep sleep.'
  ];

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
      s.style.fontSize = '.8rem';
      s.textContent = 'Effect: ' + t.effect;
      res.appendChild(b);
      res.appendChild(s);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      var full = t.name + ' — Effect: ' + t.effect;
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
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 300) {
          guard++;
          var name = pick(VESSEL) + ' of ' + pick(ADJ) + ' ' + pick(NOUN);
          if (!seen[name]) {
            seen[name] = true;
            out.push({ name: name, effect: pick(EFFECTS) });
          }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'The brew failed. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
