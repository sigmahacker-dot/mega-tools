/* Author Pen Name Generator — pen names matched to genre vibe. */
(function () {
  'use strict';
  var SLUG = 'author-pen-name-generator';

  var G = {
    literary: {
      f: ['Eleanor', 'Margaret', 'Julian', 'Harold', 'Beatrice', 'Theodore', 'Adelaide', 'Edmund', 'Vivian', 'Arthur', 'Clara', 'Nathaniel', 'Florence', 'Percival', 'Iris', 'Silas', 'Mabel', 'Ambrose', 'Dorothea', 'Reginald'],
      l: ['Whitmore', 'Ashworth', 'Blackwood', 'Calloway', 'Delacroix', 'Ellery', 'Fairbanks', 'Grimshaw', 'Holloway', 'Kingsley', 'Lockhart', 'Marlowe', 'Nightingale', 'Osborne', 'Pembroke', 'Quill', 'Ravensworth', 'Sinclair', 'Thackeray', 'Wexford']
    },
    thriller: {
      f: ['Jack', 'Sarah', 'Michael', 'Kate', 'David', 'Rachel', 'Tom', 'Elena', 'Marcus', 'Nina', 'Cole', 'Vera', 'Reed', 'Maya', 'Blake', 'Ivy', 'Grant', 'Paige', 'Hunter', 'Skye'],
      l: ['Cross', 'Steele', 'Hunter', 'Black', 'Stone', 'Graves', 'Wolfe', 'Dagger', 'Storm', 'Frost', 'Hale', 'Vance', 'Rook', 'Slade', 'Mercer', 'Quinn', 'Drake', 'Pierce', 'Locke', 'Reeves']
    },
    romance: {
      f: ['Sophie', 'Charlotte', 'Olivia', 'Isabella', 'Amelia', 'Lily', 'Ruby', 'Ella', 'Grace', 'Hannah', 'Chloe', 'Ava', 'Mia', 'Lucy', 'Emma', 'Nora', 'Stella', 'Violet', 'Willa', 'Zoe'],
      l: ['Bennett', 'Hart', 'Sinclair', 'Montgomery', 'Ellison', 'Beaumont', 'Delaney', 'Sterling', 'Ashford', 'Callahan', 'Donovan', 'Everly', 'Fairchild', 'Grayson', 'Hollis', 'Jameson', 'Kingsley', 'Lawson', 'Monroe', 'Prescott']
    },
    fantasy: {
      f: ['Aeliana', 'Rowan', 'Seraphina', 'Kael', 'Lyra', 'Thorne', 'Elowen', 'Dorian', 'Isolde', 'Fenwick', 'Mira', 'Corvus', 'Nyx', 'Alder', 'Sylva', 'Rurik', 'Talia', 'Bran', 'Eira', 'Wren'],
      l: ['Stormborn', 'Nightwhisper', 'Oakenshield', 'Moonweaver', 'Dragonsbane', 'Frostfall', 'Shadowmere', 'Thornwood', 'Emberheart', 'Ravensong', 'Ironwood', 'Starfall', 'Wolfbane', 'Mistral', 'Grimwood', 'Brightblade', 'Darkholme', 'Silverleaf', 'Stonebridge', 'Windrider']
    },
    scifi: {
      f: ['Nova', 'Orion', 'Vega', 'Cassius', 'Lyra', 'Dax', 'Seren', 'Kaida', 'Rho', 'Talos', 'Ilya', 'Nyx', 'Zara', 'Corvin', 'Elara', 'Juno', 'Kestrel', 'Lumen', 'Mira', 'Ozone'],
      l: ['Vance', 'Stark', 'Reyes', 'Kowalski', 'Tanaka', 'Novak', 'Sterling', 'Vega', 'Quill', 'Rook', 'Sable', 'Thorne', 'Voss', 'Wren', 'Xander', 'Yates', 'Zero', 'Ash', 'Blaze', 'Cinder']
    },
    kids: {
      f: ['Poppy', 'Milo', 'Lulu', 'Teddy', 'Rosie', 'Finn', 'Daisy', 'Ollie', 'Ruby', 'Sammy', 'Tilly', 'Wally', 'Ziggy', 'Penny', 'Gus', 'Hattie', 'Jasper', 'Nellie', 'Pippa', 'Rufus'],
      l: ['Puddleduck', 'Buttercup', 'Gigglewick', 'Sunnybrook', 'Dandelion', 'Marshmallow', 'Pepperpot', 'Tickle', 'Wobblebottom', 'Bumblebee', 'Cupcake', 'Doodlebug', 'Firefly', 'Gigglesnort', 'Honeypot', 'Jellybean', 'Lollipop', 'Moonbeam', 'Pickle', 'Snickerdoodle']
    }
  };

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
        var g = G[TN.el(SLUG + '-genre').value] || G.literary;
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 200) {
          guard++;
          var n = pick(g.f) + ' ' + pick(g.l);
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
