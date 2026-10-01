(function () {
  'use strict';
  var ERR = 'vcard-generator-error';
  function val(id) { var e = TN.el(id); return e ? e.value.trim() : ''; }
  function vesc(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }
  function fold(line) {
    if (line.length <= 75) return line;
    var out = '', i = 0;
    while (i < line.length) { out += (i ? '\r\n ' : '') + line.slice(i, i + 75); i += 75; }
    return out;
  }
  function build() {
    var first = val('vcard-first'), last = val('vcard-last');
    var lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    lines.push('N:' + vesc(last) + ';' + vesc(first) + ';;;');
    var fn = (first + ' ' + last).trim() || 'Unnamed Contact';
    lines.push('FN:' + vesc(fn));
    if (val('vcard-org')) lines.push('ORG:' + vesc(val('vcard-org')));
    if (val('vcard-title')) lines.push('TITLE:' + vesc(val('vcard-title')));
    if (val('vcard-phone')) lines.push('TEL;TYPE=WORK,VOICE:' + vesc(val('vcard-phone')));
    if (val('vcard-mobile')) lines.push('TEL;TYPE=CELL,VOICE:' + vesc(val('vcard-mobile')));
    if (val('vcard-email')) lines.push('EMAIL;TYPE=INTERNET:' + vesc(val('vcard-email')));
    if (val('vcard-web')) lines.push('URL:' + vesc(val('vcard-web')));
    if (val('vcard-addr')) lines.push('ADR;TYPE=WORK:;;' + vesc(val('vcard-addr')) + ';;;;');
    if (val('vcard-note')) lines.push('NOTE:' + vesc(val('vcard-note')));
    lines.push('END:VCARD');
    return lines.map(fold).join('\r\n');
  }
  function dl(text, name) {
    var b = new Blob([text], { type: 'text/vcard;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function update() {
    if (!TN.el('vcard-out')) return;
    TN.clearErr(ERR);
    TN.el('vcard-out').value = build();
  }
  try {
    ['vcard-first', 'vcard-last', 'vcard-org', 'vcard-title', 'vcard-phone', 'vcard-mobile', 'vcard-email', 'vcard-web', 'vcard-addr', 'vcard-note']
      .forEach(function (id) { TN.on(id, 'input', update); });
    TN.on('vcard-dl', 'click', function () {
      if (!val('vcard-first') && !val('vcard-last') && !val('vcard-email') && !val('vcard-phone') && !val('vcard-mobile')) {
        TN.setErr(ERR, 'Enter at least a name, email or phone number first.');
        return;
      }
      TN.clearErr(ERR);
      var fn = (val('vcard-first') + '_' + val('vcard-last')).replace(/[^a-zA-Z0-9_-]+/g, '').replace(/^_+|_+$/g, '') || 'contact';
      dl(build(), fn + '.vcf');
    });
    TN.on('vcard-copy', 'click', function () { if (TN.copy) TN.copy(TN.el('vcard-out').value); });
    update();
  } catch (e) { /* never throw on load */ }
})();