/* Facebook Ad Copy Generator — primary text + headline + CTA combos. */
(function () {
  'use strict';

  var SLUG = 'facebook-ad-copy-generator';

  var CTAS = ['Shop Now', 'Learn More', 'Sign Up', 'Get Offer', 'Order Now'];

  var TONES = {
    conversational: {
      primary: [
        'Hey {aud}! 👋 Tired of the same old {product}? We made something you\'ll actually love. {offer} — grab yours today!',
        'Real talk: finding good {product} is hard. So we made it easy for {aud}. {offer} 🎉',
        'PSA for {aud}: your new favorite {product} just dropped. {offer} — you\'re welcome. 😄'
      ],
      headline: ['{Product} You\'ll Love', '{Offer} — Limited Time', 'Made For {Aud}']
    },
    urgent: {
      primary: [
        '⏰ LAST CHANCE, {aud}! {offer} on our best-selling {product} ends soon. Don\'t miss out!',
        'Selling fast! {aud} are grabbing our {product} — {offer}. Once it\'s gone, it\'s gone! 🔥',
        '⚠️ Final hours: {offer} on {product}. {aud}, this is your sign to act now!'
      ],
      headline: ['Ends Soon: {Offer}', 'Limited {Product} Stock', 'Act Now — {Offer}']
    },
    premium: {
      primary: [
        'For {aud} who accept only the finest: our {product}, crafted to perfection. {offer} — experience the difference. ✨',
        'Elevate your everyday with {product}. Designed for discerning {aud}. {offer}.',
        'Luxury isn\'t a price — it\'s a standard. Discover our {product}. {offer} for a limited time.'
      ],
      headline: ['Premium {Product}', '{Offer} — Exclusive', 'The Finest {Product}']
    }
  };

  function fill(s, map) {
    return s.replace(/\{product\}/gi, function (m) { return m === '{Product}' ? map.Product : map.product; })
      .replace(/\{aud\}/gi, function (m) { return m === '{Aud}' ? map.Aud : map.aud; })
      .replace(/\{offer\}/gi, function (m) { return m === '{Offer}' ? map.Offer : map.offer; });
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var product = TN.el(SLUG + '-product').value.trim();
    var aud = TN.el(SLUG + '-aud').value.trim();
    var offer = TN.el(SLUG + '-offer').value.trim();
    var tone = TN.el(SLUG + '-tone').value;
    if (!product) { TN.setErr(SLUG + '-error', 'Enter your product or service.'); return; }
    if (!aud) { TN.setErr(SLUG + '-error', 'Enter your target audience.'); return; }

    var map = { product: product, Product: cap(product), aud: aud, Aud: cap(aud), offer: offer || 'Special offer inside', Offer: offer ? cap(offer) : 'Special offer inside' };
    var t = TONES[tone];
    var box = TN.el(SLUG + '-out');
    box.innerHTML = t.primary.map(function (p, i) {
      var primary = fill(p, map);
      var headline = fill(t.headline[i % t.headline.length], map);
      var cta = CTAS[i % CTAS.length];
      var comboId = SLUG + '-combo-' + i;
      return '<div class="tool-card" style="margin:8px 0">' +
        '<p><strong>Primary text</strong> <span class="muted">(' + primary.length + ' chars)</span></p>' +
        '<p data-combo="' + comboId + '">' + TN.esc(primary) + '</p>' +
        '<p><strong>Headline:</strong> ' + TN.esc(headline) + ' <span class="muted">(' + headline.length + ' chars)</span></p>' +
        '<p><strong>CTA:</strong> ' + TN.esc(cta) + '</p>' +
        '<button class="btn btn-sm btn-outline" data-copycombo="' + comboId + '" data-h="' + TN.esc(headline) + '" data-c="' + TN.esc(cta) + '">Copy Combo</button></div>';
    }).join('');
    var btns = box.querySelectorAll('[data-copycombo]');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          var comboEl = box.querySelector('[data-combo="' + b.getAttribute('data-copycombo') + '"]');
          var text = 'PRIMARY TEXT:\n' + comboEl.textContent + '\n\nHEADLINE:\n' + b.getAttribute('data-h') + '\n\nCTA:\n' + b.getAttribute('data-c');
          TN.copy(text).then(function () { TN.clearErr(SLUG + '-error'); })
            .catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
        });
      })(btns[i]);
    }
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.on(SLUG + '-gen', 'click', generate);
    } catch (e) { /* never throw on load */ }
  }

  init();
})();