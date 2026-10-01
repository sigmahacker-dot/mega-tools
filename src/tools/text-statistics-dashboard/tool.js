/* Text Statistics Dashboard — full counts, reading/speaking time, top-10 words. */
(function () {
  'use strict';
  var SLUG = 'text-statistics-dashboard';

  function wordsOf(text) {
    var m = text.toLowerCase().match(/[a-z0-9\u00C0-\u024F']+/g);
    return m ? m : [];
  }
  function sentencesOf(text) {
    var m = text.replace(/\b(Mr|Mrs|Ms|Dr|St|Jr|Sr|vs|etc|i\.e|e\.g)\./gi, '$1@DOT@')
      .match(/[^.!?]+[.!?]+["'”’)]?\s*|[^.!?]+$/g);
    if (!m) return [];
    return m.filter(function (s) { return s.replace(/@DOT@/g, '.').trim().length > 0; });
  }
  function fmtTime(minutes) {
    var total = Math.round(minutes * 60);
    if (total < 60) return total + 's';
    var m = Math.floor(total / 60), s = total % 60;
    return m + 'm ' + s + 's';
  }

  function update() {
    TN.clearErr(SLUG + '-error');
    var text = TN.el(SLUG + '-input').value;
    var words = wordsOf(text);
    var chars = text.length;
    var charsNoSpace = text.replace(/\s/g, '').length;
    var sents = sentencesOf(text).length;
    var paras = text.trim() ? text.trim().split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length : 0;
    var letterSum = 0;
    words.forEach(function (w) { letterSum += w.replace(/[^a-z0-9\u00C0-\u024F]/g, '').length; });

    TN.el(SLUG + '-words').textContent = words.length;
    TN.el(SLUG + '-chars').textContent = chars;
    TN.el(SLUG + '-charsnospace').textContent = charsNoSpace;
    TN.el(SLUG + '-sents').textContent = sents;
    TN.el(SLUG + '-paras').textContent = paras;
    TN.el(SLUG + '-read').textContent = fmtTime(words.length / 200);
    TN.el(SLUG + '-speak').textContent = fmtTime(words.length / 130);
    TN.el(SLUG + '-avglen').textContent = words.length ? (letterSum / words.length).toFixed(1) : '0';

    var freq = {};
    words.forEach(function (w) {
      var clean = w.replace(/^'+|'+$/g, '');
      if (clean) freq[clean] = (freq[clean] || 0) + 1;
    });
    var sorted = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 10);
    var box = TN.el(SLUG + '-top10');
    if (!sorted.length) { box.textContent = '—'; return; }
    var html = '<table style="width:100%;border-collapse:collapse;font-size:0.9em"><tr><th style="text-align:left;padding:4px">#</th><th style="text-align:left;padding:4px">Word</th><th style="text-align:right;padding:4px">Count</th><th style="text-align:right;padding:4px">%</th></tr>';
    sorted.forEach(function (w, i) {
      var pct = (freq[w] / words.length * 100).toFixed(1);
      html += '<tr><td style="padding:4px">' + (i + 1) + '</td><td style="padding:4px">' +
        TN.esc(w) + '</td><td style="padding:4px;text-align:right">' + freq[w] +
        '</td><td style="padding:4px;text-align:right">' + pct + '%</td></tr>';
    });
    box.innerHTML = html + '</table>';
  }

  try {
    TN.on(SLUG + '-input', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
