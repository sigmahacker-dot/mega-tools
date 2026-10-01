(function () {
  'use strict';
  var P = 'youtube-tag-counter-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var raw = TN.el(P + 'input').value || '';
      var tags = raw.split(/[\n,]+/).map(function (t) { return t.trim().replace(/^["“”']+|["“”']+$/g, ''); }).filter(Boolean);
      var seen = {}, dupes = 0, total = 0;
      var rows = tags.slice(0, 200).map(function (t) {
        total += t.length;
        var k = t.toLowerCase(), status = '<span style="color:#4D7C0F">OK</span>';
        if (seen[k]) { dupes++; status = '<span style="color:#dc2626">Duplicate</span>'; }
        else if (t.length > 60) status = '<span style="color:#d97706">Very long</span>';
        seen[k] = 1;
        return '<tr><td>' + TN.esc(t) + '</td><td>' + t.length + '</td><td>' + status + '</td></tr>';
      });
      TN.el(P + 'count').textContent = tags.length;
      var cc = TN.el(P + 'chars');
      cc.textContent = total + ' / 500';
      cc.style.color = total > 500 ? '#dc2626' : '';
      TN.el(P + 'dupes').textContent = dupes;
      TN.el(P + 'body').innerHTML = rows.length ? rows.join('')
        : '<tr><td colspan="3" class="muted">Your tags appear here.</td></tr>';
      if (total > 500) TN.setErr(ERR, 'Over the 500-character limit by ' + (total - 500) + ' characters — remove or shorten tags.');
    } catch (e) { TN.setErr(ERR, 'Could not count the tags. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    update();
  } catch (e) { /* never throw on load */ }
})();
