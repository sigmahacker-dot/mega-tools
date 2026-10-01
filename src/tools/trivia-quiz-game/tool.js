/* Trivia Quiz — 50 real questions, 10 random per round. */
(function () {
  'use strict';
  var SLUG = 'trivia-quiz-game';
  var ROUND = 10;
  // [category, question, options[4], correctIndex]
  var BANK = [
    ["Science", "What is the chemical symbol for gold?", ["Go", "Gd", "Au", "Ag"], 2],
    ["Science", "Which planet is known as the Red Planet?", ["Venus", "Mars", "Jupiter", "Mercury"], 1],
    ["Science", "What gas do plants absorb from the atmosphere?", ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], 2],
    ["Science", "How many bones are in the adult human body?", ["186", "206", "226", "256"], 1],
    ["Science", "What is H2O commonly known as?", ["Salt", "Water", "Sugar", "Alcohol"], 1],
    ["Science", "Which force keeps us on the ground?", ["Magnetism", "Friction", "Gravity", "Inertia"], 2],
    ["Science", "What is the hardest natural substance on Earth?", ["Quartz", "Diamond", "Titanium", "Obsidian"], 1],
    ["Science", "Which blood cells carry oxygen?", ["White blood cells", "Platelets", "Plasma cells", "Red blood cells"], 3],
    ["Science", "What is the speed of light (approx.)?", ["300,000 km/s", "150,000 km/s", "30,000 km/s", "3,000 km/s"], 0],
    ["Science", "Which organ produces insulin?", ["Liver", "Kidney", "Pancreas", "Stomach"], 2],
    ["History", "In which year did World War II end?", ["1943", "1944", "1945", "1946"], 2],
    ["History", "Who was the first President of the United States?", ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], 2],
    ["History", "The ancient pyramids of Giza are in which country?", ["Mexico", "Egypt", "Peru", "Sudan"], 1],
    ["History", "Which civilization built the Colosseum?", ["Greeks", "Romans", "Egyptians", "Persians"], 1],
    ["History", "The Titanic sank in which year?", ["1905", "1912", "1918", "1923"], 1],
    ["History", "Who painted the Mona Lisa?", ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], 2],
    ["History", "The Berlin Wall fell in which year?", ["1979", "1985", "1989", "1991"], 2],
    ["History", "Which empire built the Great Wall of China?", ["Mongol", "Roman", "Ottoman", "Chinese (Qin/Ming dynasties)"], 3],
    ["Geography", "What is the largest desert in the world?", ["Sahara", "Gobi", "Antarctic Desert", "Kalahari"], 2],
    ["Geography", "Which is the longest river in the world?", ["Amazon", "Nile", "Yangtze", "Mississippi"], 1],
    ["Geography", "What is the capital of Australia?", ["Sydney", "Melbourne", "Canberra", "Perth"], 2],
    ["Geography", "Mount Everest lies on the border of Nepal and which country?", ["India", "China", "Bhutan", "Pakistan"], 1],
    ["Geography", "Which continent is the smallest by land area?", ["Europe", "Antarctica", "Australia", "South America"], 2],
    ["Geography", "The Eiffel Tower is in which city?", ["London", "Rome", "Paris", "Berlin"], 2],
    ["Geography", "Which country has the largest population?", ["USA", "Indonesia", "India", "China"], 2],
    ["Geography", "The Amazon rainforest is mostly in which country?", ["Peru", "Colombia", "Brazil", "Venezuela"], 2],
    ["Sports", "How many players are on a football (soccer) team on the field?", ["9", "10", "11", "12"], 2],
    ["Sports", "In which sport would you perform a slam dunk?", ["Tennis", "Basketball", "Golf", "Rugby"], 1],
    ["Sports", "How many rings are on the Olympic flag?", ["4", "5", "6", "7"], 1],
    ["Sports", "A marathon is approximately how long?", ["26 miles", "20 miles", "30 miles", "22 miles"], 0],
    ["Sports", "In tennis, a score of zero is called what?", ["Nil", "Duck", "Love", "Blank"], 2],
    ["Sports", "Which country invented table tennis's modern competitive form?", ["China", "Japan", "England", "Sweden"], 2],
    ["Arts", "Who wrote 'Romeo and Juliet'?", ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], 1],
    ["Arts", "Which instrument has 88 keys?", ["Guitar", "Violin", "Piano", "Flute"], 2],
    ["Arts", "The 'Starry Night' was painted by whom?", ["Monet", "Van Gogh", "Dali", "Kahlo"], 1],
    ["Arts", "How many symphonies did Beethoven compose?", ["5", "7", "9", "12"], 2],
    ["Tech", "What does 'CPU' stand for?", ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Utility"], 0],
    ["Tech", "Who co-founded Apple with Steve Jobs?", ["Bill Gates", "Steve Wozniak", "Elon Musk", "Larry Page"], 1],
    ["Tech", "What year was the World Wide Web made public?", ["1985", "1991", "1995", "2000"], 1],
    ["Tech", "Which company created the PlayStation?", ["Nintendo", "Microsoft", "Sony", "Sega"], 2],
    ["Tech", "What does 'HTTP' stand for?", ["HyperText Transfer Protocol", "High Transfer Text Process", "Hyperlink Text Transfer Program", "Home Tool Transfer Protocol"], 0],
    ["General", "How many days are in a leap year?", ["365", "366", "367", "364"], 1],
    ["General", "What is the currency of Japan?", ["Won", "Yuan", "Yen", "Ringgit"], 2],
    ["General", "Which animal is known as the 'King of the Jungle'?", ["Tiger", "Elephant", "Lion", "Gorilla"], 2],
    ["General", "How many colors are in a rainbow?", ["6", "7", "8", "5"], 1],
    ["General", "What is the largest mammal in the world?", ["African elephant", "Blue whale", "Giraffe", "Polar bear"], 1],
    ["General", "Which month has the fewest days?", ["April", "June", "February", "November"], 2],
    ["General", "What do you call a group of wolves?", ["Flock", "Pack", "Herd", "School"], 1],
    ["General", "How many sides does a hexagon have?", ["5", "6", "7", "8"], 1],
    ["General", "Which is the fastest land animal?", ["Lion", "Cheetah", "Greyhound", "Pronghorn"], 1]
  ];
  var round = [], qi = 0, score = 0, best = 0, locked = false;

  function $(id) { return document.getElementById(id); }

  function loadBest() {
    try { best = parseInt(localStorage.getItem('trivia-best') || '0', 10) || 0; } catch (e) { best = 0; }
    $('trivia-quiz-game-best').textContent = best;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function start() {
    round = shuffle(BANK.slice()).slice(0, ROUND);
    qi = 0; score = 0;
    $('trivia-quiz-game-score').textContent = '0';
    $('trivia-quiz-game-done').hidden = true;
    $('trivia-quiz-game-play').hidden = false;
    $('trivia-quiz-game-start').textContent = 'Restart quiz';
    showQ();
  }

  function showQ() {
    locked = false;
    var q = round[qi];
    $('trivia-quiz-game-q').textContent = (qi + 1) + ' / ' + ROUND;
    $('trivia-quiz-game-cat').textContent = q[0];
    $('trivia-quiz-game-text').textContent = q[1];
    $('trivia-quiz-game-feedback').textContent = '';
    var wrap = $('trivia-quiz-game-opts');
    wrap.innerHTML = '';
    // shuffle option order but track correct
    var order = shuffle([0, 1, 2, 3]);
    order.forEach(function (oi) {
      var b = document.createElement('button');
      b.className = 'btn btn-outline';
      b.style.cssText = 'text-align:left;padding:12px';
      b.textContent = q[2][oi];
      b.addEventListener('click', function () { answer(oi, b); });
      wrap.appendChild(b);
    });
  }

  function answer(oi, btn) {
    if (locked) return;
    locked = true;
    var q = round[qi];
    var btns = $('trivia-quiz-game-opts').children;
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      if (btns[i].textContent === q[2][q[3]]) btns[i].style.borderColor = '#2e7d32';
    }
    if (oi === q[3]) {
      score++;
      $('trivia-quiz-game-score').textContent = score;
      btn.style.background = '#e8f5e9';
      $('trivia-quiz-game-feedback').textContent = '✓ Correct!';
    } else {
      btn.style.background = '#ffebee';
      $('trivia-quiz-game-feedback').textContent = '✗ Wrong — the answer was: ' + q[2][q[3]];
    }
    setTimeout(function () {
      qi++;
      if (qi < ROUND) showQ();
      else finish();
    }, 1400);
  }

  function finish() {
    $('trivia-quiz-game-play').hidden = true;
    $('trivia-quiz-game-done').hidden = false;
    $('trivia-quiz-game-final').textContent = 'You scored ' + score + ' / ' + ROUND;
    var v = score === ROUND ? '🏆 Perfect! Trivia master!' : score >= 7 ? '🎉 Great job!' : score >= 4 ? '👍 Not bad — try again!' : '📚 Keep practicing!';
    $('trivia-quiz-game-verdict').textContent = v;
    if (score > best) {
      best = score;
      try { localStorage.setItem('trivia-best', String(best)); } catch (e) {}
      $('trivia-quiz-game-best').textContent = best;
    }
  }

  try {
    loadBest();
    TN.on('trivia-quiz-game-start', 'click', start);
  } catch (e) { /* never throw on load */ }
})();
