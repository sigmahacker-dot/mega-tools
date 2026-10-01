(function () {
  'use strict';
  var ERR = 'tel-link-generator-error';
  function val(id) { var e = TN.el(id); return e ? e.value.trim() : ''; }
  function normalize(raw) {
    var plus = raw.charAt(0) === '+';
    var digits = raw.replace(/\D/g, '');
    return (plus ? '+' : '') + digits;
  }
  function build() {
    var n = normalize(val('tel-num'));
    var ext = val('tel-ext').replace(/\D/g, '');
    if (!n || n === '+') return { err: 'Enter a phone number.' };
    var digitCount = n.replace(/\D/g, '').length;
    if (digitCount < 7 || digitCount > 15) return { err: 'Phone numbers must have 7–15 digits.' };
    var link = 'tel:' + n + (ext ? ';ext=' + ext : '');
    return { link: link, normalized: n + (ext ? ' ext. ' + ext : '') };
  }
  function update() {
    if (!TN.el('tel-out')) return;
    TN.clearErr(ERR);
    var r = build();
    if (r.err) {
      TN.el('tel-out').value = ''; TN.el('tel-normalized').textContent = '–';
      var a0 = TN.el('tel-open'); if (a0) a0.setAttribute('href', 'tel:');
      TN.setErr(ERR, r.err); return;
    }
    TN.el('tel-out').value = r.link;
    TN.el('tel-normalized').textContent = r.normalized;
    var a = TN.el('tel-open'); if (a) a.setAttribute('href', r.link);
  }
  try {
    TN.on('tel-num', 'input', update);
    TN.on('tel-ext', 'input', update);
    TN.on('tel-copy', 'click', function () {
      var r = build();
      if (r.err) { TN.setErr(ERR, r.err); return; }
      TN.clearErr(ERR);
      if (TN.copy) TN.copy(r.link);
    });
    update();
  } catch (e) { /* never throw on load */ }
})();