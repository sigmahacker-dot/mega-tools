/* Schema Markup Generator — Article/LocalBusiness/Product/FAQ → JSON-LD. */
(function () {
  'use strict';

  var SLUG = 'schema-markup-generator';
  var lastJson = '';

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function buildArticle() {
    var o = { '@context': 'https://schema.org', '@type': 'Article' };
    if (v('a-title')) o.headline = v('a-title');
    if (v('a-author')) o.author = { '@type': 'Person', name: v('a-author') };
    if (v('a-date')) o.datePublished = v('a-date');
    if (v('a-img')) o.image = v('a-img');
    if (v('a-url')) o.url = v('a-url');
    if (v('a-desc')) o.description = v('a-desc');
    return o;
  }

  function buildLocal() {
    var o = { '@context': 'https://schema.org', '@type': 'LocalBusiness' };
    if (v('l-name')) o.name = v('l-name');
    if (v('l-phone')) o.telephone = v('l-phone');
    var addr = {};
    if (v('l-street')) addr.streetAddress = v('l-street');
    if (v('l-city')) addr.addressLocality = v('l-city');
    if (v('l-region')) addr.addressRegion = v('l-region');
    if (v('l-postal')) addr.postalCode = v('l-postal');
    if (Object.keys(addr).length) { addr['@type'] = 'PostalAddress'; o.address = addr; }
    if (v('l-hours')) o.openingHours = v('l-hours');
    if (v('l-url')) o.url = v('l-url');
    return o;
  }

  function buildProduct() {
    var o = { '@context': 'https://schema.org', '@type': 'Product' };
    if (v('p-name')) o.name = v('p-name');
    if (v('p-brand')) o.brand = { '@type': 'Brand', name: v('p-brand') };
    if (v('p-desc')) o.description = v('p-desc');
    if (v('p-img')) o.image = v('p-img');
    if (v('p-price')) {
      o.offers = {
        '@type': 'Offer',
        price: parseFloat(v('p-price')),
        priceCurrency: v('p-cur') || 'USD',
        availability: 'https://schema.org/InStock'
      };
    }
    var rating = parseFloat(v('p-rating'));
    var count = parseInt(v('p-count'), 10);
    if (!isNaN(rating) && !isNaN(count)) {
      o.aggregateRating = { '@type': 'AggregateRating', ratingValue: rating, reviewCount: count };
    }
    return o;
  }

  function buildFaq() {
    var pairs = v('f-pairs').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var entities = [];
    pairs.forEach(function (p) {
      var parts = p.split('|');
      if (parts.length < 2) return;
      entities.push({
        '@type': 'Question',
        name: parts[0].trim(),
        acceptedAnswer: { '@type': 'Answer', text: parts.slice(1).join('|').trim() }
      });
    });
    return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities };
  }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var type = TN.el(SLUG + '-type').value;
    var obj;
    if (type === 'article') obj = buildArticle();
    else if (type === 'local') obj = buildLocal();
    else if (type === 'product') obj = buildProduct();
    else obj = buildFaq();
    if (Object.keys(obj).length <= 2) {
      TN.setErr(SLUG + '-error', 'Fill in at least one field first.');
      return;
    }
    if (type === 'faq' && !obj.mainEntity.length) {
      TN.setErr(SLUG + '-error', 'Add at least one "question | answer" pair.');
      return;
    }
    lastJson = JSON.stringify(obj, null, 2);
    TN.el(SLUG + '-out').textContent = lastJson;
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.el(SLUG + '-type').addEventListener('change', function () {
        var t = this.value;
        ['article', 'local', 'product', 'faq'].forEach(function (k) {
          TN.el(SLUG + '-f-' + k).classList.toggle('hidden', k !== t);
        });
      });
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.copy(lastJson).catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
      TN.on(SLUG + '-dl', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.downloadText(lastJson, 'schema.json', 'application/ld+json');
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();