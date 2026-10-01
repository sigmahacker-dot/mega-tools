/* Codename Generator — adjective + noun project codenames, optional number suffix. */
(function () {
  'use strict';
  var SLUG = 'codename-generator';

  var ADJ = ['Silent', 'Crimson', 'Iron', 'Velvet', 'Midnight', 'Golden', 'Shadow', 'Electric', 'Frozen', 'Burning', 'Hollow', 'Rapid', 'Ancient', 'Neon', 'Obsidian', 'Scarlet', 'Cobalt', 'Emerald', 'Onyx', 'Ivory', 'Rusty', 'Stormy', 'Lonely', 'Wild', 'Brave', 'Clever', 'Swift', 'Bold', 'Quiet', 'Lunar', 'Solar', 'Astral', 'Phantom', 'Savage', 'Noble', 'Fierce', 'Gentle', 'Crimson', 'Vivid', 'Arcane', 'Prime', 'Zero', 'Last', 'First', 'Hidden', 'Broken', 'Sacred', 'Fallen', 'Rising'];
  var NOUN = ['Falcon', 'Vortex', 'Badger', 'Hammer', 'Cipher', 'Dragon', 'Wolf', 'Phoenix', 'Tiger', 'Serpent', 'Eagle', 'Bear', 'Fox', 'Raven', 'Shark', 'Panther', 'Cobra', 'Jaguar', 'Owl', 'Stallion', 'Beacon', 'Forge', 'Harbor', 'Lantern', 'Compass', 'Anchor', 'Bridge', 'Tower', 'Gate', 'Key', 'Shield', 'Sword', 'Arrow', 'Storm', 'Thunder', 'Lightning', 'Comet', 'Meteor', 'Nebula', 'Quasar', 'Pulsar', 'Horizon', 'Summit', 'Abyss', 'Mirage', 'Echo', 'Nomad', 'Pilgrim', 'Ranger', 'Scout'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cssText = 'cursor:pointer;flex:1;font-weight:600;letter-spacing:.5px';
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
        var numbered = TN.el(SLUG + '-num').checked;
        var seen = {}, out = [], guard = 0;
        while (out.length < 10 && guard < 300) {
          guard++;
          var c = pick(ADJ) + ' ' + pick(NOUN);
          if (numbered) c += ' ' + (1 + Math.floor(Math.random() * 99));
          if (!seen[c]) { seen[c] = true; out.push(c); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate codenames. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
