(function () {
  'use strict';
  var ERR = 'sms-link-generator-error';
  function val(id) { var e = TN.el(id); return e ? e.value.trim() : ''; }
  function normalize(raw) {
    var plus = raw.charAt(0) === '+';
    return (plus ? '+' : '') + raw.replace(/\D/g, '');
  }
  function build() {
    var n = normalize(val('sms-num'));
    if (!n || n === '+') return { err: 'Enter a phone number.' };
    var digits = n.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return { err: 'Phone numbers must have 7–15 digits.' };
    var msg = val('sms-msg');
    var link = 'sms:' + n + (msg ? '?&body=' + encodeURIComponent(msg) : '');
    return { link: link };
  }
  function update() {
    if (!TN.el('sms-out')) return;
    TN.clearErr(ERR);
    var r = build();
    if (r.err) {
      TN.el('sms-out').value = '';
      var a0 = TN.el('sms-open'); if (a0) a0.setAttribute('href', 'sms:');
      TN.setErr(ERR, r.err); return;
    }
    TN.el('sms-out').value = r.link;
    var a = TN.el('sms-open'); if (a) a.setAttribute('href', r.link);
  }
  try {
    TN.on('sms-num', 'input', update);
    TN.on('sms-msg', 'input', update);
    TN.on('sms-copy', 'click', function () {
      var r = build();
      if (r.err) { TN.setErr(ERR, r.err); return; }
      TN.clearErr(ERR);
      if (TN.copy) TN.copy(r.link);
    });
    update();
  } catch (e) { /* never throw on load */ }
})();