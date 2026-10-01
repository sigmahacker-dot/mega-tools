/* Book Title Generator — genre-based book titles from real title patterns. */
(function () {
  'use strict';
  var SLUG = 'book-title-generator';

  var G = {
    romance: {
      a: ['Second-Chance', 'Secret', 'Summer', 'Midnight', 'Wild', 'Sweet', 'Falling', 'Borrowed', 'Reckless', 'Tender', 'Starlit', 'Unwritten'],
      n: ['Hearts', 'Promises', 'Letters', 'Vows', 'Sunsets', 'Beginnings', 'Whispers', 'Dances', 'Memories', 'Chances', 'Dreams', 'Kisses'],
      p: ['in Paris', 'at the Lake House', 'Under the Stars', 'on Main Street', 'in Autumn', 'After the Storm', 'in Small-Town Texas', 'Between Us']
    },
    thriller: {
      a: ['Silent', 'Last', 'Broken', 'Hidden', 'Vanishing', 'Perfect', 'Dark', 'Final', 'Cold', 'Twisted', 'Buried', 'Deadly'],
      n: ['Witness', 'Secret', 'Alibi', 'Passenger', 'Confession', 'Game', 'Lie', 'Stranger', 'Night', 'Shadow', 'Trap', 'Truth'],
      p: ['on the Night Train', 'Behind Closed Doors', 'in Room 214', 'Across the Border', 'at 3 A.M.', 'in the Suburbs', 'Under Pressure', 'Without a Trace']
    },
    fantasy: {
      a: ['Crimson', 'Forgotten', 'Eternal', 'Shadowed', 'Ancient', 'Hollow', 'Sacred', 'Fallen', 'Mystic', 'Iron', 'Stormborn', 'Moonlit'],
      n: ['Throne', 'Crown', 'Dragon', 'Prophecy', 'Kingdom', 'Mage', 'Sword', 'Realm', 'Oath', 'Ember', 'Wolf', 'Tower'],
      p: ['of the Nine Realms', 'of Ember and Ash', 'of the Last Dragon', 'of Whispering Pines', 'of the Shattered Oath', 'of Moon and Magic', 'of the Iron Crown', 'Reborn']
    },
    scifi: {
      a: ['Stellar', 'Quantum', 'Neon', 'Void', 'Chrome', 'Orbital', 'Synthetic', 'Cryo', 'Deep-Space', 'Electric', 'Silent', 'Final'],
      n: ['Frontier', 'Signal', 'Horizon', 'Colony', 'Uprising', 'Drift', 'Paradox', 'Machine', 'Starship', 'Requiem', 'Contact', 'Awakening'],
      p: ['Beyond Andromeda', 'on Europa Station', 'of the Machine Age', 'at Light Speed', 'in Dead Orbit', 'of the Last Humans', 'Protocol', 'Rising']
    },
    mystery: {
      a: ['Silent', 'Vanishing', 'Hidden', 'Last', 'Forgotten', 'Midnight', 'Broken', 'Secret', 'Final', 'Hollow', 'Strange', 'Pale'],
      n: ['Detective', 'Case', 'Alibi', 'Witness', 'Footprints', 'Enigma', 'Suspects', 'Motive', 'Clues', 'Inheritance', 'Disappearance', 'Confession'],
      p: ['at Blackwood Manor', 'on the Night Train', 'in the Fog', 'of the Missing Heir', 'Behind the Library Door', 'at the Grand Hotel', 'Unsolved', 'Reopened']
    },
    horror: {
      a: ['Silent', 'Hollow', 'Crimson', 'Whispering', 'Forsaken', 'Rotting', 'Sleepless', 'Bloodied', 'Haunted', 'Twisted', 'Buried', 'Pale'],
      n: ['House', 'Whispers', 'Crypt', 'Nightmare', 'Fog', 'Graveyard', 'Cellar', 'Mirrors', 'Hollow', 'Séance', 'Shadows', 'Teeth'],
      p: ['on Blackwood Lane', 'Beneath the Floorboards', 'After Midnight', 'in Room 13', 'of Hollow Creek', 'in the Dark', 'of the Pale Ones', 'Unending']
    },
    nonfiction: {
      a: ['Hidden', 'Surprising', 'Essential', 'Bold', 'Quiet', 'Radical', 'Simple', 'Untold', 'New', 'Secret', 'Brave', 'Everyday'],
      n: ['Habits', 'Science of Success', 'Art of Focus', 'Psychology of Money', 'History of Tomorrow', 'Power of Rest', 'Anatomy of Ideas', 'Economics of Happiness', 'Biology of Belief', 'Geography of Genius', 'Chemistry of Teams', 'Physics of Productivity'],
      p: [': A Field Guide', ': What the Research Says', ': Lessons from the Edge', ': A Practical Manual', ': Stories and Strategies', ': The Complete Guide', ': Rethinking Everything', '']
    },
    kids: {
      a: ['Silly', 'Brave', 'Tiny', 'Magic', 'Giggling', 'Sleepy', 'Bouncy', 'Curious', 'Fluffy', 'Wobbly', 'Sneaky', 'Sparkly'],
      n: ['Dragon', 'Penguin', 'Monster', 'Puppy', 'Robot', 'Unicorn', 'Pirate', 'Dinosaur', 'Frog', 'Bear', 'Witch', 'Alien'],
      p: ['and the Big Adventure', 'Goes to the Moon', 'and the Lost Sock', 'Saves the Day', 'and the Cookie Mystery', 'at the Zoo', 'Learns to Share', 'and Friends']
    }
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function titleFor(g) {
    var b = G[g] || G.romance;
    var style = Math.floor(Math.random() * 4);
    if (g === 'nonfiction') {
      if (style < 2) return 'The ' + pick(b.a) + ' ' + pick(b.n) + pick(b.p);
      return pick(b.a) + ' ' + pick(b.n) + pick(b.p);
    }
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
