(function () {
  'use strict';
  var ERR = 'team-name-generator-error';
  var LISTS = {
    funny: {
      a: ['Soggy', 'Wobbly', 'Sleepy', 'Clumsy', 'Grumpy', 'Bumbling', 'Dizzy', 'Sneaky'],
      n: ['Biscuits', 'Potatoes', 'Noodles', 'Pickles', 'Muffins', 'Pigeons', 'Wombats', 'Llamas']
    },
    pro: {
      a: ['Apex', 'Prime', 'Vertex', 'Summit', 'Pinnacle', 'Elite', 'Vanguard', 'Titan'],
      n: ['Strikers', 'United', 'Alliance', 'Collective', 'Syndicate', 'Legion', 'Force', 'Squad']
    },
    punny: {
      a: ['Net', 'Goal', 'Sole', 'Pitch', 'Court', 'Track'],
      n: ['Worthys', 'Getters', 'Diggities', 'Resultants', 'Scorers', 'Runners']
    },
    animal: {
      a: ['Midnight', 'Savage', 'Silent', 'Wild', 'Iron', 'Storm', 'Golden', 'Shadow'],
      n: ['Wolves', 'Tigers', 'Falcons', 'Sharks', 'Panthers', 'Cobras', 'Bears', 'Eagles']
    },
    fantasy: {
      a: ['Crimson', 'Arcane', 'Ember', 'Frost', 'Storm', 'Moonlit', 'Ancient', 'Obsidian'],
      n: ['Dragons', 'Phoenixes', 'Griffins', 'Warlocks', 'Valkyries', 'Titans', 'Sentinels', 'Reavers']
    },
    tech: {
      a: ['Quantum', 'Neural', 'Pixel', 'Binary', 'Cyber', 'Nano', 'Vector', 'Synthetic'],
      n: ['Overlords', 'Hackers', 'Glitches', 'Bots', 'Circuits', 'Daemons', 'Nodes', 'Viruses']
    }
  };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ri(n) { return Math.floor(Math.random() * n); }
  function title(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function generate() {
    TN.clearErr(ERR);
    var style = TN.el('tname-style').value;
    var kw = TN.el('tname-kw').value.trim();
    var L = LISTS[style] || LISTS.funny;
    var seen = {}, out = [], guard = 0;
    while (out.length < 8 && guard++ < 200) {
      var a = L.a[ri(L.a.length)], n = L.n[ri(L.n.length)];
      var name;
      if (kw) {
        var mode = ri(3);
        name = mode === 0 ? title(kw) + ' ' + n : mode === 1 ? a + ' ' + title(kw) + 's' : title(kw) + ' ' + a + ' ' + n;
      } else {
        name = ri(2) === 0 ? 'The ' + a + ' ' + n : a + ' ' + n;
      }
      if (!seen[name]) { seen[name] = 1; out.push(name); }
    }
    var html = '<div class="grid2">';
    out.forEach(function (nm, i) {
      html += '<button type="button" class="btn btn-outline tname-item" data-i="' + i + '" style="justify-content:flex-start">' + esc(nm) + '</button>';
    });
    TN.el('tname-list').innerHTML = html + '</div>';
    TN.qsa('#tname-list .tname-item').forEach(function (b) {
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
    TN.on('tname-go', 'click', generate);
    TN.on('tname-style', 'change', generate);
    generate();
  } catch (e) { /* never throw on load */ }
})();