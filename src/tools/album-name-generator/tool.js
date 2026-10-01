/* Album Name Generator — album titles by genre. */
(function () {
  'use strict';
  var SLUG = 'album-name-generator';

  var G = {
    rock: ['Thunder Road Reprise', 'Amplified Hearts', 'Static Bloom', 'Neon Highway', 'Gravel & Glory', 'The Last Encore', 'Feedback Loop', 'Midnight Riff', 'Velvet Static', 'Concrete Roses', 'Halfway to Loud', 'Echoes of Rebellion', 'Gasoline Dreams', 'The Riot Inside', 'Paper Thunder', 'Broken Strings', 'After the Static', 'Wildfire Anthem'],
    pop: ['Sugar Rush', 'Daydream Deluxe', 'Neon Confetti', 'Heart on Repeat', 'Glitterbomb', 'Summer in Stereo', 'Pink Skies', 'Dancefloor Diaries', 'Electric Honey', 'Pop Princess Protocol', 'Bubble & Bass', 'Midnight Sparkle', 'Candy Coated', 'Starlight Serenade', 'Playlist of Us', 'Golden Hour Glow', 'Sweet Static', 'Confetti Hearts'],
    hiphop: ['Concrete Poetry', 'Hustle Season', 'Corner Store Kings', 'Velvet Rope Dreams', 'The Come Up', 'Blockbuster Bars', 'Midnight Cipher', 'Gold Chain Gospel', 'Street Symphony', 'Platinum Mindset', 'The Grind Tape', 'Empire State of Mindset', 'Bassline Boss', 'From the Basement', 'Legacy in Progress', 'Diamond District', 'The Hustler\u2019s Handbook', '808 Dreams'],
    electronic: ['Neon Pulse', 'Digital Mirage', 'Midnight Frequency', 'Synthwave Sunset', 'Chrome Dreams', 'Bass Cathedral', 'Electric Bloom', 'The Grid Sleeps', 'Laser Rain', 'Afterhours Protocol', 'Pixel Paradise', 'Subwoofer Sermon', 'Nightdrive', 'Analog Ghosts', 'Cybernetic Dawn', 'Voltage Valley', 'Dream Machine', 'Strobe Light Stories'],
    jazz: ['Blue Hour Sessions', 'Velvet Improvisation', 'Midnight at the Blue Note', 'Smoke & Saxophone', 'The Late Set', 'Brass & Moonlight', 'Coffeehouse Quartet', 'Silk Syncopation', 'Rainy Day Riffs', 'The Bebop Diaries', 'Golden Horn', 'After Midnight', 'Swing Low', 'Thelonious Dreams', 'Candlelight Cadence', 'Uptown Nocturne', 'Whiskey & Waltz', 'Blue in Green Again'],
    country: ['Dirt Road Diaries', 'Whiskey & Wildflowers', 'Tailgate Sunset', 'Back Porch Ballads', 'Boots & Heartaches', 'Red Dirt Roads', 'Mama\u2019s Kitchen Radio', 'Pickup Truck Poetry', 'Honky Tonk Heart', 'The Long Way Home', 'Sweet Tea Sundays', 'Barbed Wire Roses', 'Gravel Road Gospel', 'Neon Moon Rising', 'Front Porch Light', 'Dusty Boots', 'Small Town Stories', 'Two Lane Highway'],
    metal: ['Throne of Iron', 'Ashes of Empires', 'The Iron Covenant', 'Bloodmoon Rising', 'Forge of the Damned', 'Screams from the Abyss', 'Rusted Halo', 'Warpath Eternal', 'The Final Siege', 'Doombringer', 'Cathedral of Pain', 'Iron & Ire', 'The Howling Void', 'Chains of the Fallen', 'Ragnarok Rising', 'Skullcrusher Symphony', 'The Dark Anvil', 'Eternal Nightfall']
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
        var bank = G[TN.el(SLUG + '-genre').value] || G.rock;
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 200) {
          guard++;
          var t = pick(bank);
          if (!seen[t]) { seen[t] = true; out.push(t); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
