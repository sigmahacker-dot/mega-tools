/* Compliment Generator — 80+ compliments in 5 categories. */
(function () {
  'use strict';
  var SLUG = 'compliment-generator';
  var ERR = SLUG + '-error';
  var C = {
    kindness: [
      "You have the kindest heart of anyone I know.", "You make everyone around you feel welcome.",
      "Your generosity inspires people.", "You always know the right thing to say.",
      "The world is better because you're in it.", "You treat strangers like friends.",
      "Your patience is remarkable.", "You listen like you truly care — because you do.",
      "You bring out the best in people.", "Your kindness is contagious.",
      "You have a gift for making people feel seen.", "Thank you for being so dependable.",
      "You forgive easily and love deeply.", "Your compassion knows no bounds.",
      "You make hard days easier just by being there.", "You're the friend everyone wishes they had."
    ],
    creativity: [
      "Your imagination is incredible.", "You turn ordinary ideas into something magical.",
      "Your creativity knows no limits.", "You see possibilities where others see walls.",
      "Everything you make has your unique spark.", "Your artistic eye is amazing.",
      "You think outside the box — then redesign the box.", "Your ideas are always fresh.",
      "You make creativity look effortless.", "Your originality is inspiring.",
      "You color outside the lines beautifully.", "Your vision is one of a kind.",
      "You dream big and create bigger.", "Your talent speaks for itself.",
      "You find beauty in unexpected places.", "Creating comes so naturally to you."
    ],
    smart: [
      "You're brilliantly clever.", "Your mind works in fascinating ways.",
      "You explain complex things so clearly.", "Your wisdom goes beyond your years.",
      "You ask the questions nobody else thinks of.", "Your memory is impressive.",
      "You're a natural problem solver.", "Your insights are always spot on.",
      "You learn faster than anyone I know.", "Your logic is razor sharp.",
      "You're wise beyond measure.", "Your curiosity is inspiring.",
      "You connect ideas like nobody else.", "Your brain is a powerhouse.",
      "You make smart look easy.", "Your perspective is always valuable."
    ],
    looks: [
      "You have a wonderful smile.", "You look fantastic today.",
      "Your style is effortlessly cool.", "You have such expressive eyes.",
      "You carry yourself with confidence.", "That color looks great on you.",
      "You have a warm, inviting presence.", "Your laugh is the best sound.",
      "You glow when you're happy.", "You have great taste.",
      "Your energy lights up the room.", "You look like you just stepped out of a magazine.",
      "Your hair looks amazing today.", "You have a timeless charm.",
      "You wear confidence beautifully.", "Your smile is contagious."
    ],
    funny: [
      "You're funnier than a cat in a sweater.", "You could make a statue laugh.",
      "Your jokes deserve their own sitcom.", "You're proof that awesome has a sense of humor.",
      "If laughter is medicine, you're the pharmacy.", "You're hilariously wonderful.",
      "Your wit is sharper than a chef's knife.", "You put the 'fun' in 'functional human'.",
      "Comedians take notes from you.", "You're dangerously funny.",
      "Your humor should be bottled and sold.", "You make Mondays feel like Fridays.",
      "You're the plot twist everyone loves.", "Your puns are pun-believable.",
      "You're a national treasure of silliness.", "Life's a party and you're the confetti."
    ]
  };
  var current = '';

  function $(id) { return document.getElementById(id); }

  function pick() {
    var cat = $('compliment-generator-cat').value;
    var pool = cat === 'all'
      ? C.kindness.concat(C.creativity, C.smart, C.looks, C.funny)
      : (C[cat] || C.kindness);
    var i = Math.floor(Math.random() * pool.length);
    current = pool[i];
    $('compliment-generator-text').textContent = '\u201C' + current + '\u201D';
    TN.clearErr(ERR);
  }

  try {
    TN.on('compliment-generator-new', 'click', pick);
    TN.on('compliment-generator-cat', 'change', pick);
    TN.on('compliment-generator-copy', 'click', function () {
      if (!current) { TN.setErr(ERR, 'Generate a compliment first.'); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(current).then(function () { TN.clearErr(ERR); }, function () { TN.setErr(ERR, 'Copy failed.'); });
      } else { TN.setErr(ERR, 'Clipboard not available.'); }
    });
    pick();
  } catch (e) { /* never throw on load */ }
})();
