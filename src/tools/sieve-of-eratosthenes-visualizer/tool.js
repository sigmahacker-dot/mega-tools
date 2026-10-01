/* Animated Sieve of Eratosthenes grid. */
(function () {
  'use strict';
  var SLUG = 'sieve-of-eratosthenes-visualizer';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  var N = 100, state = [], primes = [], pIdx = 0, timer = null, cols = 10;
  function cell(i) { return $(SLUG + '-cell-' + i); }
  function build() {
    stop();
    N = parseInt($(SLUG + '-n').value, 10);
    if (isNaN(N) || N < 10 || N > 400) { err('N must be between 10 and 400.'); return; }
    TN.clearErr(SLUG + '-error');
    state = new Array(N + 1).fill(true);
    state[0] = state[1] = false;
    primes = []; pIdx = 0;
    cols = Math.ceil(Math.sqrt(N + 1));
    var g = $(SLUG + '-grid');
    g.innerHTML = '';
    g.style.gridTemplateColumns = 'repeat(' + cols + ', 30px)';
    for (var i = 0; i <= N; i++) {
      (function (v) {
        var d = document.createElement('div');
        d.id = SLUG + '-cell-' + v;
        d.textContent = v;
        d.style.cssText = 'width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:11px;font-family:monospace;border-radius:5px;background:#f5f5f5;border:1px solid #e0e0e0';
        g.appendChild(d);
      })(i);
    }
    paintCell(0, '#e0e0e0'); paintCell(1, '#e0e0e0');
    $(SLUG + '-msg').textContent = 'Grid ready. Press Run (or Step) to sift.';
    $(SLUG + '-primes').textContent = '';
  }
  function paintCell(i, bg, fg) {
    var c = cell(i);
    if (!c) return;
    c.style.background = bg;
    if (fg) c.style.color = fg;
  }
  function doStep() {
    while (pIdx * pIdx <= N && !state[pIdx]) pIdx++;
    var p = pIdx;
    if (p * p > N) { finish(); return false; }
    primes.push(p);
    paintCell(p, '#2e7d32', '#fff');
    $(SLUG + '-msg').textContent = 'Prime found: ' + p + ' \u2014 striking its multiples.';
    for (var m = p * p; m <= N; m += p) {
      if (state[m]) { state[m] = false; paintCell(m, '#ffcdd2', '#b71c1c'); }
    }
    pIdx++;
    return true;
  }
  function finish() {
    stop();
    var out = [];
    for (var i = 2; i <= N; i++) if (state[i]) { out.push(i); paintCell(i, '#2e7d32', '#fff'); }
    $(SLUG + '-msg').textContent = 'Done \u2014 ' + out.length + ' primes up to ' + N + '.';
    $(SLUG + '-primes').textContent = 'Primes: ' + out.join(', ');
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function play() {
    build();
    stop();
    var speed = parseInt($(SLUG + '-speed').value, 10);
    timer = setInterval(function () { if (!doStep()) stop(); }, speed);
  }
  try {
    TN.on(SLUG + '-play', 'click', play);
    TN.on(SLUG + '-step', 'click', function () { if (!cell(2)) build(); stop(); doStep(); });
    TN.on(SLUG + '-n', 'change', build);
    build();
  } catch (e) {}
})();