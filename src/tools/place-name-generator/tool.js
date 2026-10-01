/* Place Name Generator — town, kingdom, tavern modes. */
(function () {
  'use strict';
  var SLUG = 'place-name-generator';

  var TOWN_PRE = ['Ash','Brook','Dun','Ember','Fox','Glen','Hazel','Iron','Mill','Oak','Raven','Stone','Thorn','Willow','Alder','Birch','Cinder','Dusk','Fern','Moss'];
  var TOWN_SUF = ['borough','dale','ford','ham','haven','mere','shire','stead','ton','vale','wick','bury','bridge','field','gate','hollow'];
  var K_PRE = ['Ald','Bel','Corv','Dra','Eld','Fal','Gal','Kael','Lor','Myr','Nor','Ost','Rav','Sel','Thal','Val'];
  var K_SUF = ['oria','andia','aria','esia','ovia','unia','erra','ilia','onia','athia','mira','doria'];
  var K_ADJ = ['Emerald','Crimson','Golden','Shattered','Whispering','Eternal','Fallen','Radiant','Silent','Stormy','Ivory','Obsidian'];
  var K_NOUN = ['Reach','Dominion','Realm','Empire','Kingdom','Marches','Expanse','Throne','Crown','Vale','Coast','Isles'];
  var T_ADJ = ['Tipsy','Golden','Rusty','Howling','Laughing','Sleeping','Dancing','Silver','Copper','Iron','Blind','One-Eyed','Merry','Drunken','Gilded','Crooked','Velvet','Wandering','Green','Smiling'];
  var T_NOUN = ['Griffin','Tankard','Boar','Dragon','Unicorn','Lantern','Harp','Stag','Fox','Badger','Goblet','Flagon','Mermaid','Kraken','Bear','Raven','Sword','Shield','Anchor','Bell'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function genOne(mode) {
    if (mode === 'town') return cap(pick(TOWN_PRE)) + pick(TOWN_SUF);
    if (mode === 'kingdom') {
      if (Math.random() < 0.6) return cap(pick(K_PRE)) + pick(K_SUF);
      return 'The ' + pick(K_ADJ) + ' ' + pick(K_NOUN);
    }
    return 'The ' + pick(T_ADJ) + ' ' + pick(T_NOUN);
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
      var mode = TN.el(SLUG + '-mode').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genOne(mode);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
