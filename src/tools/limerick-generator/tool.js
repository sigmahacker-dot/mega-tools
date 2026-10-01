/* Limerick Generator — AABBA five-liners from rhyming word banks. */
(function () {
  'use strict';
  var SLUG = 'limerick-generator';
  // A-rhyme pairs (lines 1, 2, 5) and B-rhyme pairs (lines 3, 4)
  var PAIRS_A = [
    ['Nantucket', 'bucket'], ['Spain', 'rain'], ['Dover', 'clover'], ['Peru', 'stew'],
    ['Japan', 'pan'], ['Rome', 'home'], ['Kent', 'tent'], ['Leeds', 'beads'],
    ['Norway', 'hay'], ['Chile', 'freely'], ['Quebec', 'check'], ['Milan', 'plan']
  ];
  var PAIRS_B = [
    ['blue', 'true'], ['sad', 'glad'], ['small', 'tall'], ['proud', 'loud'],
    ['neat', 'sweet'], ['quick', 'slick'], ['bright', 'light'], ['fair', 'square']
  ];
  var PEOPLE = ['a young chef', 'an old sailor', 'a brave knight', 'a shy poet', 'a keen gardener',
                'a bold pilot', 'a wise teacher', 'a merry baker', 'a tired traveler', 'a curious child'];
  var ACTIONS_A = ['danced a jig with a', 'went to sea in a', 'baked a cake in a', 'built a boat from a',
                   'sang a song to a', 'played chess with a', 'rode a horse past a', 'wrote a book about a'];
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var a = pick(PAIRS_A), b = pick(PAIRS_B);
    var person = pick(PEOPLE);
    var l1 = 'There once was ' + person + ' from ' + a[0] + ',';
    var l2 = 'Who ' + pick(ACTIONS_A) + ' ' + a[1] + ';';
    var l3 = 'But then one morning, feeling ' + b[0] + ',';
    var l4 = 'They cheered up fast and stood up ' + b[1] + ';';
    var l5 = 'So much for that trip to ' + a[0] + ' with the ' + a[1] + '!';
    TN.el(SLUG + '-output').textContent = [l1, l2, l3, l4, l5].join('\n');
  }

  try {
    TN.on(SLUG + '-run', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
