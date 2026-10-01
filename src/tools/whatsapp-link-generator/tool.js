(function () {
  'use strict';
  var ERR = 'whatsapp-link-generator-error';
  function val(id) { var e = TN.el(id); return e ? e.value.trim() : ''; }
  function build() {
    var digits = val('wa-num').replace(/\D/g, '');
    if (!digits) return { err: 'Enter a phone number.' };
    if (digits.length < 7 || digits.length > 15) return { err: 'Use the international format: country code + number (7–15 digits, no + or spaces).' };
    var msg = val('wa-msg');
    var link = 'https://wa.me/' + digits + (msg ? '?text=' + encodeURIComponent(msg) : '');
    return { link: link };
  }
  function update() {
    if (!TN.el('wa-out')) return;
    TN.clearErr(ERR);
    var r = build();
    if (r.err) {
      TN.el('wa-out').value = '';
      var a0 = TN.el('wa-open'); if (a0) a0.setAttribute('href', 'https://wa.me/');
      TN.setErr(ERR, r.err); return;
    }
    TN.el('wa-out').value = r.link;
    var a = TN.el('wa-open'); if (a) a.setAttribute('href', r.link);
  }
  try {
    TN.on('wa-num', 'input', update);
    TN.on('wa-msg', 'input', update);
    TN.on('wa-copy', 'click', function () {
      var r = build();
      if (r.err) { TN.setErr(ERR, r.err); return; }
      TN.clearErr(ERR);
      if (TN.copy) TN.copy(r.link);
    });
    update();
  } catch (e) { /* never throw on load */ }
})();