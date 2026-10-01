/* Final Exam Calculator — current grade, exam weight, target → required score. */
(function () {
  'use strict';

  var SLUG = 'final-exam-calculator';

  function calc() {
    TN.clearErr(SLUG + '-error');
    var current = parseFloat(TN.el(SLUG + '-current').value);
    var weight = parseFloat(TN.el(SLUG + '-weight').value);
    var target = parseFloat(TN.el(SLUG + '-target').value);
    if (isNaN(current) || current < 0 || current > 100) { TN.setErr(SLUG + '-error', 'Current grade must be 0–100.'); return; }
    if (isNaN(weight) || weight <= 0 || weight > 100) { TN.setErr(SLUG + '-error', 'Exam weight must be 1–100.'); return; }
    if (isNaN(target) || target < 0 || target > 100) { TN.setErr(SLUG + '-error', 'Target grade must be 0–100.'); return; }

    var w = weight / 100;
    var required = (target - current * (1 - w)) / w;
    var out = TN.el(SLUG + '-result');
    var html = '<p>You need <strong>' + required.toFixed(1) + '%</strong> on the final exam to finish with <strong>' + target + '%</strong>.</p>';
    if (required > 100) {
      html += '<p class="note">⚠️ That is impossible — even a perfect 100% on the final gets you to ' +
        (current * (1 - w) + 100 * w).toFixed(1) + '%. Consider a lower target.</p>';
    } else if (required < 0) {
      html += '<p class="note">🎉 Good news — you already have ' + target + '% locked in. You could score 0 on the final and still hit your target.</p>';
    } else {
      html += '<p class="muted">Formula: (target − current × ' + (1 - w).toFixed(2) + ') ÷ ' + w.toFixed(2) + '</p>';
    }
    out.innerHTML = html;
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-calc')) return;
      TN.on(SLUG + '-calc', 'click', calc);
    } catch (e) { /* never throw on load */ }
  }

  init();
})();