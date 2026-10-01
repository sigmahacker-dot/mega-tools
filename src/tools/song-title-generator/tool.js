/* Song Title Generator — mood-based song titles from lyric-style patterns. */
(function () {
  'use strict';
  var SLUG = 'song-title-generator';

  var M = {
    happy: [
      'Sunshine in My Pocket', 'Dancing Through the Day', 'Good Vibes Only', 'Golden Hour Smiles',
      'Laughter on Repeat', 'Barefoot and Free', 'Confetti Skies', 'Happy Accident',
      'Sing It Louder', 'Summer in My Soul', 'Chasing Rainbows', 'Everything Is Awesome Today',
      'Neon Smiles', 'Jump for Joy', 'Sweet Serotonin', 'All Smiles Ahead'
    ],
    sad: [
      'Tears on the Window', 'Empty Chair', 'Goodbye in the Rain', 'Fading Photographs',
      'Midnight and Memories', 'The Last Voicemail', 'Broken Lullaby', 'Grey Skies, Grey Heart',
      'What We Lost', 'Alone in November', 'Paper Hearts', 'Slow Goodbye',
      'Echoes of Us', 'Crying in the Backseat', 'Unfinished Letter', 'Winter Without You'
    ],
    angry: [
      'Burn It Down', 'No More Lies', 'Screaming Silence', 'Fists Up',
      'Riot in My Head', 'Break the Chains', 'Venom Tongue', 'Zero Apology',
      'Louder Than Thunder', 'Fuel to the Fire', 'Tear It Apart', 'War Cry',
      'Blood and Static', 'Unleashed', 'Payback Anthem', 'Glass Shatters'
    ],
    romantic: [
      'Your Hand in Mine', 'Slow Dance Forever', 'Written in the Stars', 'Heartbeat Harmony',
      'Love at First Light', 'Two Souls, One Song', 'Kiss Me at Midnight', 'Forever Kind of Love',
      'Stolen Glances', 'You Are My Home', 'Moonlit Promises', 'Every Love Song Is About You',
      'Hold Me Closer', 'The Way You Laugh', 'Endless Summer Love', 'Marry Me at Dawn'
    ],
    chill: [
      'Drifting', 'Coffee and Clouds', 'Slow Sunday', 'Weightless',
      'Palm Trees Sway', 'Mellow Waves', 'Barefoot Mornings', 'Soft Static',
      'Daydream FM', 'Lazy River', 'Golden Haze', 'Unwind',
      'Quiet Corners', 'Low Tide', 'Half Asleep', 'Velvet Air'
    ],
    party: [
      'Turn It Up', 'Dance Floor Diaries', 'Neon Nights', 'Bass Drop Baby',
      'All Night Long', 'Confetti Cannon', 'Hands in the Air', 'Club Infinity',
      'Shot O\u2019Clock', 'Glow Stick Anthem', 'Nonstop', 'Weekend Warriors',
      'Party Like Legends', 'Electric Feels', 'Midnight Madness', 'Dance Till Dawn'
    ],
    nostalgic: [
      'Summer of \u201909', 'Polaroid Memories', 'Backseat Summer', 'Old Cassette',
      'Hometown Lights', 'Mixtape Days', 'Chalk Dust Dreams', 'Porch Light Evenings',
      'VHS Summer', 'First Car Freedom', 'Paper Route Days', 'Drive-In Nights',
      'Analog Hearts', 'Childhood Street', 'Retrograde', 'When We Were Young'
    ],
    motivational: [
      'Rise and Grind', 'Unstoppable', 'Chase the Dream', 'Stronger Every Day',
      'No Excuses', 'Built to Win', 'Keep Climbing', 'Fearless Heart',
      'One More Rep', 'Defy Gravity', 'Born to Rise', 'Limitless',
      'Fire Inside', 'Never Settle', 'Own the Day', 'Champion Mindset'
    ]
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
        var mood = TN.el(SLUG + '-mood').value;
        var bank = M[mood] || M.happy;
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 100) {
          guard++;
          var t = pick(bank);
          if (!seen[t]) { seen[t] = true; out.push(t); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate titles. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
