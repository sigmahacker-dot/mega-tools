/* Double Letter Finder — lists doubled letters with word + character positions. */
(function () {
  'use strict';
  var SLUG = 'double-letter-finder';

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var text = TN.el(SLUG + '-input').value;
        if (!text.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
        var re = /[A-Za-z]+/g, m, rows = [], wordsHit = {};
        while ((m = re.exec(text)) !== null) {
          var word = m[0], start = m.index;
          for (var i = 0; i < word.length - 1; i++) {
            if (word[i].toLowerCase() === word[i + 1].toLowerCase()) {
              rows.push({ word: word, letter: word[i].toLowerCase(), pos: start + i });
              wordsHit[word.toLowerCase()] = true;
            }
          }
        }
        TN.el(SLUG + '-total').textContent = rows.length;
        TN.el(SLUG + '-words').textContent = Object.keys(wordsHit).length;
        var box = TN.el(SLUG + '-output');
        if (!rows.length) { box.textContent = 'No doubled letters found.'; return; }
        var html = '<table style="width:100%;border-collapse:collapse;font-size:.85rem"><thead><tr>' +
          '<th style="text-align:left;padding:6px;border-bottom:1px solid #444">Word</th>' +
          '<th style="text-align:left;padding:6px;border-bottom:1px solid #444">Double</th>' +
          '<th style="text-align:left;padding:6px;border-bottom:1px solid #444">Position in text</th></tr></thead><tbody>';
        rows.forEach(function (r) {
          html += '<tr><td style="padding:6px;border-bottom:1px solid #333">' + TN.esc(r.word) + '</td>' +
            '<td style="padding:6px;border-bottom:1px solid #333"><strong>' + TN.esc(r.letter + r.letter) + '</strong></td>' +
            '<td style="padding:6px;border-bottom:1px solid #333">chars ' + r.pos + '–' + (r.pos + 1) + '</td></tr>';
        });
        box.innerHTML = html + '</tbody></table>';
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not analyze the text. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
