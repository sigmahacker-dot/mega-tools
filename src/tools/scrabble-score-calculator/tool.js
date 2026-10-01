(function () {
  'use strict';
  var P = 'scrabble-score-calculator-';
  function g(id) { return document.getElementById(P + id); }
  var VALUES = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10 };
  var letterMods = [];
  function renderTiles(word) {
    var el = g('tiles'); if (!el) return;
    el.innerHTML = '';
    letterMods = [];
    for (var i = 0; i < word.length; i++) {
      (function (idx) {
        var ch = word[idx];
        letterMods.push(1);
        var d = document.createElement('div');
        d.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px';
        var t = document.createElement('div');
        t.style.cssText = 'width:44px;height:44px;border-radius:6px;background:#eab308;color:#1c1917;font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 2px 4px rgba(0,0,0,.4)';
        t.innerHTML = TN.esc(ch) + '<span style="position:absolute;right:3px;bottom:2px;font-size:10px">' + VALUES[ch] + '</span>';
        var s = document.createElement('select');
        s.className = 'input';
        s.style.cssText = 'width:52px;font-size:11px;padding:2px';
        s.setAttribute('aria-label', 'Letter bonus for ' + ch);
        [['1', '—'], ['2', 'DL'], ['3', 'TL']].forEach(function (o) {
          var op = document.createElement('option');
          op.value = o[0]; op.textContent = o[1];
          s.appendChild(op);
        });
        s.addEventListener('change', function () { letterMods[idx] = parseInt(s.value, 10); });
        d.appendChild(t); d.appendChild(s);
        el.appendChild(d);
      })(i);
    }
  }
  function calc() {
    var inp = g('word');
    var word = inp ? inp.value.trim().toUpperCase() : '';
    if (!/^[A-Z]{1,15}$/.test(word)) { TN.setErr(P + 'error', 'Enter 1–15 letters (A–Z only).'); return; }
    TN.clearErr(P + 'error');
    if (letterMods.length !== word.length) renderTiles(word);
    var wm = g('wordmult'), wmult = wm ? parseInt(wm.value, 10) : 1;
    var bingo = g('bingo') ? g('bingo').checked : false;
    var rows = [], subtotal = 0;
    for (var i = 0; i < word.length; i++) {
      var ch = word[i], base = VALUES[ch], mult = letterMods[i] || 1;
      var pts = base * mult;
      subtotal += pts;
      var tag = mult === 2 ? ' ×2 DL' : (mult === 3 ? ' ×3 TL' : '');
      rows.push('<tr><td style="padding:3px 8px"><b>' + TN.esc(ch) + '</b></td><td style="padding:3px 8px">' + base + tag + '</td><td style="padding:3px 8px;text-align:right">' + pts + '</td></tr>');
    }
    var total = subtotal * wmult, wlabel = '';
    if (wmult > 1) wlabel = ' ×' + wmult + ' word';
    var bingoPts = bingo ? 50 : 0;
    total += bingoPts;
    var res = g('result');
    if (res) {
      res.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:14px"><tbody>' + rows.join('') +
        '</tbody><tfoot>' +
        '<tr><td colspan="2" style="padding:4px 8px;border-top:1px solid #57534e">Subtotal' + wlabel + '</td><td style="padding:4px 8px;text-align:right;border-top:1px solid #57534e">' + (subtotal * wmult) + '</td></tr>' +
        (bingo ? '<tr><td colspan="2" style="padding:4px 8px">Bingo bonus</td><td style="padding:4px 8px;text-align:right">+50</td></tr>' : '') +
        '<tr><td colspan="2" style="padding:6px 8px;font-size:18px;font-weight:800">Total</td><td style="padding:6px 8px;text-align:right;font-size:18px;font-weight:800;color:#4ade80">' + total + '</td></tr>' +
        '</tfoot></table>';
      res.classList.remove('hidden');
    }
  }
  try {
    if (!g('word')) return;
    var deb = TN.debounce(function () {
      var inp = g('word');
      var w = inp ? inp.value.trim().toUpperCase().replace(/[^A-Z]/g, '') : '';
      if (/^[A-Z]{1,15}$/.test(w)) renderTiles(w);
    }, 350);
    TN.on(P + 'word', 'input', deb);
    TN.on(P + 'calc', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
