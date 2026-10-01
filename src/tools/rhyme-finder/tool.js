/* Rhyme Finder — ~40 rhyme families plus a same-ending fallback matcher. */
(function () {
  'use strict';
  var SLUG = 'rhyme-finder';
  var FAMILIES = [
    { end: 'ay', words: ['day', 'play', 'say', 'way', 'stay', 'clay', 'tray', 'away', 'obey', 'delay', 'sway', 'pray'] },
    { end: 'ight', words: ['light', 'night', 'right', 'fight', 'bright', 'flight', 'sight', 'tight', 'might', 'delight'] },
    { end: 'oon', words: ['moon', 'soon', 'spoon', 'noon', 'balloon', 'tune', 'afternoon', 'baboon', 'croon', 'lagoon'] },
    { end: 'eart', words: ['heart', 'part', 'start', 'art', 'smart', 'chart', 'apart', 'restart'] },
    { end: 'ove', words: ['love', 'dove', 'glove', 'above', 'shove'] },
    { end: 'ain', words: ['rain', 'pain', 'train', 'again', 'brain', 'chain', 'plain', 'explain', 'remain', 'stain'] },
    { end: 'eam', words: ['dream', 'team', 'stream', 'cream', 'beam', 'gleam', 'seem', 'theme'] },
    { end: 'ore', words: ['more', 'shore', 'door', 'floor', 'store', 'before', 'explore', 'roar', 'pour', 'soar'] },
    { end: 'and', words: ['hand', 'land', 'stand', 'sand', 'band', 'grand', 'command', 'demand', 'expand'] },
    { end: 'eal', words: ['real', 'feel', 'deal', 'heal', 'seal', 'steal', 'wheel', 'appeal', 'reveal'] },
    { end: 'ing', words: ['sing', 'ring', 'king', 'spring', 'thing', 'bring', 'wing', 'morning', 'running', 'fling'] },
    { end: 'ow', words: ['now', 'how', 'cow', 'plow', 'allow', 'wow', 'brow', 'vow'] },
    { end: 'ee', words: ['see', 'tree', 'free', 'sea', 'be', 'me', 'key', 'agree', 'degree', 'flee', 'tea', 'he'] },
    { end: 'all', words: ['all', 'call', 'fall', 'wall', 'ball', 'small', 'tall', 'hall', 'recall', 'thrall'] },
    { end: 'own', words: ['down', 'town', 'brown', 'crown', 'gown', 'renown', 'drown', 'frown'] },
    { end: 'ace', words: ['face', 'place', 'space', 'race', 'grace', 'trace', 'embrace', 'chase'] },
    { end: 'ire', words: ['fire', 'desire', 'wire', 'tire', 'inspire', 'require', 'admire', 'choir'] },
    { end: 'oud', words: ['loud', 'cloud', 'proud', 'crowd', 'aloud', 'shroud'] },
    { end: 'eep', words: ['deep', 'sleep', 'keep', 'sweep', 'steep', 'creep', 'sheep', 'weep'] },
    { end: 'other', words: ['mother', 'brother', 'other', 'another', 'smother'] },
    { end: 'one', words: ['one', 'done', 'sun', 'run', 'fun', 'gone', 'none', 'won', 'begun', 'shun'] },
    { end: 'air', words: ['air', 'fair', 'care', 'share', 'bear', 'there', 'where', 'stair', 'rare', 'declare'] },
    { end: 'ell', words: ['well', 'tell', 'bell', 'shell', 'spell', 'smell', 'dwell', 'fell'] },
    { end: 'ar', words: ['far', 'car', 'star', 'bar', 'jar', 'guitar', 'bizarre', 'scar'] },
    { end: 'old', words: ['old', 'gold', 'cold', 'bold', 'told', 'hold', 'sold', 'fold', 'mold'] },
    { end: 'ide', words: ['side', 'wide', 'tide', 'ride', 'hide', 'pride', 'guide', 'inside', 'divide'] },
    { end: 'ome', words: ['home', 'roam', 'foam', 'dome', 'comb', 'tome'] },
    { end: 'ill', words: ['hill', 'will', 'still', 'fill', 'thrill', 'skill', 'chill', 'grill'] },
    { end: 'at', words: ['cat', 'hat', 'bat', 'mat', 'flat', 'that', 'chat', 'splat', 'combat'] },
    { end: 'ime', words: ['time', 'rhyme', 'climb', 'chime', 'sublime', 'mime'] },
    { end: 'orn', words: ['born', 'torn', 'worn', 'morn', 'scorn', 'thorn', 'adorn'] },
    { end: 'ound', words: ['sound', 'round', 'ground', 'found', 'bound', 'profound', 'mound', 'astound'] },
    { end: 'eauty', words: ['beauty', 'duty'] },
    { end: 'ation', words: ['nation', 'station', 'creation', 'relation', 'celebration', 'imagination', 'vacation'] },
    { end: 'iss', words: ['kiss', 'miss', 'bliss', 'dismiss', 'hiss', 'remiss'] },
    { end: 'og', words: ['dog', 'fog', 'log', 'frog', 'jog', 'bog', 'dialog'] },
    { end: 'eet', words: ['meet', 'street', 'sweet', 'feet', 'greet', 'fleet', 'complete', 'heat', 'beat'] },
    { end: 'ush', words: ['push', 'rush', 'bush', 'crush', 'blush', 'hush', 'gush'] },
    { end: 'est', words: ['best', 'test', 'rest', 'nest', 'quest', 'guest', 'chest', 'invest'] }
  ];

  function findRhymes(word) {
    var w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return { type: 'none' };
    var direct = [];
    FAMILIES.forEach(function (f) {
      if (!f.words.length) return;
      if (f.words.indexOf(w) !== -1) {
        direct = f.words.filter(function (x) { return x !== w; });
      }
    });
    if (direct.length) return { type: 'family', rhymes: direct };
    // fallback: same-ending matcher — try 3-letter then 2-letter endings
    var all = [];
    FAMILIES.forEach(function (f) { all = all.concat(f.words); });
    var ends = [w.slice(-3), w.slice(-2)];
    for (var e = 0; e < ends.length; e++) {
      var end = ends[e];
      if (!end) continue;
      var hits = all.filter(function (x) { return x !== w && x.slice(-end.length) === end; });
      if (hits.length) return { type: 'fallback', rhymes: hits.slice(0, 24), end: end };
    }
    return { type: 'none' };
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value.trim();
    if (!input) { TN.setErr(SLUG + '-error', 'Please type a word first.'); return; }
    var res = findRhymes(input);
    var box = TN.el(SLUG + '-output');
    box.innerHTML = '';
    function addRhyme(word) {
      var b = document.createElement('button');
      b.className = 'btn btn-outline';
      b.style.margin = '2px';
      b.textContent = word;
      b.addEventListener('click', function () { TN.copy(word); });
      box.appendChild(b);
    }
    if (res.type === 'none') {
      box.textContent = 'No rhymes found for "' + input + '". The built-in bank covers common endings — try a different word.';
      return;
    }
    var note = document.createElement('p');
    note.className = 'muted';
    note.textContent = res.type === 'family'
      ? 'Rhymes from the same family — click any word to copy:'
      : 'No exact family match — words sharing the ending "-' + res.end + '":';
    box.appendChild(note);
    res.rhymes.forEach(addRhyme);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-input', 'keydown', function (e) { if (e.key === 'Enter') run(); });
  } catch (e) { /* never throw on load */ }
})();
