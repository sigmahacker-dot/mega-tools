/* Influencer Rate Calculator — suggested rate from followers + engagement. */
(function () {
  'use strict';

  var SLUG = 'influencer-rate-calculator';
  var BASE_CPM = 15; // $ per 1000 followers
  var ER_BASELINE = 3; // % engagement baseline

  function money(n) {
    return '$' + Math.round(n).toLocaleString();
  }

  function calc() {
    TN.clearErr(SLUG + '-error');
    var followers = parseFloat(TN.el(SLUG + '-followers').value);
    var er = parseFloat(TN.el(SLUG + '-er').value);
    var mult = parseFloat(TN.el(SLUG + '-niche').value);
    if (isNaN(followers) || followers <= 0) { TN.setErr(SLUG + '-error', 'Enter a valid follower count.'); return; }
    if (isNaN(er) || er < 0 || er > 100) { TN.setErr(SLUG + '-error', 'Engagement rate must be 0–100%.'); return; }

    // Formula: (followers/1000) × BASE_CPM × (er/ER_BASELINE clamped 0.5–2) × niche multiplier
    var erFactor = er / ER_BASELINE;
    if (erFactor < 0.5) erFactor = 0.5;
    if (erFactor > 2) erFactor = 2;
    var post = (followers / 1000) * BASE_CPM * erFactor * mult;
    var story = post * 0.3;
    var reel = post * 1.5;

    TN.el(SLUG + '-post').textContent = money(post);
    TN.el(SLUG + '-story').textContent = money(story);
    TN.el(SLUG + '-reel').textContent = money(reel);
    TN.el(SLUG + '-detail').innerHTML =
      '<p class="muted">Formula: (' + followers.toLocaleString() + ' ÷ 1,000) × $' + BASE_CPM + ' CPM × ' +
      erFactor.toFixed(2) + ' engagement factor × ' + mult.toFixed(1) + ' niche multiplier.</p>' +
      '<p>Suggested negotiation range per post: <strong>' + money(post * 0.8) + ' – ' + money(post * 1.2) + '</strong></p>';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-calc')) return;
      TN.on(SLUG + '-calc', 'click', calc);
    } catch (e) { /* never throw on load */ }
  }

  init();
})();