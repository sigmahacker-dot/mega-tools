/* DJ Name Generator — DJ name combos in five styles. */
(function () {
  'use strict';
  var SLUG = 'dj-name-generator';

  var S = {
    classic: ['Blaze', 'Spin', 'Echo', 'Vibe', 'Rhythm', 'Scratch', 'Groove', 'Tempo', 'Mix', 'Fader', 'Vinyl', 'Decks', 'Beat', 'Flow', 'Pulse', 'Wave', 'Bass', 'Treble', 'Loop', 'Sample', 'Remix', 'Mashup', 'Drop', 'Anthem', 'Fever', 'Rush', 'Surge', 'Ignite', 'Spark', 'Voltage'],
    neon: ['Neon', 'Laser', 'Glow', 'Prism', 'Ultraviolet', 'Strobe', 'Fluoro', 'Hologram', 'Lumen', 'Radiant', 'Phosphor', 'Iridescent', 'Glitch', 'Pixel', 'Synth', 'Chrome', 'Electric', 'Vivid', 'Luminous', 'Afterglow', 'Midnight Glow', 'Starlight', 'Moonbeam', 'Daybreak'],
    thunder: ['Thunder', 'Storm', 'Titan', 'Avalanche', 'Quake', 'Cyclone', 'Tempest', 'Warlord', 'Iron', 'Steel', 'Hammer', 'Anvil', 'Blitz', 'Rampage', 'Fury', 'Wrath', 'Mayhem', 'Havoc', 'Onslaught', 'Juggernaut', 'Behemoth', 'Leviathan', 'Kraken', 'Goliath'],
    cosmic: ['Nova', 'Quasar', 'Nebula', 'Pulsar', 'Comet', 'Meteor', 'Eclipse', 'Solstice', 'Zenith', 'Astral', 'Lunar', 'Solar', 'Orbit', 'Gravity', 'Stardust', 'Moonchild', 'Starforge', 'Voidwalker', 'Galactica', 'Andromeda', 'Cassiopeia', 'Orion', 'Lyra', 'Vega'],
    wildcard: ['Pickle', 'Waffle', 'Noodle', 'Penguin', 'Llama', 'Cactus', 'Disco', 'Banana', 'Taco', 'Unicorn', 'Ninja', 'Pirate', 'Wizard', 'Robot', 'Zombie', 'Vampire', 'Muffin', 'Pancake', 'Sushi', 'Dragon', 'Tiger', 'Shark', 'Octopus', 'Kangaroo']
  };

  var P2 = ['Master', 'Doctor', 'Professor', 'Captain', 'King', 'Queen', 'Lord', 'Sir', 'Madame', 'Chief', 'General', 'Agent'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function makeName(style) {
    var r = Math.random();
    if (style === 'classic') {
      if (r < 0.6) return 'DJ ' + pick(S.classic);
      if (r < 0.8) return 'DJ ' + pick(S.classic) + ' ' + pick(S.classic);
      return pick(P2) + ' ' + pick(S.classic);
    }
    var bank = S[style] || S.classic;
    if (r < 0.7) return 'DJ ' + pick(bank);
    return 'DJ ' + pick(bank) + ' ' + pick(S.classic);
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
        while (out.length < 8 && guard < 200) {
          guard++;
          var n = makeName(style);
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
