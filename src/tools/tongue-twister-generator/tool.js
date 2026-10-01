/* Tongue Twister Generator — 40 classics with difficulty + timed challenge. */
(function () {
  'use strict';
  var SLUG = 'tongue-twister-generator';
  var ERR = SLUG + '-error';
  var TW = [
    ["She sells seashells by the seashore.", "Easy"],
    ["Peter Piper picked a peck of pickled peppers.", "Easy"],
    ["How much wood would a woodchuck chuck if a woodchuck could chuck wood?", "Medium"],
    ["Betty Botter bought some butter, but she said the butter's bitter.", "Medium"],
    ["Silly Sally swiftly shooed seven silly sheep.", "Easy"],
    ["Six slippery snails slid slowly seaward.", "Medium"],
    ["Red lorry, yellow lorry.", "Easy"],
    ["Unique New York.", "Easy"],
    ["A proper copper coffee pot.", "Easy"],
    ["Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.", "Easy"],
    ["I scream, you scream, we all scream for ice cream.", "Easy"],
    ["Toy boat, toy boat, toy boat.", "Easy"],
    ["Which witch wished which wicked wish?", "Medium"],
    ["How can a clam cram in a clean cream can?", "Medium"],
    ["I saw Susie sitting in a shoeshine shop.", "Easy"],
    ["Lesser leather never weathered wetter weather better.", "Hard"],
    ["The sixth sick sheikh's sixth sheep's sick.", "Hard"],
    ["Pad kid poured curd pulled cod.", "Hard"],
    ["Brisk brave brigadiers brandished broad bright blades.", "Hard"],
    ["Mixed biscuits, mixed biscuits.", "Easy"],
    ["A big black bug bit a big black bear.", "Easy"],
    ["Fred fed Ted bread, and Ted fed Fred bread.", "Medium"],
    ["Weave will while you wait.", "Medium"],
    ["Three free throws.", "Easy"],
    ["Crisp crusts crackle and crunch.", "Medium"],
    ["Double bubble gum bubbles double.", "Medium"],
    ["Greek grapes, Greek grapes, Greek grapes.", "Easy"],
    ["Yellow yo-yo.", "Easy"],
    ["Knapsack straps.", "Easy"],
    ["Flash message.", "Easy"],
    ["Black back bat.", "Medium"],
    ["Cinnamon, aluminum, linoleum.", "Medium"],
    ["Irish wristwatch.", "Medium"],
    ["Selfish shellfish.", "Medium"],
    ["Thin sticks, thick bricks.", "Medium"],
    ["A skunk sat on a stump and thunk the stump stunk.", "Medium"],
    ["Eleven benevolent elephants.", "Hard"],
    ["Rory the warrior and Roger the worrier were reared wrongly in a rural brewery.", "Hard"],
    ["The seething sea ceaseth and thus the seething sea sufficeth us.", "Hard"],
    ["If Stu chews shoes, should Stu choose the shoes he chews?", "Hard"]
  ];
  var current = -1;
  var chalTimer = null;

  function $(id) { return document.getElementById(id); }

  function pick() {
    var i = Math.floor(Math.random() * TW.length);
    if (TW.length > 1 && i === current) i = (i + 1) % TW.length;
    current = i;
    if (chalTimer) { clearInterval(chalTimer); chalTimer = null; }
    $('tongue-twister-generator-text').textContent = TW[i][0];
    $('tongue-twister-generator-diff').textContent = 'Difficulty: ' + TW[i][1];
    $('tongue-twister-generator-timer').textContent = '';
    TN.clearErr(ERR);
  }

  function challenge() {
    if (current < 0) pick();
    var secs = TW[current][1] === 'Hard' ? 12 : TW[current][1] === 'Medium' ? 9 : 7;
    var left = secs;
    $('tongue-twister-generator-timer').textContent = 'Say it 3× fast! ' + left + 's left…';
    if (chalTimer) clearInterval(chalTimer);
    chalTimer = setInterval(function () {
      left--;
      if (left <= 0) {
        clearInterval(chalTimer); chalTimer = null;
        $('tongue-twister-generator-timer').textContent = "⏰ Time! Did you nail it? Tap “New twister” for another.";
      } else {
        $('tongue-twister-generator-timer').textContent = 'Say it 3× fast! ' + left + 's left…';
      }
    }, 1000);
  }

  try {
    TN.on('tongue-twister-generator-new', 'click', pick);
    TN.on('tongue-twister-generator-challenge', 'click', challenge);
    TN.on('tongue-twister-generator-copy', 'click', function () {
      if (current < 0) { TN.setErr(ERR, 'Generate a twister first.'); return; }
      var t = TW[current][0];
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { TN.clearErr(ERR); }, function () { TN.setErr(ERR, 'Copy failed.'); });
      } else { TN.setErr(ERR, 'Clipboard not available.'); }
    });
  } catch (e) { /* never throw on load */ }
})();
