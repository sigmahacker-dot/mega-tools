/* Truth or Dare Generator — mild/wild levels, 35 truths + 35 dares, no repeats per deck. */
(function () {
  'use strict';
  var SLUG = 'truth-or-dare-generator';

  var TRUTH_MILD = [
    'What is your most embarrassing childhood memory?',
    'What is the silliest fear you still have?',
    'What is one talent you wish you had?',
    'What was your most embarrassing moment at school?',
    'What is the weirdest dream you remember?',
    'Who was your first crush?',
    'What is a secret talent nobody here knows about?',
    'What is the most childish thing you still do?',
    'What is your guilty pleasure TV show?',
    'What is the strangest food combination you enjoy?',
    'What lie did you tell as a kid that got out of hand?',
    'What is something you are terrible at but love doing?',
    'What was your most awkward date?',
    'What is the funniest thing you believed as a child?',
    'What would you do with a million dollars?',
    'What is your biggest pet peeve?',
    'What song do you secretly sing in the shower?',
    'What is the most trouble you got into as a kid?'
  ];
  var TRUTH_WILD = [
    'What is the biggest secret you have kept from your best friend?',
    'Have you ever snooped through someone\u2019s phone? What did you find?',
    'What is the most embarrassing thing in your search history?',
    'Have you ever lied to get out of trouble at work? What happened?',
    'What is a rumor you once started or spread?',
    'Who here do you trust the least with a secret — and why?',
    'What is something you have never told your parents?',
    'Have you ever pretended to like a gift you hated?',
    'What is the pettiest thing you have ever done?',
    'Have you ever eavesdropped and heard something shocking?',
    'What is the worst date you have ever been on?',
    'Have you ever ghosted someone? Why?',
    'What is your most irrational jealousy story?',
    'What white lie do you tell most often?',
    'Have you ever taken credit for someone else\u2019s work?',
    'What is the boldest thing you have done on a dare before?',
    'What secret would shock everyone here?'
  ];
  var DARE_MILD = [
    'Do your best impression of a celebrity for 30 seconds.',
    'Sing the chorus of your favorite song out loud.',
    'Do 10 jumping jacks while shouting your name.',
    'Talk in a robot voice for the next 3 rounds.',
    'Let someone style your hair however they want.',
    'Do a silly dance for 30 seconds.',
    'Speak only in rhymes for the next 3 rounds.',
    'Pretend to be a news anchor and report on the room.',
    'Eat a spoonful of a condiment chosen by the group.',
    'Call a friend and sing happy birthday to them.',
    'Do your best animal impression — the group guesses which.',
    'Balance a book on your head for one minute.',
    'Tell a joke. If nobody laughs, do 5 push-ups.',
    'Swap an item of clothing with the person next to you.',
    'Draw a portrait of the person across from you in 60 seconds.',
    'Do 20 squats while the group counts loudly.',
    'Let the group send one text from your phone.',
    'Pretend to cry dramatically like a soap opera star.'
  ];
  var DARE_WILD = [
    'Let the group go through your photo gallery for 60 seconds.',
    'Read your last 5 text messages out loud.',
    'Post an embarrassing selfie with a caption the group writes.',
    'Call your crush or partner and tell them you love pickles.',
    'Let someone write a word on your forehead for the rest of the game.',
    'Do 30 seconds of freestyle rap about the person next to you.',
    'Trade phones with someone for 5 minutes.',
    'Wear your clothes inside-out for the next 3 rounds.',
    'Serenade the person to your left.',
    'Let the group pick your profile picture for 24 hours.',
    'Do an impression of everyone in the room, one by one.',
    'Speak in a dramatic movie-trailer voice for 5 minutes.',
    'Let someone else choose what you drink next.',
    'Attempt a handstand (or headstand) against the wall.',
    'Text your mom something the group writes — no context.',
    'Do the worm (or your best attempt at it).',
    'Give a 60-second motivational speech about socks.'
  ];

  var decks = {};

  function shuffled(a) {
    var arr = a.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function deckFor(key, bank) {
    if (!decks[key] || !decks[key].length) decks[key] = shuffled(bank);
    return decks[key];
  }
  function reshuffle() {
    decks = {};
    TN.el(SLUG + '-card').textContent = 'Decks reshuffled. Draw a fresh card.';
  }

  function init() {
    if (!TN.el(SLUG + '-draw')) return;
    TN.on(SLUG + '-draw', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var type = TN.el(SLUG + '-type').value;
        var level = TN.el(SLUG + '-level').value;
        if (type === 'random') type = Math.random() < 0.5 ? 'truth' : 'dare';
        var bank, key = type + '-' + level;
        if (type === 'truth') bank = level === 'mild' ? TRUTH_MILD : TRUTH_WILD;
        else bank = level === 'mild' ? DARE_MILD : DARE_WILD;
        var card = deckFor(key, bank).pop();
        var label = type === 'truth' ? 'TRUTH' : 'DARE';
        TN.el(SLUG + '-card').innerHTML = '<div><div class="muted" style="font-size:.75rem;letter-spacing:2px;margin-bottom:8px">' +
          label + ' · ' + level.toUpperCase() + '</div><div>' + TN.esc(card) + '</div></div>';
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not draw a card. Please try again.'); }
    });
    TN.on(SLUG + '-shuffle', 'click', function () {
      try { TN.clearErr(SLUG + '-error'); reshuffle(); }
      catch (e) { TN.setErr(SLUG + '-error', 'Could not reshuffle. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
