/* Word Frequency Counter — top 30 words with counts and bar visualization. */
(function () {
  'use strict';

  var SLUG = 'word-frequency-counter';

  var STOPWORDS = ('a,an,the,and,or,but,if,then,else,when,while,of,at,by,for,with,about,into,through,'
    + 'during,before,after,above,below,to,from,up,down,in,out,on,off,over,under,again,further,'
    + 'once,here,there,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,'
    + 'same,so,than,too,very,can,will,just,should,now,is,are,was,were,be,been,being,have,has,'
    + 'had,having,do,does,did,doing,would,could,ought,i,you,he,she,it,we,they,them,his,her,'
    + 'its,our,their,this,that,these,those,am,as,me,my,we,us').split(',');

  function errId() { return SLUG + '-error'; }

  function tokenize(text) {
    var m = text.match(/[A-Za-z']+/g);
    return m ? m : [];
  }

  function analyze() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-text');
    var text = ta ? ta.value : '';
    if (!text || !text.trim()) {
      TN.setErr(errId(), 'Please enter some text to analyze.');
      return;
    }
    var minLenEl = TN.el(SLUG + '-minlen');
    var minLen = minLenEl ? parseInt(minLenEl.value, 10) : 1;
    if (isNaN(minLen) || minLen < 1) minLen = 1;
    if (minLen > 20) minLen = 20;
    var noCaseEl = TN.el(SLUG + '-nocase');
    var noCase = noCaseEl ? !!noCaseEl.checked : true;
    var swEl = TN.el(SLUG + '-stopwords');
    var dropSW = swEl ? !!swEl.checked : false;

    var tokens = tokenize(text);
    var counts = {};
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var w = noCase ? tokens[i].toLowerCase() : tokens[i];
      w = w.replace(/^'+|'+$/g, '');
      if (!w || w.length < minLen) continue;
      if (dropSW && STOPWORDS.indexOf(w.toLowerCase()) !== -1) continue;
      counts[w] = (counts[w] || 0) + 1;
      total++;
    }
    var entries = [];
    for (var k in counts) {
      if (Object.prototype.hasOwnProperty.call(counts, k)) entries.push([k, counts[k]]);
    }
    entries.sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); });

    if (!entries.length) {
      TN.setErr(errId(), 'No words matched your filters. Try lowering the minimum word length.');
      return;
    }
    var top = entries.slice(0, 30);
    var max = top[0][1];
    var tb = TN.el(SLUG + '-tbody');
    if (tb) {
      var html = '';
      for (var j = 0; j < top.length; j++) {
        var pct = Math.round((top[j][1] / max) * 100);
        html += '<tr><td>' + (j + 1) + '</td><td>' + TN.esc(top[j][0]) + '</td><td>' + top[j][1] + '</td>'
          + '<td><div style="background:#e5e7eb;border-radius:4px;height:10px;min-width:120px;">'
          + '<div style="background:#166534;height:10px;border-radius:4px;width:' + pct + '%;"></div></div></td></tr>';
      }
      tb.innerHTML = html;
    }
    var totalEl = TN.el(SLUG + '-total');
    var uniqueEl = TN.el(SLUG + '-unique');
    if (totalEl) totalEl.textContent = total.toLocaleString('en-US');
    if (uniqueEl) uniqueEl.textContent = entries.length.toLocaleString('en-US');
  }

  function clear() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-text');
    if (ta) ta.value = '';
    var tb = TN.el(SLUG + '-tbody');
    if (tb) tb.innerHTML = '<tr><td colspan="4" class="muted">Run an analysis to see results.</td></tr>';
    var t = TN.el(SLUG + '-total'), u = TN.el(SLUG + '-unique');
    if (t) t.textContent = '–';
    if (u) u.textContent = '–';
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var a = TN.el(SLUG + '-analyze');
      if (a) TN.on(a, 'click', analyze);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();