/* Tavern Name Generator — "The Adjective Noun" tavern names with flavor lines. */
(function () {
  'use strict';
  var SLUG = 'tavern-name-generator';

  var ADJ = ['Prancing', 'Drunken', 'Golden', 'Rusty', 'Laughing', 'Sleeping', 'Howling', 'Dancing', 'Silver', 'Copper', 'Velvet', 'Smiling', 'Wandering', 'Gilded', 'Merry', 'Thirsty', 'Rowdy', 'Quiet', 'Jolly', 'Tipsy', 'Weary', 'Lucky', 'Soggy', 'Frothy'];
  var NOUN = ['Pony', 'Dragon', 'Goblin', 'Tankard', 'Boar', 'Stag', 'Mermaid', 'Griffin', 'Badger', 'Owl', 'Fox', 'Bear', 'Unicorn', 'Kraken', 'Wench', 'Lantern', 'Cask', 'Hearth', 'Anvil', 'Barrel', 'Mug', 'Pint', 'Flask', 'Kettle'];
  var FLAVOR = [
    'Famous for its honey mead and suspiciously sticky floors.',
    'The bard here only knows one song. Everyone sings along anyway.',
    'Adventurers welcome; dragons pay double.',
    'Best stew in the kingdom, worst rumors in the kingdom.',
    'The fireplace never goes out. Nobody knows why. Nobody asks.',
    'Cheap ale, strong opinions, and a dartboard with a dark past.',
    'The innkeeper remembers every face — and every unpaid tab.',
    'Live music nightly, bar fights on a strict schedule.',
    'Cozy booths, warm bread, and a cellar the rats refuse to enter.',
    'Where heroes are made and hangovers are legendary.',
    'The sign outside has been upside down for forty years. It is tradition now.',
    'Serves a pie so good it once ended a feud.',
    'Dogs welcome, cats tolerated, bards charged extra.',
    'The back room is always reserved for "absolutely no one important".',
    'Candlelit, creaky-floored, and perfect after a long quest.',
    'Ask about the secret menu. Do not ask about the secret cellar.'
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cssText = 'cursor:pointer;flex:1';
      var b = document.createElement('div');
      b.style.fontWeight = '600';
      b.textContent = t.name;
      var s = document.createElement('div');
      s.className = 'muted';
      s.style.fontSize = '.8rem';
      s.textContent = t.flavor;
      res.appendChild(b);
      res.appendChild(s);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      var full = t.name + ' — ' + t.flavor;
      function doCopy() {
        TN.copy(full).then(function (ok) {
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
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 300) {
          guard++;
          var name = 'The ' + pick(ADJ) + ' ' + pick(NOUN);
          if (!seen[name]) {
            seen[name] = true;
            out.push({ name: name, flavor: pick(FLAVOR) });
          }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'The keg ran dry. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
