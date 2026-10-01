/* Quiz Maker — author MCQs, then take the quiz with scoring. */
(function () {
  'use strict';

  var SLUG = 'quiz-maker';
  var KEY = 'tn-' + SLUG + '-questions';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(qs) {
    try { localStorage.setItem(KEY, JSON.stringify(qs)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function renderAuthor() {
    var qs = load();
    var box = TN.el(SLUG + '-qlist');
    if (!qs.length) { box.innerHTML = '<p class="muted">No questions yet.</p>'; return; }
    box.innerHTML = qs.map(function (q, i) {
      return '<div class="tool-card" style="margin:8px 0"><strong>' + (i + 1) + '. ' + TN.esc(q.q) + '</strong>' +
        '<ol type="A" style="margin:4px 0"><li>' + q.opts.map(TN.esc).join('</li><li>') + '</li></ol>' +
        '<p class="muted" style="margin:0">Correct: ' + 'ABCD'[q.correct] + '</p>' +
        '<button class="btn btn-sm btn-outline" data-del="' + i + '" style="margin-top:6px">Delete</button></div>';
    }).join('');
    var dels = box.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          var qs2 = load();
          qs2.splice(parseInt(b.getAttribute('data-del'), 10), 1);
          persist(qs2); renderAuthor();
        });
      })(dels[i]);
    }
  }

  function addQuestion() {
    TN.clearErr(SLUG + '-error');
    var q = TN.el(SLUG + '-q').value.trim();
    var opts = [TN.el(SLUG + '-o1').value.trim(), TN.el(SLUG + '-o2').value.trim(),
                TN.el(SLUG + '-o3').value.trim(), TN.el(SLUG + '-o4').value.trim()];
    var correct = parseInt(TN.el(SLUG + '-correct').value, 10);
    if (!q) { TN.setErr(SLUG + '-error', 'Enter the question text.'); return; }
    if (opts.some(function (o) { return !o; })) { TN.setErr(SLUG + '-error', 'Fill in all four options.'); return; }
    var qs = load();
    qs.push({ q: q, opts: opts, correct: correct });
    persist(qs);
    ['q', 'o1', 'o2', 'o3', 'o4'].forEach(function (k) { TN.el(SLUG + '-' + k).value = ''; });
    renderAuthor();
  }

  function renderTake() {
    var qs = load();
    var box = TN.el(SLUG + '-take');
    TN.el(SLUG + '-result').innerHTML = '';
    if (!qs.length) { box.innerHTML = '<p class="muted">Author some questions first.</p>'; return; }
    // shuffle question order
    var order = qs.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = order[i]; order[i] = order[j]; order[j] = t;
    }
    box.innerHTML = order.map(function (qi, n) {
      var q = qs[qi];
      return '<div class="tool-card" style="margin:8px 0" data-qidx="' + qi + '">' +
        '<strong>' + (n + 1) + '. ' + TN.esc(q.q) + '</strong>' +
        q.opts.map(function (o, oi) {
          return '<label class="checkline"><input type="radio" name="' + SLUG + '-ans-' + n + '" value="' + oi + '"> ' + TN.esc(o) + '</label>';
        }).join('') + '</div>';
    }).join('');
  }

  function submit() {
    TN.clearErr(SLUG + '-error');
    var qs = load();
    var cards = TN.el(SLUG + '-take').querySelectorAll('[data-qidx]');
    if (!cards.length) { TN.setErr(SLUG + '-error', 'No questions to answer.'); return; }
    var correct = 0, review = '';
    for (var n = 0; n < cards.length; n++) {
      var qi = parseInt(cards[n].getAttribute('data-qidx'), 10);
      var q = qs[qi];
      var sel = cards[n].querySelector('input[name="' + SLUG + '-ans-' + n + '"]:checked');
      var got = sel ? parseInt(sel.value, 10) : -1;
      var ok = got === q.correct;
      if (ok) correct++;
      review += '<p style="margin:6px 0">' + (ok ? '✅' : '❌') + ' <strong>' + TN.esc(q.q) + '</strong><br>' +
        '<span class="muted">Your answer: ' + (got >= 0 ? TN.esc(q.opts[got]) : 'none') +
        ' | Correct: ' + TN.esc(q.opts[q.correct]) + '</span></p>';
    }
    var pct = Math.round(correct / cards.length * 100);
    TN.el(SLUG + '-result').innerHTML =
      '<p><strong>Score: ' + correct + '/' + cards.length + ' (' + pct + '%)</strong></p>' + review;
  }

  function switchTab(take) {
    TN.el(SLUG + '-author-pane').classList.toggle('hidden', take);
    TN.el(SLUG + '-take-pane').classList.toggle('hidden', !take);
    TN.el(SLUG + '-tab-author').classList.toggle('btn-outline', take);
    TN.el(SLUG + '-tab-take').classList.toggle('btn-outline', !take);
    if (take) renderTake();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', addQuestion);
      TN.on(SLUG + '-submit', 'click', submit);
      TN.on(SLUG + '-retry', 'click', renderTake);
      TN.on(SLUG + '-tab-author', 'click', function () { switchTab(false); });
      TN.on(SLUG + '-tab-take', 'click', function () { switchTab(true); });
      TN.on(SLUG + '-clear', 'click', function () {
        if (!window.confirm('Delete all questions?')) return;
        persist([]); renderAuthor();
      });
      renderAuthor();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();