(function () {
  'use strict';
  var ERR = 'raffle-picker-error';
  var winners = [], revealed = 0, timer = null;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function render(showUpTo) {
    var html = '';
    for (var i = 0; i < winners.length; i++) {
      if (i < showUpTo) html += '<div class="stat-card" style="margin-bottom:8px"><div class="v">🏆 ' + esc(winners[i]) + '</div><div class="l">Winner ' + (i + 1) + '</div></div>';
      else html += '<div class="stat-card" style="margin-bottom:8px;opacity:.45"><div class="v">???</div><div class="l">Winner ' + (i + 1) + ' — hidden</div></div>';
    }
    TN.el('raffle-winners').innerHTML = html || '<p class="muted">Press Draw winners.</p>';
  }
  function draw() {
    TN.clearErr(ERR);
    if (timer) { clearInterval(timer); timer = null; }
    var ns = TN.el('raffle-names').value.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
    if (!ns.length) { TN.setErr(ERR, 'Enter at least one entry.'); return; }
    var count = Math.min(ns.length, Math.max(1, parseInt(TN.el('raffle-count').value, 10) || 1));
    winners = shuffle(ns.slice()).slice(0, count);
    revealed = winners.length;
    TN.el('raffle-entries').textContent = ns.length;
    TN.el('raffle-winners-n').textContent = winners.length;
    render(revealed);
  }
  function reveal() {
    TN.clearErr(ERR);
    if (timer) { clearInterval(timer); timer = null; }
    var ns = TN.el('raffle-names').value.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
    if (!ns.length) { TN.setErr(ERR, 'Enter at least one entry.'); return; }
    if (!winners.length || revealed >= winners.length) {
      var count = Math.min(ns.length, Math.max(1, parseInt(TN.el('raffle-count').value, 10) || 1));
      winners = shuffle(ns.slice()).slice(0, count);
      revealed = 0;
      TN.el('raffle-entries').textContent = ns.length;
      TN.el('raffle-winners-n').textContent = winners.length;
    }
    render(revealed);
    timer = setInterval(function () {
      revealed++;
      render(revealed);
      if (revealed >= winners.length) { clearInterval(timer); timer = null; }
    }, 900);
  }
  try {
    TN.on('raffle-go', 'click', draw);
    TN.on('raffle-reveal', 'click', reveal);
    TN.on('raffle-dl', 'click', function () {
      if (!winners.length) { TN.setErr(ERR, 'Draw winners first.'); return; }
      TN.clearErr(ERR);
      var txt = 'RAFFLE RESULTS\n\n' + winners.map(function (w, i) { return (i + 1) + '. ' + w; }).join('\n');
      var b = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'raffle-winners.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
    TN.el('raffle-winners').innerHTML = '<p class="muted">Press Draw winners.</p>';
  } catch (e) { /* never throw on load */ }
})();