/* Movie Title Generator — genre-based movie titles from cinematic patterns. */
(function () {
  'use strict';
  var SLUG = 'movie-title-generator';

  var G = {
    action: {
      a: ['Iron', 'Maximum', 'Rogue', 'Steel', 'Blazing', 'Final', 'Savage', 'Rapid', 'Crimson', 'Thunder', 'Zero', 'Lethal'],
      n: ['Justice', 'Vengeance', 'Strike', 'Protocol', 'Fury', 'Reckoning', 'Force', 'Siege', 'Rampage', 'Showdown', 'Impact', 'Storm'],
      p: ['Reloaded', 'Unleashed', 'Rising', 'Retribution', 'Protocol', ': Endgame', 'Down', 'Assault']
    },
    comedy: {
      a: ['Awkward', 'Hilarious', 'Disastrous', 'Accidental', 'Clumsy', 'Outrageous', 'Epic', 'Total', 'Serious', 'Grand', 'Wild', 'Mild'],
      n: ['Vacation', 'Wedding', 'Roommates', 'Road Trip', 'Reunion', 'Interview', 'Neighbors', 'In-Laws', 'Babysitter', 'Detective', 'Cook-Off', 'Mix-Up'],
      p: ['Gone Wrong', '2: The Sequel Nobody Asked For', 'in Vegas', 'Unfiltered', ': The Musical?', 'Reloaded', 'Forever', 'Strikes Back']
    },
    drama: {
      a: ['Silent', 'Fading', 'Broken', 'Fragile', 'Distant', 'Heavy', 'Quiet', 'Lost', 'Tender', 'Slow', 'Bitter', 'Golden'],
      n: ['Years', 'Promises', 'Letters', 'Seasons', 'Memories', 'Echoes', 'Winters', 'Goodbyes', 'Confessions', 'Wounds', 'Mornings', 'Shadows'],
      p: ['of a Father', 'in Autumn', 'Between Us', 'at Dusk', 'Unspoken', 'of Ordinary People', 'in a Small Town', 'Revisited']
    },
    horror: {
      a: ['Silent', 'Hollow', 'Crimson', 'Whispering', 'Forsaken', 'Rotting', 'Sleepless', 'Bloodied', 'Haunted', 'Twisted', 'Buried', 'Pale'],
      n: ['House', 'Whispers', 'Crypt', 'Nightmare', 'Fog', 'Graveyard', 'Cellar', 'Mirrors', 'Hollow', 'Séance', 'Shadows', 'Teeth'],
      p: ['on Blackwood Lane', 'Beneath the Floorboards', 'After Midnight', 'in Room 13', 'of Hollow Creek', 'in the Dark', 'of the Pale Ones', ': The Awakening']
    },
    scifi: {
      a: ['Stellar', 'Quantum', 'Neon', 'Void', 'Chrome', 'Orbital', 'Synthetic', 'Cryo', 'Deep-Space', 'Electric', 'Silent', 'Final'],
      n: ['Frontier', 'Signal', 'Horizon', 'Colony', 'Uprising', 'Drift', 'Paradox', 'Machine', 'Starship', 'Requiem', 'Contact', 'Awakening'],
      p: ['Beyond Andromeda', 'on Europa Station', 'of the Machine Age', 'at Light Speed', 'in Dead Orbit', 'of the Last Humans', ': Resurgence', 'Rising']
    },
    romance: {
      a: ['Second-Chance', 'Secret', 'Summer', 'Midnight', 'Wild', 'Sweet', 'Falling', 'Borrowed', 'Reckless', 'Tender', 'Starlit', 'Unwritten'],
      n: ['Hearts', 'Promises', 'Letters', 'Vows', 'Sunsets', 'Beginnings', 'Whispers', 'Dances', 'Memories', 'Chances', 'Dreams', 'Kisses'],
      p: ['in Paris', 'at the Lake House', 'Under the Stars', 'on Main Street', 'in Autumn', 'After the Storm', 'in Rome', 'Between Us']
    },
    thriller: {
      a: ['Silent', 'Last', 'Broken', 'Hidden', 'Vanishing', 'Perfect', 'Dark', 'Final', 'Cold', 'Twisted', 'Buried', 'Deadly'],
      n: ['Witness', 'Secret', 'Alibi', 'Passenger', 'Confession', 'Game', 'Lie', 'Stranger', 'Night', 'Shadow', 'Trap', 'Truth'],
      p: ['on the Night Train', 'Behind Closed Doors', 'in Room 214', 'Across the Border', 'at 3 A.M.', 'in the Suburbs', 'Under Pressure', 'Without a Trace']
    },
    animation: {
      a: ['Brave', 'Tiny', 'Magic', 'Giggling', 'Bouncy', 'Curious', 'Fluffy', 'Sneaky', 'Sparkly', 'Wobbly', 'Silly', 'Sleepy'],
      n: ['Dragon', 'Penguin', 'Monster', 'Puppy', 'Robot', 'Unicorn', 'Pirate', 'Dinosaur', 'Frog', 'Bear', 'Witch', 'Alien'],
      p: ['and the Big Adventure', 'Goes to the Moon', 'and the Lost Sock', 'Saves the Day', 'and the Cookie Mystery', 'at the Zoo', 'Learns to Share', 'and Friends']
    }
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function titleFor(g) {
    var b = G[g] || G.action;
    var style = Math.floor(Math.random() * 4);
    if (style === 0) return 'The ' + pick(b.a) + ' ' + pick(b.n);
    if (style === 1) return pick(b.a) + ' ' + pick(b.n) + ' ' + pick(b.p);
    if (style === 2) return pick(b.n) + ' ' + pick(b.p);
    return 'The ' + pick(b.n) + ' ' + pick(b.p);
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
