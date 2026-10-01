/* Business Name Generator — industry keyword + prefix/suffix combos. */
(function () {
  'use strict';
  var SLUG = 'business-name-generator';

  var PRE = ['Bright','Clear','Prime','Apex','Nova','Swift','True','Blue','Ever','Hyper','Next','Omni','Pro','Pure','Rapid','Smart','Stellar','Ultra','Vital','Zen','Bold','Fresh','Grand','Peak'];
  var SUF = ['Labs','Works','Co','Studio','Hub','Collective','Partners','Group','Ventures','Solutions','Systems','Digital','Creative','Supply','Market','Forge','Nest','Base','Loop','Spark','Lane','Yard','Theory','Craft'];
  var KW = {
    tech: ['Cloud','Byte','Data','Pixel','Code','Chip','Net','Soft','Cyber','Quantum','Logic','Sync'],
    food: ['Bite','Fork','Crumb','Sizzle','Spice','Taste','Oven','Feast','Flavor','Fresh','Kitchen','Plate'],
    fashion: ['Chic','Style','Thread','Stitch','Loom','Hem','Drape','Atelier','Muse','Runway','Velvet','Denim'],
    fitness: ['Flex','Pump','Core','Burn','Pulse','Stride','Lift','Sprint','Iron','Motion','Peak','Forge'],
    travel: ['Wander','Roam','Trek','Voyage','Atlas','Compass','Horizon','Journey','Nomad','Pathfinder','Odyssey','Miles'],
    finance: ['Ledger','Mint','Vault','Capital','Coin','Equity','Fund','Trust','Wealth','Yield','Ledger','Asset'],
    beauty: ['Glow','Bloom','Radiant','Silk','Petal','Aura','Blush','Dew','Gloss','Lush','Pearl','Velvet'],
    pets: ['Paw','Tail','Whisker','Fetch','Bark','Purr','Snout','Cuddle','Leash','Treat','Burrow','Fluff']
  };
  var TLDS = ['.com','.io','.co','.net','.biz'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function genOne(industry, domainStyle) {
    var kw = pick(KW[industry] || KW.tech);
    var r = Math.random();
    var core = r < 0.5 ? pick(PRE) + kw : kw + pick(SUF);
    var name = core;
    if (domainStyle) name += '\n' + core.toLowerCase().replace(/[^a-z]/g, '') + pick(TLDS);
    return name;
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
      res.style.whiteSpace = 'pre-line';
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
      var industry = TN.el(SLUG + '-industry').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var domainStyle = TN.el(SLUG + '-domain').checked;
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genOne(industry, domainStyle);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
