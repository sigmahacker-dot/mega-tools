/* Alliteration Generator — letter + theme based alliterative phrases. */
(function () {
  'use strict';
  var SLUG = 'alliteration-generator';
  // adjectives + nouns per letter
  var WORDS = {
    A: { a: ['adorable', 'ambitious', 'ancient', 'artful'], n: ['albatross', 'archer', 'artist', 'antelope'] },
    B: { a: ['brave', 'bright', 'bold', 'bouncy'], n: ['badger', 'baker', 'bison', 'balloon'] },
    C: { a: ['clever', 'calm', 'curious', 'crimson'], n: ['captain', 'comet', 'cougar', 'castle'] },
    D: { a: ['daring', 'dazzling', 'dreamy', 'dapper'], n: ['dragon', 'dancer', 'dolphin', 'drummer'] },
    E: { a: ['eager', 'elegant', 'electric', 'endless'], n: ['eagle', 'explorer', 'elf', 'engine'] },
    F: { a: ['fearless', 'frosty', 'friendly', 'fancy'], n: ['falcon', 'farmer', 'fox', 'flute'] },
    G: { a: ['gentle', 'glorious', 'golden', 'graceful'], n: ['giant', 'gardener', 'gazelle', 'guitar'] },
    H: { a: ['happy', 'heroic', 'humble', 'hazy'], n: ['hawk', 'hunter', 'hippo', 'harp'] },
    I: { a: ['icy', 'imaginative', 'intrepid', 'iridescent'], n: ['iguana', 'inventor', 'island', 'impala'] },
    J: { a: ['jolly', 'jaunty', 'jubilant', 'jagged'], n: ['jaguar', 'jester', 'jay', 'juggler'] },
    K: { a: ['kind', 'keen', 'knightly', 'kooky'], n: ['king', 'knight', 'kangaroo', 'kite'] },
    L: { a: ['lively', 'lucky', 'luminous', 'loyal'], n: ['lion', 'lark', 'lantern', 'llama'] },
    M: { a: ['mighty', 'magical', 'merry', 'misty'], n: ['monarch', 'mountain', 'mermaid', 'magician'] },
    N: { a: ['noble', 'nimble', 'nocturnal', 'nifty'], n: ['navigator', 'newt', 'nomad', 'nightingale'] },
    O: { a: ['optimistic', 'opulent', 'original', 'observant'], n: ['owl', 'otter', 'orchard', 'oasis'] },
    P: { a: ['playful', 'proud', 'patient', 'polished'], n: ['panda', 'pilot', 'panther', 'poet'] },
    Q: { a: ['quick', 'quiet', 'quirky', 'queenly'], n: ['quail', 'queen', 'quest', 'quiver'] },
    R: { a: ['radiant', 'restless', 'royal', 'rugged'], n: ['raven', 'rider', 'rhino', 'river'] },
    S: { a: ['silent', 'sparkling', 'swift', 'sturdy'], n: ['sailor', 'sparrow', 'serpent', 'summit'] },
    T: { a: ['tall', 'tenacious', 'timeless', 'twinkling'], n: ['tiger', 'traveler', 'turtle', 'tower'] },
    U: { a: ['unique', 'upbeat', 'unseen', 'undaunted'], n: ['unicorn', 'umpire', 'urchin', 'ukulele'] },
    V: { a: ['vivid', 'valiant', 'velvety', 'vast'], n: ['violin', 'voyager', 'viper', 'valley'] },
    W: { a: ['wild', 'wise', 'witty', 'whispering'], n: ['wolf', 'wizard', 'whale', 'waterfall'] },
    X: { a: ['xenial', 'xeric'], n: ['xenops', 'xylophone'] },
    Y: { a: ['young', 'youthful', 'yearning', 'yare'], n: ['yak', 'yogi', 'yew', 'yacht'] },
    Z: { a: ['zealous', 'zippy', 'zany', 'zen'], n: ['zebra', 'zephyr', 'zookeeper', 'ziggurat'] }
  };
  var THEMES = {
    nature: { v: ['dances through', 'wanders across', 'sings beneath', 'rests beside'], s: ['the forest', 'the meadow', 'the mountains', 'the riverbank'] },
    animals: { v: ['chases', 'befriends', 'races', 'outsmarts'], s: ['at dawn', 'in the wild', 'under moonlight', 'across the plains'] },
    food: { v: ['savors', 'serves', 'shares', 'tastes'], s: ['at the feast', 'in the kitchen', 'with delight', 'every morning'] },
    space: { v: ['soars past', 'orbits', 'discovers', 'lights up'], s: ['the stars', 'the galaxy', 'a new world', 'the cosmos'] },
    adventure: { v: ['conquers', 'explores', 'defends', 'seeks'], s: ['the unknown', 'the distant shore', 'the hidden path', 'the final frontier'] }
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var letter = TN.el(SLUG + '-letter').value;
    var theme = THEMES[TN.el(SLUG + '-theme').value];
    var bank = WORDS[letter];
    var out = [];
    for (var i = 0; i < 5; i++) {
      var a1 = pick(bank.a), a2 = pick(bank.a);
      if (a2 === a1 && bank.a.length > 1) a2 = pick(bank.a);
      var phrase = a1[0].toUpperCase() + a1.slice(1) + ' ' + a2 + ' ' + pick(bank.n) +
        ' ' + pick(theme.v) + ' ' + pick(theme.s) + '.';
      out.push(phrase);
    }
    var box = TN.el(SLUG + '-output');
    box.innerHTML = '';
    out.forEach(function (p) {
      var d = document.createElement('div');
      d.style.cssText = 'padding:6px;cursor:pointer;border-bottom:1px dashed #ddd';
      d.textContent = p;
      d.title = 'Click to copy';
      d.addEventListener('click', function () { TN.copy(p); });
      box.appendChild(d);
    });
  }

  try {
    var sel = TN.el(SLUG + '-letter');
    for (var L = 65; L <= 90; L++) {
      var o = document.createElement('option');
      o.value = String.fromCharCode(L);
      o.textContent = String.fromCharCode(L);
      sel.appendChild(o);
    }
    TN.on(SLUG + '-run', 'click', generate);
    generate();
  } catch (e) { /* never throw on load */ }
})();
