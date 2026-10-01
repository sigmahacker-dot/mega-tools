/* Guild Name Generator — fantasy guild names by guild type. */
(function () {
  'use strict';
  var SLUG = 'guild-name-generator';

  var G = {
    warriors: {
      pre: ['Iron', 'Blood', 'Storm', 'Oath', 'Blade', 'Shield', 'War', 'Thunder', 'Frost', 'Ember', 'Stone', 'Wolf'],
      core: ['Blades', 'Wardens', 'Sentinels', 'Guardians', 'Legion', 'Vanguard', 'Champions', 'Warband', 'Phalanx', 'Reavers', 'Paladins', 'Marauders'],
      post: ['of the North', 'of the Broken Shield', 'of Dawn', 'of the Iron Oath', 'of the Howling Pass', 'of the Last Stand']
    },
    mages: {
      pre: ['Arcane', 'Moon', 'Star', 'Ember', 'Frost', 'Shadow', 'Rune', 'Astral', 'Eldritch', 'Mystic', 'Silent', 'Crimson'],
      core: ['Circle', 'Order', 'Covenant', 'Conclave', 'Society', 'Academy', 'Fellowship', 'Syndicate', 'Assembly', 'Cabal', 'College', 'Enclave'],
      post: ['of the Silver Tower', 'of the Ninth Moon', 'of Whispering Runes', 'of the Eternal Flame', 'of the Starlit Veil', 'of Forgotten Lore']
    },
    thieves: {
      pre: ['Silent', 'Shadow', 'Night', 'Whispering', 'Crimson', 'Black', 'Hollow', 'Sly', 'Velvet', 'Smoke', 'Gilded', 'Pale'],
      core: ['Daggers', 'Foxes', 'Rats', 'Crows', 'Fingers', 'Shadows', 'Masks', 'Knives', 'Vipers', 'Owls', 'Jackals', 'Moths'],
      post: ['of the Back Alley', 'of the Midnight Market', 'of the Rooftops', 'of the Gilded Coin', 'of the Unseen Hand', 'of the Hollow Lantern']
    },
    merchants: {
      pre: ['Golden', 'Silver', 'Gilded', 'Opulent', 'Prosperous', 'Grand', 'Royal', 'Amber', 'Jade', 'Ivory', 'Copper', 'Saffron'],
      core: ['Company', 'Consortium', 'Exchange', 'Syndicate', 'Guild', 'Partnership', 'Venture', 'House', 'Cartel', 'Alliance', 'Trust', 'Bazaar'],
      post: ['of the Seven Seas', 'of the Silk Road', 'of the Golden Scale', 'of Far Harbors', 'of the Spice Isles', 'of the Open Market']
    }
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function makeName(type) {
    var b = G[type] || G.warriors;
    var style = Math.floor(Math.random() * 3);
    if (style === 0) return 'The ' + pick(b.pre) + ' ' + pick(b.core);
    if (style === 1) return 'The ' + pick(b.pre) + ' ' + pick(b.core) + ' ' + pick(b.post);
    return pick(b.core) + ' ' + pick(b.post);
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
        var type = TN.el(SLUG + '-type').value;
        var seen = {}, out = [], guard = 0;
        while (out.length < 10 && guard < 300) {
          guard++;
          var t = type === 'mixed' ? pick(Object.keys(G)) : type;
          var n = makeName(t);
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
