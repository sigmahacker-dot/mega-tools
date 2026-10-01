/* Text Diff Checker — LCS-based word-level diff rendered with ins/del styling. */
(function () {
  'use strict';

  var SLUG = 'text-diff-checker';
  var MAX_WORDS = 5000;

  function errId() { return SLUG + '-error'; }
  function set(id, v) { var e = TN.el(id); if (e) e.textContent = v; }

  // Split into tokens, keeping whitespace so rendering preserves spacing.
  function tokenize(text) {
    return text.split(/(\s+)/).filter(function (t) { return t.length; });
  }
  function isWord(t) { return /\S/.test(t); }

  // LCS on word tokens only; whitespace is attached to the previous emitted token.
  function diff(aTokens, bTokens) {
    var aW = [], bW = [], aIdx = [], bIdx = [];
    for (var i = 0; i < aTokens.length; i++) if (isWord(aTokens[i])) { aW.push(aTokens[i]); aIdx.push(i); }
    for (var j = 0; j < bTokens.length; j++) if (isWord(bTokens[j])) { bW.push(bTokens[j]); bIdx.push(j); }

    var n = aW.length, m = bW.length;
    // DP table with Uint16/32 choice
    var use16 = n < 65535 && m < 65535;
    var dp = use16 ? new Uint16Array((n + 1) * (m + 1)) : new Uint32Array((n + 1) * (m + 1));
    var stride = m + 1;
    for (var x = n - 1; x >= 0; x--) {
      for (var y = m - 1; y >= 0; y--) {
        if (aW[x] === bW[y]) dp[x * stride + y] = dp[(x + 1) * stride + (y + 1)] + 1;
        else {
          var down = dp[(x + 1) * stride + y], right = dp[x * stride + (y + 1)];
          dp[x * stride + y] = down > right ? down : right;
        }
      }
    }
    // Backtrack
    var ops = []; // {type:'same'|'del'|'ins', token}
    x = 0; y = 0;
    while (x < n && y < m) {
      if (aW[x] === bW[y]) { ops.push({ type: 'same', token: aW[x] }); x++; y++; }
      else if (dp[(x + 1) * stride + y] >= dp[x * stride + (y + 1)]) { ops.push({ type: 'del', token: aW[x] }); x++; }
      else { ops.push({ type: 'ins', token: bW[y] }); y++; }
    }
    while (x < n) { ops.push({ type: 'del', token: aW[x] }); x++; }
    while (y < m) { ops.push({ type: 'ins', token: bW[y] }); y++; }
    return ops;
  }

  function esc(t) { return TN.esc(t); }

  function render(ops) {
    var html = '', added = 0, removed = 0, same = 0;
    // We diff words; original whitespace between words is re-created with single spaces.
    for (var i = 0; i < ops.length; i++) {
      var o = ops[i];
      if (o.type === 'same') {
        same++;
        html += esc(o.token) + ' ';
      } else if (o.type === 'del') {
        removed++;
        html += '<span style="background:#fee2e2;color:#b91c1c;border-radius:3px;text-decoration:line-through;">' + esc(o.token) + '</span> ';
      } else {
        added++;
        html += '<span style="background:#dcfce7;color:#166534;border-radius:3px;">' + esc(o.token) + '</span> ';
      }
    }
    return { html: html, added: added, removed: removed, same: same };
  }

  function compare() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-a'), tb = TN.el(SLUG + '-b');
    var a = ta ? ta.value : '', b = tb ? tb.value : '';
    if (!a.trim() && !b.trim()) {
      TN.setErr(errId(), 'Please enter text in both boxes to compare.');
      return;
    }
    var aT = tokenize(a), bT = tokenize(b);
    var aWords = aT.filter(isWord).length, bWords = bT.filter(isWord).length;
    if (aWords > MAX_WORDS || bWords > MAX_WORDS) {
      TN.setErr(errId(), 'Each text is limited to ' + MAX_WORDS + ' words for a fast diff. Split longer texts into chunks.');
      return;
    }
    var t0 = Date.now();
    var ops = diff(aT, bT);
    var r = render(ops);
    var out = TN.el(SLUG + '-diff');
    if (out) out.innerHTML = r.html || '<span class="muted">Both texts are identical.</span>';
    set(SLUG + '-added', r.added.toLocaleString('en-US'));
    set(SLUG + '-removed', r.removed.toLocaleString('en-US'));
    set(SLUG + '-same', r.same.toLocaleString('en-US'));
    if (Date.now() - t0 > 8000) {
      // nothing — just informational; diff already rendered
    }
  }

  function clear() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-a'), tb = TN.el(SLUG + '-b');
    if (ta) ta.value = '';
    if (tb) tb.value = '';
    var out = TN.el(SLUG + '-diff');
    if (out) out.innerHTML = '';
    ['added', 'removed', 'same'].forEach(function (k) { set(SLUG + '-' + k, '–'); });
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var c = TN.el(SLUG + '-compare');
      if (c) TN.on(c, 'click', compare);
      var x = TN.el(SLUG + '-clear');
      if (x) TN.on(x, 'click', clear);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();