/* Story Dice Roller — 9 dice × 6 faces, story prompt, single-die reroll. */
(function () {
  'use strict';
  var SLUG = 'story-dice-roller';
  var DICE = [
    ['🚀', '🏰', '🌊', '🏔️', '🏜️', '🌋'],
    ['🐉', '🦄', '👽', '🧙', '🧛', '🧜'],
    ['🗝️', '💎', '📜', '🗺️', '🔮', '⚔️'],
    ['🌈', '⚡', '❄️', '🔥', '🌪️', '🌙'],
    ['🎭', '🎪', '🎸', '📚', '🎨', '🎬'],
    ['🍎', '🍕', '🍦', '☕', '🍩', '🌮'],
    ['🚗', '✈️', '🚂', '⛵', '🚁', '🛸'],
    ['🐱', '🐶', '🦁', '🐸', '🦋', '🐙'],
    ['⏰', '💡', '🎁', '📱', '🔑', '🧲']
  ];
  var NAMES = {
    '🚀': 'a rocket', '🏰': 'a castle', '🌊': 'the ocean', '🏔️': 'a mountain', '🏜️': 'a desert', '🌋': 'a volcano',
    '🐉': 'a dragon', '🦄': 'a unicorn', '👽': 'an alien', '🧙': 'a wizard', '🧛': 'a vampire', '🧜': 'a mermaid',
    '🗝️': 'a key', '💎': 'a diamond', '📜': 'a scroll', '🗺️': 'a map', '🔮': 'a crystal ball', '⚔️': 'a sword',
    '🌈': 'a rainbow', '⚡': 'lightning', '❄️': 'snow', '🔥': 'fire', '🌪️': 'a tornado', '🌙': 'the moon',
    '🎭': 'a theater', '🎪': 'a circus', '🎸': 'a guitar', '📚': 'books', '🎨': 'art', '🎬': 'a movie',
    '🍎': 'an apple', '🍕': 'pizza', '🍦': 'ice cream', '☕': 'coffee', '🍩': 'a donut', '🌮': 'a taco',
    '🚗': 'a car', '✈️': 'a plane', '🚂': 'a train', '⛵': 'a sailboat', '🚁': 'a helicopter', '🛸': 'a UFO',
    '🐱': 'a cat', '🐶': 'a dog', '🦁': 'a lion', '🐸': 'a frog', '🦋': 'a butterfly', '🐙': 'an octopus',
    '⏰': 'a clock', '💡': 'an idea', '🎁': 'a gift', '📱': 'a phone', '🔑': 'a key', '🧲': 'a magnet'
  };
  var current = []; // 9 symbols

  function $(id) { return document.getElementById(id); }

  function rollDie(i) {
    return DICE[i][Math.floor(Math.random() * 6)];
  }

  function render() {
    var board = $('story-dice-roller-board');
    board.innerHTML = '';
    current.forEach(function (sym, i) {
      var b = document.createElement('button');
      b.textContent = sym;
      b.title = 'Re-roll this die';
      b.style.cssText = 'aspect-ratio:1;font-size:44px;background:#fff;border:2px solid #ddd;border-radius:14px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.08)';
      (function (idx) {
        b.addEventListener('click', function () {
          current[idx] = rollDie(idx);
          render();
        });
      })(i);
      board.appendChild(b);
    });
    var words = current.map(function (s) { return NAMES[s] || s; });
    var prompt = 'Tell a story featuring ' + words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1] + '.';
    $('story-dice-roller-prompt').textContent = '📖 ' + prompt;
    $('story-dice-roller-copy').disabled = false;
  }

  function rollAll() {
    current = [];
    for (var i = 0; i < 9; i++) current.push(rollDie(i));
    // little shake animation
    var board = $('story-dice-roller-board');
    board.style.transform = 'rotate(-2deg)';
    setTimeout(function () { board.style.transform = 'rotate(2deg)'; }, 90);
    setTimeout(function () { board.style.transform = 'rotate(0deg)'; }, 180);
    render();
  }

  try {
    TN.on('story-dice-roller-roll', 'click', rollAll);
    TN.on('story-dice-roller-copy', 'click', function () {
      var t = $('story-dice-roller-prompt').textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(current.join(' ') + '\n' + t).then(function () {}, function () {});
      }
    });
    rollAll();
  } catch (e) { /* never throw on load */ }
})();
