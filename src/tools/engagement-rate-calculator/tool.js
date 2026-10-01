/* Engagement Rate Calculator — (likes+comments+shares) ÷ followers/reach. */
(function () {
  'use strict';

  var SLUG = 'engagement-rate-calculator';

  function num(id) {
    var n = parseFloat(TN.el(SLUG + '-' + id).value);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function rating(er) {
    if (er >= 6) return '🔥 Excellent';
    if (er >= 3) return '✅ Good';
    if (er >= 1) return '➖ Average';
    return '⚠️ Low';
  }

  function calc() {
    TN.clearErr(SLUG + '-error');
    var likes = num('likes'), comments = num('comments'), shares = num('shares');
    var followers = num('followers'), reach = num('reach');
    var interactions = likes + comments + shares;
    if (interactions === 0) { TN.setErr(SLUG + '-error', 'Enter at least one interaction (likes, comments or shares).'); return; }
    if (followers === 0 && reach === 0) { TN.setErr(SLUG + '-error', 'Enter followers or reach.'); return; }

    var erf = followers > 0 ? interactions / followers * 100 : null;
    var err = reach > 0 ? interactions / reach * 100 : null;

    TN.el(SLUG + '-erf').textContent = erf !== null ? erf.toFixed(2) + '%' : '—';
    TN.el(SLUG + '-err').textContent = err !== null ? err.toFixed(2) + '%' : '—';
    var primary = erf !== null ? erf : err;
    TN.el(SLUG + '-rating').textContent = rating(primary);
    TN.el(SLUG + '-detail').innerHTML =
      '<p class="muted">' + interactions.toLocaleString() + ' total interactions ' +
      '(👍 ' + likes.toLocaleString() + ' + 💬 ' + comments.toLocaleString() + ' + 🔁 ' + shares.toLocaleString() + ')</p>' +
      '<p class="muted">Benchmarks: &lt;1% low · 1–3% average · 3–6% good · 6%+ excellent (varies by platform).</p>';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-calc')) return;
      TN.on(SLUG + '-calc', 'click', calc);
    } catch (e) { /* never throw on load */ }
  }

  init();
})();