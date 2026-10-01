(function () {
  'use strict';
  var P = 'invisible-character-finder-', ERR = P + 'error';
  var CHARS = [
    ['\u200B', 'U+200B', 'Zero-width space'], ['\u200C', 'U+200C', 'Zero-width non-joiner'],
    ['\u200D', 'U+200D', 'Zero-width joiner'], ['\u2060', 'U+2060', 'Word joiner'],
    ['\uFEFF', 'U+FEFF', 'Byte-order mark / zero-width no-break space'],
    ['\u00AD', 'U+00AD', 'Soft hyphen'], ['\u202A', 'U+202A', 'Left-to-right embedding'],
    ['\u202B', 'U+202B', 'Right-to-left embedding'], ['\u202C', 'U+202C', 'Pop directional formatting'],
    ['\u2061', 'U+2061', 'Function application'], ['\u2062', 'U+2062', 'Invisible times'],
    ['\u2063', 'U+2063', 'Invisible separator'], ['\u2064', 'U+2064', 'Invisible plus'],
    ['\u3164', 'U+3164', 'Hangul filler'], ['\u3000', 'U+3000', 'Ideographic space']
  ];
  function scan(t) {
    var found = [], i, j;
    for (i = 0; i < t.length; i++) {
      for (j = 0; j < CHARS.length; j++) {
        if (t[i] === CHARS[j][0]) {
          var last = found[found.length - 1];
          if (last && last.cp === CHARS[j][1]) { last.n++; last.pos.push(i); }
          else found.push({ ch: CHARS[j][0], cp: CHARS[j][1], name: CHARS[j][2], n: 1, pos: [i] });
          break;
        }
      }
    }
    return found;
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var out = TN.el(P + 'out'), body = TN.el(P + 'body');
      if (!t) {
        out.textContent = 'Paste text above to scan it.'; out.className = 'muted';
        body.innerHTML = '<tr><td colspan="4" class="muted">No invisible characters found.</td></tr>';
        TN.el(P + 'count').textContent = '0'; TN.el(P + 'types').textContent = '0';
        return;
      }
      var found = scan(t);
      var total = found.reduce(function (s, f) { return s + f.n; }, 0);
      var html = '', last = 0, i;
      var allPos = [];
      found.forEach(function (f) { f.pos.forEach(function (p) { allPos.push({ p: p, f: f }); }); });
      allPos.sort(function (a, b) { return a.p - b.p; });
      for (i = 0; i < allPos.length; i++) {
        html += TN.esc(t.slice(last, allPos[i].p));
        html += '<span style="background:#dc2626;color:#fff;border-radius:4px;padding:0 4px;font-size:.75em;">' + TN.esc(allPos[i].f.cp) + '</span>';
        last = allPos[i].p + 1;
      }
      html += TN.esc(t.slice(last));
      out.innerHTML = total ? html : TN.esc(t);
      out.className = '';
      TN.el(P + 'count').textContent = total;
      TN.el(P + 'types').textContent = found.length;
      body.innerHTML = found.length ? found.map(function (f) {
        return '<tr><td>' + TN.esc(f.name) + '</td><td><code>' + f.cp + '</code></td><td>' + f.n + '</td><td class="muted">' + f.pos.slice(0, 8).join(', ') + (f.pos.length > 8 ? ', …' : '') + '</td></tr>';
      }).join('') : '<tr><td colspan="4" class="muted">No invisible characters found — text is clean.</td></tr>';
    } catch (e) { TN.setErr(ERR, 'Could not scan the text. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    TN.on(P + 'strip', 'click', function () {
      var t = TN.el(P + 'input').value || '';
      if (!t) { TN.setErr(ERR, 'Nothing to strip yet.'); return; }
      var clean = t, i;
      for (i = 0; i < CHARS.length; i++) clean = clean.split(CHARS[i][0]).join('');
      TN.clearErr(ERR);
      TN.copy(clean).then(function (ok) {
        var b = TN.el(P + 'strip');
        b.textContent = ok ? 'Stripped & copied!' : 'Copy failed — clean text: ' + clean.length + ' chars';
        setTimeout(function () { b.textContent = 'Strip & copy clean text'; }, 1500);
      });
    });
    TN.on(P + 'clear', 'click', function () {
      TN.el(P + 'input').value = ''; TN.clearErr(ERR); update(); TN.el(P + 'input').focus();
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
