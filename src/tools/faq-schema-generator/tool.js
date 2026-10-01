/* FAQ Schema Generator — Q&A pairs → FAQPage JSON-LD. */
(function () {
  'use strict';

  var SLUG = 'faq-schema-generator';
  var pairs = [];
  var lastJson = '';

  function renderPairs() {
    var box = TN.el(SLUG + '-pairs');
    if (!pairs.length) { box.innerHTML = '<p class="muted">No Q&A pairs yet.</p>'; return; }
    box.innerHTML = pairs.map(function (p, i) {
      return '<div class="tool-card" style="margin:6px 0"><strong>Q: ' + TN.esc(p.q) + '</strong>' +
        '<p class="muted" style="margin:4px 0">A: ' + TN.esc(p.a) + '</p>' +
        '<button class="btn btn-sm btn-outline" data-del="' + i + '">Remove</button></div>';
    }).join('');
    var dels = box.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          pairs.splice(parseInt(b.getAttribute('data-del'), 10), 1);
          renderPairs();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var q = TN.el(SLUG + '-q').value.trim();
    var a = TN.el(SLUG + '-a').value.trim();
    if (!q) { TN.setErr(SLUG + '-error', 'Enter a question.'); return; }
    if (!a) { TN.setErr(SLUG + '-error', 'Enter the answer.'); return; }
    pairs.push({ q: q, a: a });
    TN.el(SLUG + '-q').value = '';
    TN.el(SLUG + '-a').value = '';
    renderPairs();
  }

  function generate() {
    TN.clearErr(SLUG + '-error');
    if (!pairs.length) { TN.setErr(SLUG + '-error', 'Add at least one Q&A pair first.'); return; }
    var obj = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pairs.map(function (p) {
        return {
          '@type': 'Question',
          name: p.q,
          acceptedAnswer: { '@type': 'Answer', text: p.a }
        };
      })
    };
    lastJson = JSON.stringify(obj, null, 2);
    TN.el(SLUG + '-out').textContent = lastJson;
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-clear', 'click', function () { pairs = []; renderPairs(); });
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.copy(lastJson).catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
      TN.on(SLUG + '-dl', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.downloadText(lastJson, 'faq-schema.json', 'application/ld+json');
      });
      renderPairs();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();