(function () {
  'use strict';
  var ERR = 'gift-list-tracker-error';
  var KEY = 'tn_gifts';
  var gifts = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(gifts)); } catch (e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) gifts = JSON.parse(raw) || [];
    } catch (e) { gifts = []; }
  }
  function render() {
    var tb = 0, tc = 0, bought = 0;
    gifts.forEach(function (g) {
      tb += g.budget || 0; tc += g.cost || 0;
      if (g.done) bought++;
    });
    TN.el('gift-tbudget').textContent = money(tb);
    TN.el('gift-tcost').textContent = money(tc);
    var left = tb - tc;
    TN.el('gift-left').textContent = money(left);
    TN.el('gift-left').style.color = left < 0 ? '#f87171' : '';
    TN.el('gift-bought').textContent = bought + '/' + gifts.length;
    TN.el('gift-body').innerHTML = gifts.map(function (g, i) {
      return '<tr><td><strong>' + esc(g.for) + '</strong></td><td>' + esc(g.idea) + '</td>' +
        '<td>' + money(g.budget || 0) + '</td><td>' + (g.cost ? money(g.cost) : '<span class="muted">—</span>') + '</td>' +
        '<td><input type="checkbox" class="gift-done" data-i="' + i + '"' + (g.done ? ' checked' : '') + ' style="width:18px;height:18px"></td>' +
        '<td style="text-align:right"><button type="button" class="btn btn-danger btn-sm gift-del" data-i="' + i + '">✕</button></td></tr>';
    }).join('') || '<tr><td colspan="6" class="muted">No gifts yet — add your first one above.</td></tr>';
    TN.qsa('#gift-body .gift-done').forEach(function (cb) {
      cb.addEventListener('change', function () {
        gifts[parseInt(cb.getAttribute('data-i'), 10)].done = cb.checked;
        save(); render();
      });
    });
    TN.qsa('#gift-body .gift-del').forEach(function (b) {
      b.addEventListener('click', function () {
        gifts.splice(parseInt(b.getAttribute('data-i'), 10), 1);
        save(); render();
      });
    });
  }
  try {
    load(); render();
    TN.on('gift-add', 'click', function () {
      TN.clearErr(ERR);
      var f = TN.el('gift-for').value.trim(), idea = TN.el('gift-idea').value.trim();
      if (!f || !idea) { TN.setErr(ERR, 'Enter a recipient and a gift idea.'); return; }
      gifts.push({
        for: f, idea: idea,
        budget: parseFloat(TN.el('gift-budget').value) || 0,
        cost: parseFloat(TN.el('gift-cost').value) || 0,
        done: false
      });
      TN.el('gift-for').value = ''; TN.el('gift-idea').value = '';
      TN.el('gift-budget').value = ''; TN.el('gift-cost').value = '';
      save(); render();
    });
  } catch (e) { /* never throw on load */ }
})();