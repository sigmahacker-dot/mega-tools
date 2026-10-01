(function () {
  'use strict';
  var ERR = 'band-name-generator-error';
  var LISTS = {
    rock: { a: ['Velvet', 'Electric', 'Midnight', 'Crimson', 'Neon', 'Wild', 'Stone', 'Thunder'], n: ['Rebels', 'Riders', 'Hearts', 'Wolves', 'Static', 'Echoes', 'Riot', 'Kings'], the: true },
    metal: { a: ['Iron', 'Blood', 'Shadow', 'Obsidian', 'Crimson', 'Ashen', 'Venom', 'Grim'], n: ['Requiem', 'Throne', 'Hammer', 'Coven', 'Abyss', 'Warpath', 'Furnace', 'Oblivion'], the: false },
    pop: { a: ['Sugar', 'Neon', 'Velvet', 'Honey', 'Electric', 'Candy', 'Starlight', 'Bubblegum'], n: ['Hearts', 'Dreams', 'Waves', 'Lights', 'Parade', 'Rush', 'Bloom', 'Glare'], the: false },
    hiphop: { a: ['Young', 'Lil', 'Big', 'True', 'Street', 'Golden'], n: ['Legends', 'Kings', 'Prophets', 'Hustlers', 'Syndicate', 'Empire', 'Dynasty', 'Collective'], the: false },
    electronic: { a: ['Neon', 'Digital', 'Synthetic', 'Chrome', 'Plasma', 'Laser', 'Analog', 'Hyper'], n: ['Pulse', 'Frequency', 'Circuit', 'Voltage', 'Mirage', 'Signal', 'Drift', 'Nova'], the: false },
    jazz: { a: ['Blue', 'Midnight', 'Velvet', 'Smoky', 'Golden', 'Late Night'], n: ['Quartet', 'Quintet', 'Ensemble', 'Collective', 'Trio', 'Society', 'Project', 'Session'], the: true },
    punk: { a: ['Dead', 'Cheap', 'Loud', 'Rotten', 'Static', 'Broken'], n: ['Bratz', 'Rebels', 'Anthems', 'Misfits', 'Riot', 'Trash', 'Noise', 'Youth'], the: true },
    indie: { a: ['Paper', 'Glass', 'Wild', 'Slow', 'Pale', 'Hollow', 'Amber', 'Faded'], n: ['Houses', 'Gardens', 'Waves', 'Lanterns', 'Fields', 'Mirrors', 'Tides', ' sparrows'.trim()], the: false }
  };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ri(n) { return Math.floor(Math.random() * n); }
  function generate() {
    TN.clearErr(ERR);
    var g = TN.el('bname-genre').value;
    var L = LISTS[g] || LISTS.rock;
    var seen = {}, out = [], guard = 0;
    while (out.length < 8 && guard++ < 200) {
      var a = L.a[ri(L.a.length)], n = L.n[ri(L.n.length)];
      var name;
      var style = ri(4);
      if (style === 0) name = a + ' ' + n;
      else if (style === 1) name = (L.the && ri(2) === 0 ? 'The ' : '') + a + ' ' + n;
      else if (style === 2) name = n + ' of ' + a;
      else name = a + n.replace(/\s/g, '');
      if (!seen[name]) { seen[name] = 1; out.push(name); }
    }
    var html = '<div class="grid2">';
    out.forEach(function (nm, i) {
      html += '<button type="button" class="btn btn-outline bname-item" data-i="' + i + '" style="justify-content:flex-start">' + esc(nm) + '</button>';
    });
    TN.el('bname-list').innerHTML = html + '</div>';
    TN.qsa('#bname-list .bname-item').forEach(function (b) {
      b.addEventListener('click', function () {
        var nm = out[parseInt(b.getAttribute('data-i'), 10)];
        if (TN.copy) TN.copy(nm);
        var old = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(function () { b.textContent = old; }, 900);
      });
    });
  }
  try {
    TN.on('bname-go', 'click', generate);
    TN.on('bname-genre', 'change', generate);
    generate();
  } catch (e) { /* never throw on load */ }
})();