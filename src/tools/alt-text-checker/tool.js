(function () {
  'use strict';
  var P = 'alt-text-checker-', ERR = P + 'error';
  function attr(tag, name) {
    var re = new RegExp(name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i');
    var m = tag.match(re);
    return m ? (m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4])) : null;
  }
  function check(src, alt) {
    if (alt === null) return ['Missing alt attribute', '#dc2626'];
    if (!alt.trim()) return ['Empty alt (ok only if decorative)', '#d97706'];
    if (alt.length > 125) return ['Too long (' + alt.length + ' chars)', '#dc2626'];
    if (/^(img|image|dsc|screenshot|photo|pic)[-_.\d]*\.(jpg|jpeg|png|webp|gif|svg)$/i.test(alt.trim())) return ['Filename as alt text', '#dc2626'];
    if (/^(image|picture|photo)\s+of\s+/i.test(alt.trim())) return ['Redundant "image of…"', '#d97706'];
    return ['Good', '#4D7C0F'];
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var html = TN.el(P + 'input').value || '';
      var tags = html.match(/<img\b[^>]*>/gi) || [];
      var body = TN.el(P + 'body');
      TN.el(P + 'total').textContent = tags.length;
      if (!tags.length) {
        TN.el(P + 'ok').textContent = '0';
        TN.el(P + 'bad').textContent = '0';
        body.innerHTML = '<tr><td colspan="4" class="muted">' + (html.trim() ? 'No <img> tags found in the pasted HTML.' : 'Paste HTML above to audit its images.') + '</td></tr>';
        return;
      }
      var ok = 0, rows = tags.slice(0, 200).map(function (tag, i) {
        var src = attr(tag, 'src') || '(no src)', alt = attr(tag, 'alt');
        var st = check(src, alt);
        if (st[0] === 'Good') ok++;
        var shortSrc = src.length > 42 ? '…' + src.slice(-41) : src;
        return '<tr><td>' + (i + 1) + '</td><td><code>' + TN.esc(shortSrc) + '</code></td>' +
          '<td>' + (alt === null ? '<span class="muted">—</span>' : TN.esc(alt.length > 80 ? alt.slice(0, 80) + '…' : alt)) + '</td>' +
          '<td style="color:' + st[1] + '">' + st[0] + '</td></tr>';
      });
      TN.el(P + 'ok').textContent = ok;
      TN.el(P + 'bad').textContent = tags.length - ok;
      body.innerHTML = rows.join('');
    } catch (e) { TN.setErr(ERR, 'Could not audit the HTML. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 200));
    update();
  } catch (e) { /* never throw on load */ }
})();
