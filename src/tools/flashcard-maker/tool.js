(function () {
  'use strict';
  var ERR = 'flashcard-maker-error';
  var KEY = 'tn_flashcards';
  var deck = [], order = [], pos = 0, flipped = false;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(deck)); } catch (e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) deck = JSON.parse(raw) || [];
    } catch (e) { deck = []; }
  }
  function renderList() {
    TN.el('fc-count').textContent = deck.length;
    TN.el('fc-list').innerHTML = deck.map(function (c, i) {
      return '<div class="checkbox-row" style="justify-content:space-between;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px 12px">' +
        '<span>' + esc(c.front) + ' <span class="muted">→ ' + esc(c.back) + '</span></span>' +
        '<button type="button" class="btn btn-danger btn-sm fc-del" data-i="' + i + '">✕</button></div>';
    }).join('') || '<p class="muted">No cards yet — add your first one above.</p>';
    TN.qsa('#fc-list .fc-del').forEach(function (b) {
      b.addEventListener('click', function () {
        deck.splice(parseInt(b.getAttribute('data-i'), 10), 1);
        save(); renderList();
      });
    });
  }
  function showCard() {
    var c = deck[order[pos]];
    flipped = false;
    TN.el('fc-card').innerHTML = '<div><div class="muted" style="font-size:.85rem;margin-bottom:8px">' + (flipped ? 'BACK' : 'FRONT') + '</div>' + esc(c.front) + '</div>';
    TN.el('fc-pos').textContent = (pos + 1) + ' / ' + order.length;
    var known = deck.filter(function (x) { return x.known; }).length;
    TN.el('fc-known-n').textContent = known;
    TN.el('fc-bar').style.width = (deck.length ? known / deck.length * 100 : 0) + '%';
  }
  function enterStudy() {
    TN.clearErr(ERR);
    if (!deck.length) { TN.setErr(ERR, 'Add at least one card first.'); return; }
    order = deck.map(function (_, i) { return i; });
    pos = 0;
    TN.el('fc-edit').style.display = 'none';
    TN.el('fc-mode').style.display = '';
    showCard();
  }
  try {
    load(); renderList();
    TN.on('fc-add', 'click', function () {
      TN.clearErr(ERR);
      var f = TN.el('fc-front').value.trim(), b = TN.el('fc-back').value.trim();
      if (!f || !b) { TN.setErr(ERR, 'Enter both a front and a back for the card.'); return; }
      deck.push({ front: f, back: b, known: false });
      TN.el('fc-front').value = ''; TN.el('fc-back').value = '';
      save(); renderList();
    });
    TN.on('fc-study', 'click', enterStudy);
    TN.on('fc-exit', 'click', function () {
      TN.el('fc-mode').style.display = 'none';
      TN.el('fc-edit').style.display = '';
    });
    TN.on('fc-card', 'click', function () {
      var c = deck[order[pos]];
      flipped = !flipped;
      TN.el('fc-card').innerHTML = '<div><div class="muted" style="font-size:.85rem;margin-bottom:8px">' + (flipped ? 'BACK' : 'FRONT') + '</div>' + esc(flipped ? c.back : c.front) + '</div>';
    });
    TN.on('fc-prev', 'click', function () { pos = (pos - 1 + order.length) % order.length; showCard(); });
    TN.on('fc-next', 'click', function () { pos = (pos + 1) % order.length; showCard(); });
    TN.on('fc-known', 'click', function () { deck[order[pos]].known = true; save(); pos = (pos + 1) % order.length; showCard(); });
    TN.on('fc-unknown', 'click', function () { deck[order[pos]].known = false; save(); pos = (pos + 1) % order.length; showCard(); });
    TN.on('fc-shuffle', 'click', function () {
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = order[i]; order[i] = order[j]; order[j] = t;
      }
      pos = 0; showCard();
    });
  } catch (e) { /* never throw on load */ }
})();