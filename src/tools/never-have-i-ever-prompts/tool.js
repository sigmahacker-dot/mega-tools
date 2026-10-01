/* Never Have I Ever Prompts — 90-prompt deck, draw/shuffle, no repeats per deck. */
(function () {
  'use strict';
  var SLUG = 'never-have-i-ever-prompts';

  var PROMPTS = [
    'Never have I ever sung in the shower like I was on stage.',
    'Never have I ever pretended to know a song I had never heard.',
    'Never have I ever fallen asleep during a movie in the cinema.',
    'Never have I ever eaten a whole pizza by myself.',
    'Never have I ever Googled my own name.',
    'Never have I ever waved back at someone who was not waving at me.',
    'Never have I ever sent a text to the wrong person.',
    'Never have I ever laughed so hard I cried.',
    'Never have I ever stayed up all night talking to a friend.',
    'Never have I ever danced when nobody was watching.',
    'Never have I ever taken a nap longer than 3 hours.',
    'Never have I ever forgotten someone\u2019s name right after meeting them.',
    'Never have I ever practiced a speech in the mirror.',
    'Never have I ever blamed a fart on someone else.',
    'Never have I ever eaten dessert before dinner.',
    'Never have I ever lied about my age.',
    'Never have I ever stalked an ex on social media.',
    'Never have I ever rewatched the same show 3+ times.',
    'Never have I ever cried during a cartoon.',
    'Never have I ever fallen down the stairs.',
    'Never have I ever talked to my pet like it understands me.',
    'Never have I ever eaten food that fell on the floor.',
    'Never have I ever pretended to be sick to skip something.',
    'Never have I ever snooped through someone\u2019s phone.',
    'Never have I ever taken a selfie with a stranger.',
    'Never have I ever had a crush on a teacher.',
    'Never have I ever broken a bone.',
    'Never have I ever been on a roller coaster.',
    'Never have I ever traveled to another country.',
    'Never have I ever ridden a horse.',
    'Never have I ever gone camping.',
    'Never have I ever tried sushi.',
    'Never have I ever eaten something I could not pronounce.',
    'Never have I ever cooked a meal from scratch.',
    'Never have I ever burned food so badly the smoke alarm went off.',
    'Never have I ever stayed awake for more than 24 hours.',
    'Never have I ever pulled an all-nighter for an exam.',
    'Never have I ever cheated on a test.',
    'Never have I ever skipped class.',
    'Never have I ever fallen asleep in class.',
    'Never have I ever been sent to the principal\u2019s office.',
    'Never have I ever lost my phone.',
    'Never have I ever cracked a phone screen.',
    'Never have I ever dropped my phone in water.',
    'Never have I ever texted with autocorrect changing it to something embarrassing.',
    'Never have I ever called someone by the wrong name.',
    'Never have I ever walked into the wrong bathroom.',
    'Never have I ever tripped in public and pretended it was on purpose.',
    'Never have I ever gotten lost in my own city.',
    'Never have I ever missed a flight.',
    'Never have I ever slept through an alarm.',
    'Never have I ever been late to something important.',
    'Never have I ever forgotten a birthday.',
    'Never have I ever regifted a present.',
    'Never have I ever kept a secret for more than a year.',
    'Never have I ever told a white lie to get out of plans.',
    'Never have I ever eavesdropped on a conversation.',
    'Never have I ever read someone\u2019s diary.',
    'Never have I ever had a secret nickname for someone.',
    'Never have I ever cried at work or school.',
    'Never have I ever quit a job.',
    'Never have I ever been fired.',
    'Never have I ever worked a night shift.',
    'Never have I ever fallen asleep at work.',
    'Never have I ever called in sick when I was not sick.',
    'Never have I ever had a workplace crush.',
    'Never have I ever won a competition.',
    'Never have I ever lost a bet.',
    'Never have I ever won money gambling.',
    'Never have I ever been in a talent show.',
    'Never have I ever performed on a stage.',
    'Never have I ever sung karaoke.',
    'Never have I ever forgotten the lyrics while singing along.',
    'Never have I ever danced in the rain.',
    'Never have I ever skinny-dipped.',
    'Never have I ever gone stargazing.',
    'Never have I ever seen a shooting star.',
    'Never have I ever made a wish at 11:11.',
    'Never have I ever believed in a superstition.',
    'Never have I ever knocked on wood for luck.',
    'Never have I ever read my horoscope.',
    'Never have I ever been scared of the dark as an adult.',
    'Never have I ever watched a horror movie alone.',
    'Never have I ever screamed on a ride.',
    'Never have I ever been on TV.',
    'Never have I ever met a celebrity.',
    'Never have I ever asked for an autograph.',
    'Never have I ever photobombed a stranger\u2019s picture.',
    'Never have I ever been in a viral video.',
    'Never have I ever gone viral online.'
  ];

  var deck = [], idx = 0;

  function shuffled(a) {
    var arr = a.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function reshuffle() {
    deck = shuffled(PROMPTS);
    idx = 0;
    TN.el(SLUG + '-left').textContent = deck.length;
    TN.el(SLUG + '-card').textContent = 'Deck shuffled. Press Draw to flip the first card.';
  }

  function init() {
    if (!TN.el(SLUG + '-draw')) return;
    reshuffle();
    TN.on(SLUG + '-draw', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        if (idx >= deck.length) {
          TN.el(SLUG + '-card').textContent = 'Deck finished! Press Shuffle Deck to play again.';
          return;
        }
        TN.el(SLUG + '-card').textContent = deck[idx++];
        TN.el(SLUG + '-left').textContent = deck.length - idx;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not draw a card. Please try again.'); }
    });
    TN.on(SLUG + '-shuffle', 'click', function () {
      try { TN.clearErr(SLUG + '-error'); reshuffle(); }
      catch (e) { TN.setErr(SLUG + '-error', 'Could not shuffle. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
