/* Review Schema Generator — review inputs → Review JSON-LD. */
(function () {
  'use strict';

  var SLUG = 'review-schema-generator';
  var lastJson = '';

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var rating = parseFloat(v('rating'));
    if (!v('item')) { TN.setErr(SLUG + '-error', 'Enter the item name.'); return; }
    if (isNaN(rating) || rating < 1 || rating > 5) { TN.setErr(SLUG + '-error', 'Rating must be between 1 and 5.'); return; }
    var review = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: { '@type': TN.el(SLUG + '-type').value, name: v('item') },
      reviewRating: { '@type': 'Rating', ratingValue: rating, bestRating: 5 }
    };
    if (v('author')) review.author = { '@type': 'Person', name: v('author') };
    if (v('date')) review.datePublished = v('date');
    if (v('title')) review.name = v('title');
    if (v('body')) review.reviewBody = v('body');
    lastJson = JSON.stringify(review, null, 2);
    TN.el(SLUG + '-out').textContent = lastJson;
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.copy(lastJson).catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
      TN.on(SLUG + '-dl', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.downloadText(lastJson, 'review-schema.json', 'application/ld+json');
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();