/* Lights Out — 5x5, solvable boards via reverse random moves, win detection. */
(function () {
  'use strict';
  var SLUG = 'lights-out-game';
  var N = 5;
  var lights = [], moves = 0, won = false;

  function $(id) { return document.getElementById(id); }

  function toggle(i) {
    var r = Math.floor(i / N), c = i % N;
    lights[i] = !lights[i];
    if (r > 0) lights[i - N] = !lights[i - N];
    if (r < N - 1) lights[i + N] = !lights[i + N];
    if (c > 0) lights[i - 1] = !lights[i - 1];
    if (c < N - 1) lights[i + 1] = !lights[i + 1];
  }

  function render() {
    var b = $('lights-out-game-board');
    b.innerHTML = '';
    lights.forEach(function (on, i) {
      var d = document.createElement('button');
      d.style.cssText = 'width:58px;height:58px;border:none;border-radius:10px;cursor:pointer;' +
        (on ? 'background:radial-gradient(circle at 50% 40%, #fff176, #ffb300);box-shadow:0 0 14px #ffca28'
            : 'background:#263238;box-shadow:inset 0 2px 5px rgba(0,0,0,.5)') +
        ';touch-action:manipulation;padding:0';
      d.setAttribute('aria-label', 'Light ' + (i + 1) + (on ? ' on' : ' off'));
      (function (idx) {
        d.addEventListener('click', function () { press(idx); });
      })(i);
      b.appendChild(d);
    });
    $('lights-out-game-moves').textContent = moves;
  }

  function press(i) {
    if (won) return;
    toggle(i);
    moves++;
    render();
    if (lights.every(function (l) { return !l; })) {
      won = true;
      $('lights-out-game-msg').textContent = '🏆 All lights out in ' + moves + ' moves! Press New game for another.';
    }
  }

  function newGame() {
    lights = new Array(N * N).fill(false);
    moves = 0;
    won = false;
    // apply random presses to the solved (all-off) state => guaranteed solvable
    for (var k = 0; k < 14; k++) toggle(Math.floor(Math.random() * N * N));
    // avoid trivially-solved boards
    if (lights.every(function (l) { return !l; })) toggle(Math.floor(Math.random() * N * N));
    $('lights-out-game-msg').textContent = 'Turn off all the lights!';
    render();
  }

  try {
    TN.on('lights-out-game-new', 'click', newGame);
    newGame();
  } catch (e) { /* never throw on load */ }
})();
