/* Pirate Ipsum Generator — pirate-speak filler paragraphs from sentence templates + banks. */
(function () {
  'use strict';
  var SLUG = 'pirate-ipsum-generator';

  var EXCL = ['Arr!', 'Avast!', 'Shiver me timbers!', 'Yo-ho-ho!', 'Blow me down!', 'Savvy?', 'Aye!'];
  var NOUN = ['the seven seas', 'Davy Jones\u2019 locker', 'the briny deep', 'a treasure chest', 'the crow\u2019s nest', 'a bottle o\u2019 rum', 'the plank', 'a sea shanty', 'the Jolly Roger', 'a doubloon', 'the cap\u2019n\u2019s cabin', 'a cutlass', 'the galley', 'a parrot', 'the mainmast', 'a storm brewin\u2019', 'the doldrums', 'a mermaid\u2019s song', 'the bilge', 'a map to buried gold', 'the starboard rail', 'a kraken', 'the tide', 'a mutiny'];
  var VERB = ['swab', 'hoist', 'plunder', 'chart', 'navigate', 'batten down', 'keelhaul', 'scuttle', 'heave', 'splice', 'maroon', 'ransack', 'weigh', 'fathom', 'caulk', 'reef', 'tack', 'jibe', 'board', 'pillow-fight'];
  var ADJ = ['scurvy', 'barnacle-covered', 'salt-crusted', 'dread', 'swashbucklin\u2019', 'rum-soaked', 'weather-beaten', 'golden', 'cursed', 'mighty', 'ragged', 'fearsome', 'jolly', 'soggy', 'briny'];
  var CREW = ['matey', 'landlubber', 'scallywag', 'buccaneer', 'corsair', 'deckhand', 'swabbie', 'old salt', 'first mate', 'powder monkey'];

  var TPL = [
    function (p) { return p(EXCL) + ' We ' + p(VERB) + ' ' + p(NOUN) + ' with our ' + p(ADJ) + ' crew of ' + p(CREW) + 's.'; },
    function (p) { return 'No ' + p(CREW) + ' escapes ' + p(NOUN) + ' when the ' + p(ADJ) + ' wind blows.'; },
    function (p) { return 'We ' + p(VERB) + 'ed ' + p(NOUN) + ' and drank to ' + p(NOUN) + ' till dawn.'; },
    function (p) { return p(EXCL) + ' The ' + p(ADJ) + ' ' + p(CREW) + ' swore by ' + p(NOUN) + ' itself.'; },
    function (p) { return 'Hoist ' + p(NOUN) + ', ye ' + p(CREW) + 's, and mind ' + p(NOUN) + '!'; },
    function (p) { return 'A ' + p(ADJ) + ' morning it was, with ' + p(NOUN) + ' on the horizon and ' + p(NOUN) + ' below.'; },
    function (p) { return 'The cap\u2019n bellowed, "' + p(VERB) + ' ' + p(NOUN) + ', ye ' + p(CREW) + 's, or taste ' + p(NOUN) + '!"'; },
    function (p) { return 'Many a ' + p(ADJ) + ' ' + p(CREW) + ' has chased ' + p(NOUN) + ' and found only ' + p(NOUN) + '.'; }
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function sentence() { return pick(TPL)(pick); }
  function paragraph() {
    var n = 4 + Math.floor(Math.random() * 3), s = [];
    for (var i = 0; i < n; i++) s.push(sentence());
    return s.join(' ');
  }

  var current = '';
  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var n = parseInt(TN.el(SLUG + '-paras').value, 10) || 3;
        var paras = [];
        for (var i = 0; i < n; i++) paras.push(paragraph());
        current = paras.join('\n\n');
        TN.el(SLUG + '-output').textContent = current;
      } catch (e) { TN.setErr(SLUG + '-error', 'Blow me down — generation failed. Try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Generate some pirate text first, matey.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy Text';
        setTimeout(function () { btn.textContent = 'Copy Text'; }, 1200);
      });
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
