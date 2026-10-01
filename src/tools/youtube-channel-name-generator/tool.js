/* YouTube Channel Name Generator — niche keywords + style banks. */
(function () {
  'use strict';
  var SLUG = 'youtube-channel-name-generator';

  var KW = {
    gaming: ['Pixel','Noob','Respawn','Quest','Loot','Boss','Arcade','Frag','Play','Level'],
    tech: ['Gadget','Circuit','Byte','Chip','Tech','Code','Debug','Silicon','Bot','Wire'],
    cooking: ['Sizzle','Simmer','Spice','Whisk','Taste','Bake','Chop','Flavor','Plate','Recipe'],
    fitness: ['Gains','Rep','Flex','Sweat','Pump','Grind','Beast','Cardio','Lift','Shred'],
    travel: ['Wander','Roam','Trek','Atlas','Voyage','Miles','Passport','Trail','Journey','Globe'],
    education: ['Brain','Scholar','Learn','Study','Genius','Curious','Mind','Class','Lesson','Think'],
    comedy: ['Giggle','Chuckle','Meme','Prank','Silly','Goofy','Banter','Jester','Wit','Gag'],
    finance: ['Money','Mint','Coin','Cash','Wealth','Bull','Ledger','Profit','Bucks','Vault']
  };
  var SUF = ['TV','Official','Lab','Hub','Daily','Nation','Central','Zone','Crew','Squad','Show','Diaries'];
  var ADJ = ['Epic','Daily','Ultimate','Crazy','Real','Honest','Next','Big'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function genOne(niche) {
    var kw = pick(KW[niche] || KW.gaming);
    var r = Math.random();
    if (r < 0.55) return kw + ' ' + pick(SUF);
    if (r < 0.85) return pick(ADJ) + ' ' + kw;
    return 'The ' + kw + ' ' + pick(SUF);
  }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var val = document.createElement('div');
      val.textContent = t;
      res.appendChild(val);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          if (!ok) TN.setErr(SLUG + '-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      });
      res.addEventListener('click', function () { btn.click(); });
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      var niche = TN.el(SLUG + '-niche').value;
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 200) {
        guard++;
        var n = genOne(niche);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
