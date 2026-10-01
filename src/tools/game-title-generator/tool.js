/* Game Title Generator — genre-based titles from real title patterns + word banks. */
(function () {
  'use strict';
  var SLUG = 'game-title-generator';

  var G = {
    fantasy: {
      a: ['Crimson', 'Forgotten', 'Eternal', 'Shadowed', 'Ancient', 'Burning', 'Hollow', 'Sacred', 'Fallen', 'Mystic', 'Savage', 'Silent'],
      n: ['Realms', 'Kingdoms', 'Dragons', 'Swords', 'Crowns', 'Prophecy', 'Legends', 'Thrones', 'Runes', 'Spells', 'Quests', 'Empires'],
      p: ['of the Fallen King', 'of Emberfall', 'of the Nine Moons', 'of Dragonfire', 'of the Shattered Crown', 'of Whispering Woods', 'of the Last Mage', 'of Iron and Oak']
    },
    scifi: {
      a: ['Stellar', 'Quantum', 'Neon', 'Void', 'Chrome', 'Orbital', 'Synthetic', 'Deep-Space', 'Hyper', 'Zero-Gravity', 'Cryo', 'Mecha'],
      n: ['Frontier', 'Protocol', 'Horizon', 'Vanguard', 'Drift', 'Uprising', 'Signal', 'Expanse', 'Outpost', 'Requiem', 'Vector', 'Paradox'],
      p: ['Beyond the Stars', 'of the Andromeda Rift', 'on Kepler Station', 'of the Machine War', 'in Dead Orbit', 'of the Last Colony', 'Protocol Zero', 'at Light Speed']
    },
    horror: {
      a: ['Silent', 'Hollow', 'Crimson', 'Whispering', 'Forsaken', 'Rotting', 'Sleepless', 'Bloodied', 'Haunted', 'Twisted', 'Buried', 'Dread'],
      n: ['Manor', 'Asylum', 'Whispers', 'Shadows', 'Crypt', 'Nightmare', 'Hollow', 'Séance', 'Fog', 'Graveyard', 'Cellar', 'Mirrors'],
      p: ['at Blackwood House', 'of the Forgotten', 'in the Dark', 'Beneath the Floorboards', 'of Hollow Creek', 'After Midnight', 'in Room 13', 'of the Pale Ones']
    },
    racing: {
      a: ['Turbo', 'Nitro', 'Midnight', 'Apex', 'Velocity', 'Overdrive', 'Redline', 'Drift', 'Hyper', 'Street', 'Neon', 'Full-Throttle'],
      n: ['Racers', 'Grand Prix', 'Showdown', 'Circuit', 'Rush', 'Legends', 'Heat', 'Unleashed', 'Masters', 'Fury', 'Kings', 'Thunder'],
      p: ['Underground', 'World Tour', 'at Dawn', 'Championship', 'Reloaded', 'Xtreme', '2027', 'Ultimate']
    },
    rpg: {
      a: ['Wandering', 'Lost', 'Boundless', 'Hidden', 'Final', 'Brave', 'Lonely', 'Endless', 'Secret', 'Wild', 'Noble', 'Wayward'],
      n: ['Traveler', 'Chronicles', 'Odyssey', 'Tales', 'Journey', 'Saga', 'Wanderer', 'Legacy', 'Pilgrim', 'Voyager', 'Nomad', 'Seeker'],
      p: ['of the Open Road', 'Across the Divide', 'of Seven Lands', 'Beyond the Map', 'of the Starfall', 'in the Borderlands', 'of Echoes', 'Reborn']
    },
    puzzle: {
      a: ['Twisted', 'Infinite', 'Lucid', 'Fractal', 'Hidden', 'Shifting', 'Glass', 'Clockwork', 'Neon', 'Silent', 'Curious', 'Broken'],
      n: ['Minds', 'Puzzles', 'Labyrinth', 'Rooms', 'Mirrors', 'Gears', 'Patterns', 'Riddles', 'Boxes', 'Echoes', 'Towers', 'Keys'],
      p: ['of Logic', 'Reimagined', 'Deluxe', 'Unboxed', 'in 3D', 'Mastermind', 'Challenge', 'Academy']
    },
    sports: {
      a: ['Ultimate', 'Pro', 'Street', 'Championship', 'All-Star', 'Extreme', 'Legends', 'Turbo', 'World', 'Golden', 'Iron', 'Prime'],
      n: ['Strikers', 'Sluggers', 'Hoops', 'Showdown', 'Faceoff', 'Derby', 'Clash', 'Blitz', 'Smash', 'Rumble', 'Victory', 'Glory'],
      p: ['2027', 'Championship', 'Tour', 'League', 'Mania', 'Unleashed', 'All-Stars', 'World Cup']
    },
    mystery: {
      a: ['Silent', 'Vanishing', 'Hidden', 'Last', 'Forgotten', 'Crimson', 'Midnight', 'Broken', 'Secret', 'Final', 'Hollow', 'Strange'],
      n: ['Detective', 'Case Files', 'Alibi', 'Witness', 'Footprints', 'Confession', 'Enigma', 'Cipher', 'Suspects', 'Motive', 'Clues', 'Shadows'],
      p: ['of Blackwood Lane', 'at the Grand Hotel', 'in the Fog', 'of the Missing Heir', 'on the Night Train', 'Behind Closed Doors', 'Reopened', 'Unsolved']
    }
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function titleFor(g) {
    var b = G[g] || G.fantasy;
    var style = Math.floor(Math.random() * 4);
    if (style === 0) return pick(b.a) + ' ' + pick(b.n);
    if (style === 1) return pick(b.n) + ' ' + pick(b.p);
    if (style === 2) return 'The ' + pick(b.a) + ' ' + pick(b.n);
    return pick(b.a) + ' ' + pick(b.n) + ' ' + pick(b.p);
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
        var g = TN.el(SLUG + '-genre').value;
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 200) {
          guard++;
          var t = titleFor(g);
          if (!seen[t]) { seen[t] = true; out.push(t); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate titles. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
