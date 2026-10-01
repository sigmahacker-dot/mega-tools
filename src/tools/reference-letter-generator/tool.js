/* Reference Letter Generator — recommendation letter from referee/candidate/relationship. */
(function () {
  'use strict';
  var SLUG = 'reference-letter-generator';

  var current = '';

  function joinList(items) {
    if (!items.length) return 'their professionalism and dedication';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var referee = TN.el(SLUG + '-referee').value.trim() || '[Your Name]';
        var title = TN.el(SLUG + '-title').value.trim() || '[Your Title]';
        var cand = TN.el(SLUG + '-candidate').value.trim() || '[Candidate Name]';
        var rel = TN.el(SLUG + '-relation');
        var relText = rel.options[rel.selectedIndex].text.toLowerCase();
        var dur = TN.el(SLUG + '-duration').value;
        var tone = TN.el(SLUG + '-tone').value;
        var boxes = TN.qsa('#' + SLUG + '-strengths input:checked');
        var strengths = [];
        for (var i = 0; i < boxes.length && strengths.length < 4; i++) strengths.push(boxes[i].value);
        var sText = joinList(strengths);

        var L = [];
        L.push('To whom it may concern,');
        L.push('');
        L.push('I am writing to recommend ' + cand + ' with ' + (tone === 'warm' ? 'my highest enthusiasm' : 'my full confidence') + '. I have known ' + cand + ' for ' + dur + ', during which time ' + relText + '.');
        L.push('');
        if (tone === 'academic') {
          L.push('Throughout our association, ' + cand + ' distinguished themselves through ' + sText + '. Their intellectual curiosity and disciplined approach set them apart from their peers, and I observed consistent growth in both competence and character.');
        } else if (tone === 'warm') {
          L.push('What sets ' + cand + ' apart is ' + sText + '. They bring energy and integrity to everything they do, lift the people around them, and deliver results you can count on. Working with ' + cand + ' was genuinely a pleasure.');
        } else {
          L.push('During our time working together, ' + cand + ' consistently demonstrated ' + sText + '. They are dependable, thorough, and professional in every interaction, and they earned the respect of colleagues at every level.');
        }
        L.push('');
        L.push('I recommend ' + cand + ' without reservation. Please feel free to contact me if you would like any further information.');
        L.push('');
        L.push('Sincerely,');
        L.push(referee);
        L.push(title);
        current = L.join('\n');
        TN.el(SLUG + '-output').textContent = current;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not write the letter. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your letter first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your letter first.'); return; }
      TN.downloadText(current, 'reference-letter.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
