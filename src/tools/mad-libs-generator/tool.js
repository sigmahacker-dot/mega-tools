/* Mad Libs Generator — 5 story templates, blank filling, story output. */
(function () {
  'use strict';
  var SLUG = 'mad-libs-generator';
  var ERR = SLUG + '-error';
  // {0} placeholders replaced by blanks in order
  var STORIES = [
    {
      title: '🚀 Space Adventure',
      blanks: ['adjective', 'planet name', 'noun (plural)', 'verb (past tense)', 'adjective', 'food', 'number', 'silly sound'],
      text: 'Captain Zara and her {0} crew landed on planet {1}. Giant {2} {3} toward the ship! "Stay {4}!" she shouted, throwing {5} at them. After {6} hours of chaos, the aliens left making a "{7}" sound. Best. Mission. Ever.'
    },
    {
      title: '🏚️ Haunted House',
      blanks: ['adjective', 'noun', 'verb (past tense)', 'adjective', 'noun (plural)', 'exclamation', 'adjective', 'room of the house'],
      text: 'On a {0} night, we entered the old {1} and {2} up the stairs. A {3} portrait of {4} hung on the wall. "{5}!" screamed my friend. We ran into the {6} {7} and hid until sunrise.'
    },
    {
      title: '🍳 Cooking Disaster',
      blanks: ['adjective', 'food', 'verb', 'adjective', 'noun', 'number', 'adjective', 'animal'],
      text: 'Chef Marco tried to make {0} {1}. "Just {2} it!" he said. The {3} {4} exploded after {5} minutes. The kitchen smelled {6}, and a confused {7} walked in to investigate. Dinner was cancelled.'
    },
    {
      title: '⚽ Championship Final',
      blanks: ['adjective', 'team name', 'verb (past tense)', 'number', 'adjective', 'noun', 'exclamation', 'celebrity'],
      text: 'It was a {0} final between {1} and their rivals. In the {3}rd minute, the striker {2} the ball into the {4} {5}. "{6}!" roared the crowd. Even {7} was spotted doing a victory dance in the stands.'
    },
    {
      title: '🏴‍☠️ Pirate Voyage',
      blanks: ['adjective', 'noun', 'verb (past tense)', 'treasure', 'adjective', 'sea creature', 'exclamation', 'number'],
      text: 'Captain Redbeard sailed the {0} {1} and {2} a map to {3}. "A {4} {5} guards it!" warned the parrot. "{6}!" cried the crew. They dug for {7} days and found… a single rubber duck. Arrr, still counts!'
    }
  ];
  var storyText = '';

  function $(id) { return document.getElementById(id); }

  function buildFields() {
    var i = parseInt($('mad-libs-generator-story').value, 10) || 0;
    var wrap = $('mad-libs-generator-fields');
    wrap.innerHTML = '';
    STORIES[i].blanks.forEach(function (b, n) {
      var d = document.createElement('div');
      d.className = 'field';
      var lab = document.createElement('label');
      lab.setAttribute('for', SLUG + '-b' + n);
      lab.textContent = (n + 1) + '. ' + b;
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'input';
      inp.id = SLUG + '-b' + n;
      inp.placeholder = b;
      inp.maxLength = 40;
      d.appendChild(lab);
      d.appendChild(inp);
      wrap.appendChild(d);
    });
    $('mad-libs-generator-result').hidden = true;
    $('mad-libs-generator-copy').disabled = true;
    TN.clearErr(ERR);
  }

  function generate() {
    var i = parseInt($('mad-libs-generator-story').value, 10) || 0;
    var st = STORIES[i];
    var words = [];
    for (var n = 0; n < st.blanks.length; n++) {
      var v = ($('mad-libs-generator-b' + n) || {}).value || '';
      v = v.trim();
      if (!v) { TN.setErr(ERR, 'Fill in blank #' + (n + 1) + ' (' + st.blanks[n] + ').'); return; }
      words.push(v);
    }
    TN.clearErr(ERR);
    storyText = st.text.replace(/\{(\d+)\}/g, function (m, k) { return words[parseInt(k, 10)]; });
    $('mad-libs-generator-title').textContent = st.title;
    $('mad-libs-generator-out').textContent = storyText;
    $('mad-libs-generator-result').hidden = false;
    $('mad-libs-generator-copy').disabled = false;
  }

  try {
    TN.on('mad-libs-generator-story', 'change', buildFields);
    TN.on('mad-libs-generator-go', 'click', generate);
    TN.on('mad-libs-generator-copy', 'click', function () {
      if (!storyText) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(storyText).then(function () { TN.clearErr(ERR); }, function () { TN.setErr(ERR, 'Copy failed.'); });
      } else { TN.setErr(ERR, 'Clipboard not available.'); }
    });
    buildFields();
  } catch (e) { /* never throw on load */ }
})();
