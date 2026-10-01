/* Twitter Thread Splitter — greedy word-boundary split, each tweet <= 280 chars incl. " (i/n)". */
(function () {
  'use strict';

  var SLUG = 'twitter-thread-splitter';
  var LIMIT = 280;
  var tweets = [];

  function errId() { return SLUG + '-error'; }

  function suffixLen(n) {
    // length of " (n/n)" for the worst case in a thread of n tweets
    return (' (' + n + '/' + n + ')').length;
  }

  function greedySplit(words, maxBody) {
    var chunks = [];
    var cur = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.length > maxBody) {
        // Word longer than the limit: hard-split it.
        if (cur) { chunks.push(cur); cur = ''; }
        while (w.length > maxBody) { chunks.push(w.slice(0, maxBody)); w = w.slice(maxBody); }
        cur = w;
        continue;
      }
      var next = cur ? cur + ' ' + w : w;
      if (next.length > maxBody) { chunks.push(cur); cur = w; }
      else cur = next;
    }
    if (cur) chunks.push(cur);
    return chunks;
  }

  function splitThread(text) {
    var words = text.split(/\s+/).filter(function (w) { return w.length; });
    if (!words.length) return [];
    // Iterate: reserve suffix space for n, re-split until n stabilizes.
    var n = 1, chunks = [];
    for (var iter = 0; iter < 10; iter++) {
      var maxBody = LIMIT - suffixLen(n);
      chunks = greedySplit(words, maxBody);
      if (chunks.length <= 1) { n = 1; break; }
      if (chunks.length === n) break;
      n = chunks.length;
    }
    n = chunks.length;
    return chunks.map(function (c, i) { return c + ' (' + (i + 1) + '/' + n + ')'; });
  }

  function render() {
    var list = TN.el(SLUG + '-list');
    var count = TN.el(SLUG + '-count');
    if (count) count.textContent = tweets.length
      ? tweets.length + ' tweet' + (tweets.length === 1 ? '' : 's') + ' — each 280 characters or fewer.'
      : '';
    if (!list) return;
    if (!tweets.length) { list.innerHTML = ''; return; }
    var html = '';
    tweets.forEach(function (t, i) {
      html += '<div class="field" style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;">'
        + '<label>Tweet ' + (i + 1) + ' <span class="muted">(' + t.length + '/280)</span></label>'
        + '<p style="white-space:pre-wrap;word-break:break-word;margin:0 0 8px;">' + TN.esc(t) + '</p>'
        + '<button type="button" class="btn btn-sm btn-outline" data-i="' + i + '">Copy tweet</button>'
        + '</div>';
    });
    list.innerHTML = html;
    var btns = list.querySelectorAll('button[data-i]');
    Array.prototype.forEach.call(btns, function (btn) {
      TN.on(btn, 'click', function () {
        var i = parseInt(btn.getAttribute('data-i'), 10);
        if (isNaN(i) || !tweets[i]) return;
        TN.clearErr(errId());
        TN.copy(tweets[i]).then(function (ok) {
          if (ok) { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy tweet'; }, 1200); }
          else TN.setErr(errId(), 'Copy failed — select the tweet manually and press Ctrl+C.');
        });
      });
    });
  }

  function run() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-input');
    var text = ta ? ta.value : '';
    if (!text || !text.trim()) {
      TN.setErr(errId(), 'Please paste some text to split.');
      return;
    }
    tweets = splitThread(text.trim());
    if (!tweets.length) { TN.setErr(errId(), 'Nothing to split.'); return; }
    render();
  }

  function copyAll() {
    if (!tweets.length) { TN.setErr(errId(), 'Split some text first.'); return; }
    TN.clearErr(errId());
    TN.copy(tweets.join('\n\n')).then(function (ok) {
      if (!ok) TN.setErr(errId(), 'Copy failed — select the tweets manually and press Ctrl+C.');
    });
  }

  function clear() {
    TN.clearErr(errId());
    tweets = [];
    var ta = TN.el(SLUG + '-input');
    if (ta) ta.value = '';
    render();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var r = TN.el(SLUG + '-run');
      if (r) TN.on(r, 'click', run);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
      var ca = TN.el(SLUG + '-copyall');
      if (ca) TN.on(ca, 'click', copyAll);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();