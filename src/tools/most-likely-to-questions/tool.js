/* Most Likely To Questions — 90-question deck, draw/shuffle, no repeats per deck. */
(function () {
  'use strict';
  var SLUG = 'most-likely-to-questions';

  var QS = [
    'Most likely to become a millionaire?',
    'Most likely to survive on a desert island?',
    'Most likely to fall asleep during a movie?',
    'Most likely to eat dessert before dinner?',
    'Most likely to forget their own birthday?',
    'Most likely to laugh at the wrong moment?',
    'Most likely to cry at a wedding?',
    'Most likely to dance on a table?',
    'Most likely to win a talent show?',
    'Most likely to become famous?',
    'Most likely to write a bestselling book?',
    'Most likely to travel the world?',
    'Most likely to move to another country?',
    'Most likely to learn a new language?',
    'Most likely to skydive?',
    'Most likely to run a marathon?',
    'Most likely to climb a mountain?',
    'Most likely to swim with sharks?',
    'Most likely to adopt ten cats?',
    'Most likely to talk to their plants?',
    'Most likely to name their car?',
    'Most likely to get lost with GPS on?',
    'Most likely to miss their own flight?',
    'Most likely to sleep through an alarm?',
    'Most likely to be late to everything?',
    'Most likely to show up early?',
    'Most likely to plan every detail of a trip?',
    'Most likely to wing the whole trip?',
    'Most likely to pack for a week in a carry-on?',
    'Most likely to overpack for a weekend?',
    'Most likely to cook a five-star meal?',
    'Most likely to burn toast?',
    'Most likely to order takeout every night?',
    'Most likely to become a chef?',
    'Most likely to eat the spiciest food?',
    'Most likely to cry cutting onions?',
    'Most likely to finish everyone\u2019s fries?',
    'Most likely to steal the last slice of pizza?',
    'Most likely to share their food?',
    'Most likely to become a food critic?',
    'Most likely to binge a whole series in one night?',
    'Most likely to spoil the ending?',
    'Most likely to rewatch the same show forever?',
    'Most likely to quote movies constantly?',
    'Most likely to fall asleep during a horror movie?',
    'Most likely to scream in a cinema?',
    'Most likely to become a director?',
    'Most likely to win an argument?',
    'Most likely to admit they were wrong?',
    'Most likely to hold a grudge?',
    'Most likely to forgive instantly?',
    'Most likely to give the best advice?',
    'Most likely to need advice?',
    'Most likely to keep a secret?',
    'Most likely to spill the beans?',
    'Most likely to plan a surprise party?',
    'Most likely to ruin a surprise?',
    'Most likely to remember everyone\u2019s birthday?',
    'Most likely to forget an anniversary?',
    'Most likely to give the best gifts?',
    'Most likely to regift?',
    'Most likely to cry at a sad song?',
    'Most likely to sing in the shower?',
    'Most likely to become a rock star?',
    'Most likely to play an instrument?',
    'Most likely to dance like nobody\u2019s watching?',
    'Most likely to start a dance party?',
    'Most likely to karaoke every song?',
    'Most likely to know all the lyrics?',
    'Most likely to become a teacher?',
    'Most likely to become a doctor?',
    'Most likely to become an astronaut?',
    'Most likely to become president?',
    'Most likely to invent something?',
    'Most likely to start a business?',
    'Most likely to retire early?',
    'Most likely to work on weekends?',
    'Most likely to nap at their desk?',
    'Most likely to reply to emails at 3am?',
    'Most likely to have 100 unread messages?',
    'Most likely to answer every message instantly?',
    'Most likely to leave everyone on read?',
    'Most likely to post every meal online?',
    'Most likely to go viral?',
    'Most likely to delete social media?',
    'Most likely to take 100 selfies?',
    'Most likely to photobomb?',
    'Most likely to laugh at their own jokes?',
    'Most likely to make everyone laugh?',
    'Most likely to cry laughing?',
    'Most likely to trip over nothing?'
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
    deck = shuffled(QS);
    idx = 0;
    TN.el(SLUG + '-left').textContent = deck.length;
    TN.el(SLUG + '-card').textContent = 'Deck shuffled. Press Draw to reveal the first question.';
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
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not draw a question. Please try again.'); }
    });
    TN.on(SLUG + '-shuffle', 'click', function () {
      try { TN.clearErr(SLUG + '-error'); reshuffle(); }
      catch (e) { TN.setErr(SLUG + '-error', 'Could not shuffle. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
