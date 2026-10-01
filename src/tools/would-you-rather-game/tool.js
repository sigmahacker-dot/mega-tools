/* Would You Rather — 60 dilemmas, localStorage vote tallies. */
(function () {
  'use strict';
  var SLUG = 'would-you-rather-game';
  var Q = [
    ["fly", "be invisible"], ["be rich", "be famous"], ["live in the past", "live in the future"],
    ["never use the internet again", "never watch TV again"], ["have super strength", "have super speed"],
    ["always be 10 minutes late", "always be 20 minutes early"], ["eat only pizza forever", "eat only tacos forever"],
    ["be able to talk to animals", "speak every human language"], ["live without music", "live without movies"],
    ["have unlimited money", "have unlimited time"], ["be a great singer", "be a great dancer"],
    ["explore space", "explore the deep ocean"], ["never sleep again", "never eat again (but stay healthy)"],
    ["be 10 years old forever", "be 80 years old forever"], ["fight 100 duck-sized horses", "fight 1 horse-sized duck"],
    ["have a rewind button", "have a pause button for life"], ["know the date of your death", "know the cause of your death"],
    ["lose all your photos", "lose all your contacts"], ["be stuck on a desert island alone", "be stuck in a city crowd forever"],
    ["sweat maple syrup", "cry hot sauce"], ["have hands for feet", "have feet for hands"],
    ["only whisper", "only shout"], ["read minds", "see the future"],
    ["give up your phone", "give up your best friend (just kidding — your pet)"],
    ["be chased by bees", "be chased by geese"], ["live in a treehouse", "live in a cave"],
    ["have a dragon", "have a unicorn"], ["time travel to the past only", "time travel to the future only"],
    ["be the funniest person alive", "be the smartest person alive"], ["never laugh again", "never smile again"],
    ["wear wet socks forever", "have an itch you can never scratch"], ["eat a bug", "lick a public doorknob"],
    ["be famous for something embarrassing", "be unknown but happy"], ["have 10 kids", "have no kids"],
    ["live 200 years in the past", "live 200 years in the future"], ["always say everything on your mind", "never speak again"],
    ["be able to teleport", "be able to read minds"], ["have no eyebrows", "have no eyelashes"],
    ["drink sour milk", "eat moldy bread"], ["be too hot always", "be too cold always"],
    ["have a third eye", "have a third arm"], ["only eat with a spoon", "only eat with chopsticks"],
    ["be a superhero", "be a wizard"], ["win the lottery but lose all friends", "stay as you are with friends"],
    ["have hiccups forever", "sneeze every 5 minutes"], ["live on the moon", "live under the sea"],
    ["be able to fly but only 3 feet high", "be able to run 100 mph but only backwards"],
    ["have every song stuck in your head", "have every movie spoiled for you"],
    ["be allergic to the sun", "be allergic to water"], ["speak in rhymes", "sing everything you say"],
    ["have a personal chef", "have a personal driver"], ["know every language", "play every instrument"],
    ["be the best player on a losing team", "be the worst player on a winning team"],
    ["give up coffee", "give up dessert"], ["have dinner with anyone alive", "have dinner with anyone from history"],
    ["be able to control fire", "be able to control water"], ["live without a phone", "live without a car"],
    ["be 3 feet tall", "be 9 feet tall"], ["have x-ray vision", "have super hearing"],
    ["never wait in line again", "never hit a red light again"]
  ];
  var idx = -1, voted = false, votes = {};

  function $(id) { return document.getElementById(id); }

  function loadVotes() {
    try { votes = JSON.parse(localStorage.getItem('wyr-votes') || '{}'); } catch (e) { votes = {}; }
  }
  function saveVotes() {
    try { localStorage.setItem('wyr-votes', JSON.stringify(votes)); } catch (e) {}
  }
  function getVotes(i) {
    // seed with plausible base numbers so percentages look alive on first view
    if (!votes[i]) {
      var seed = (i * 7919) % 97;
      votes[i] = { a: 40 + seed, b: 40 + ((seed * 13) % 61) };
    }
    return votes[i];
  }

  function next() {
    var n = Math.floor(Math.random() * Q.length);
    if (Q.length > 1 && n === idx) n = (n + 1) % Q.length;
    idx = n; voted = false;
    $('would-you-rather-game-a').textContent = Q[n][0];
    $('would-you-rather-game-b').textContent = Q[n][1];
    $('would-you-rather-game-a').disabled = false;
    $('would-you-rather-game-b').disabled = false;
    $('would-you-rather-game-votes').hidden = true;
    $('would-you-rather-game-count').textContent = 'Question ' + (n + 1) + ' of ' + Q.length;
  }

  function vote(which) {
    if (voted) return;
    voted = true;
    var v = getVotes(idx);
    v[which === 'a' ? 'a' : 'b']++;
    saveVotes();
    var total = v.a + v.b;
    var pa = Math.round(v.a / total * 100), pb = 100 - pa;
    $('would-you-rather-game-pa').textContent = pa + '%';
    $('would-you-rather-game-pb').textContent = pb + '%';
    $('would-you-rather-game-bara').style.width = pa + '%';
    $('would-you-rather-game-barb').style.width = pb + '%';
    $('would-you-rather-game-total').textContent = total.toLocaleString('en-US') + ' votes on this device';
    $('would-you-rather-game-votes').hidden = false;
    $('would-you-rather-game-a').disabled = true;
    $('would-you-rather-game-b').disabled = true;
  }

  try {
    loadVotes();
    next();
    TN.on('would-you-rather-game-a', 'click', function () { vote('a'); });
    TN.on('would-you-rather-game-b', 'click', function () { vote('b'); });
    TN.on('would-you-rather-game-next', 'click', next);
  } catch (e) { /* never throw on load */ }
})();
