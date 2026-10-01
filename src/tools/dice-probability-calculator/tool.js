/* Dice probability distribution via dynamic programming. */
(function () {
  'use strict';
  var SLUG = 'dice-probability-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var X = parseInt($(SLUG + '-x').value, 10), Y = parseInt($(SLUG + '-y').value, 10);
    var mod = parseInt($(SLUG + '-mod').value, 10) || 0;
    var target = parseInt($(SLUG + '-target').value, 10);
    if (isNaN(X) || X < 1 || X > 20) { err('Dice X must be 1\u201320.'); return; }
    if (isNaN(Y) || Y < 2 || Y > 100) { err('Sides Y must be 2\u2013100.'); return; }
    if (isNaN(target)) { err('Enter a target number.'); return; }
    // DP over sums
    var dp = { 0: 1 };
    for (var d = 0; d < X; d++) {
      var ndp = {};
      for (var s in dp) {
        for (var face = 1; face <= Y; face++) {
          var ns = parseInt(s, 10) + face;
          ndp[ns] = (ndp[ns] || 0) + dp[s];
        }
      }
      dp = ndp;
    }
    var total = Math.pow(Y, X);
    var sums = Object.keys(dp).map(Number).sort(function (a, b) { return a - b; });
    var mean = 0, pTarget = 0;
    sums.forEach(function (s) {
      var p = dp[s] / total;
      mean += (s + mod) * p;
      if (s + mod >= target) pTarget += p;
    });
    $(SLUG + '-p').textContent = (pTarget * 100).toFixed(2) + '%';
    $(SLUG + '-mean').textContent = (Math.round(mean * 100) / 100).toString();
    var html = '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:6px;border-bottom:2px solid #ddd">Total</th><th style="text-align:right;padding:6px;border-bottom:2px solid #ddd">Ways</th><th style="text-align:right;padding:6px;border-bottom:2px solid #ddd">P(exact)</th><th style="text-align:right;padding:6px;border-bottom:2px solid #ddd">P(\u2265)</th></tr></thead><tbody>';
    var cum = 0;
    sums.slice().reverse().forEach(function (s) {
      var p = dp[s] / total;
      cum += p;
      var t = s + mod;
      html += '<tr' + (t === target ? ' style="background:#e8f5e9"' : '') + '><td style="padding:5px;border-bottom:1px solid #eee;font-weight:bold">' + t + '</td><td style="padding:5px;border-bottom:1px solid #eee;text-align:right;font-family:monospace">' + dp[s].toLocaleString('en-US') + '</td><td style="padding:5px;border-bottom:1px solid #eee;text-align:right;font-family:monospace">' + (p * 100).toFixed(2) + '%</td><td style="padding:5px;border-bottom:1px solid #eee;text-align:right;font-family:monospace">' + (cum * 100).toFixed(2) + '%</td></tr>';
    });
    html += '</tbody></table>';
    html += '<p class="hint">Exact distribution for ' + X + 'd' + Y + (mod ? (mod > 0 ? '+' + mod : mod) : '') + ' via dynamic programming over ' + total.toLocaleString('en-US') + ' outcomes. Mean = X\u00D7(Y+1)/2 + mod = ' + (Math.round(mean * 100) / 100) + '.</p>';
    $(SLUG + '-table').innerHTML = html;
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    ['x', 'y', 'mod', 'target'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    calc();
  } catch (e) {}
})();