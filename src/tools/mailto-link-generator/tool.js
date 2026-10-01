(function () {
  'use strict';
  var ERR = 'mailto-link-generator-error';
  function val(id) { var e = TN.el(id); return e ? e.value.trim() : ''; }
  function cleanAddrs(s) {
    return s.split(/[,;]+/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 0; }).join(',');
  }
  function build() {
    var to = cleanAddrs(val('mailto-to'));
    var parts = [];
    var cc = cleanAddrs(val('mailto-cc')); if (cc) parts.push('cc=' + encodeURIComponent(cc));
    var bcc = cleanAddrs(val('mailto-bcc')); if (bcc) parts.push('bcc=' + encodeURIComponent(bcc));
    var sub = val('mailto-subject'); if (sub) parts.push('subject=' + encodeURIComponent(sub));
    var body = val('mailto-body'); if (body) parts.push('body=' + encodeURIComponent(body));
    return 'mailto:' + to + (parts.length ? '?' + parts.join('&') : '');
  }
  function update() {
    if (!TN.el('mailto-out')) return;
    TN.clearErr(ERR);
    var link = build();
    TN.el('mailto-out').value = link;
    var a = TN.el('mailto-open');
    if (a) a.setAttribute('href', link);
  }
  try {
    ['mailto-to', 'mailto-cc', 'mailto-bcc', 'mailto-subject', 'mailto-body'].forEach(function (id) {
      TN.on(id, 'input', update);
    });
    TN.on('mailto-copy', 'click', function () {
      var link = TN.el('mailto-out').value;
      if (!val('mailto-to')) { TN.setErr(ERR, 'Enter at least one recipient email address.'); return; }
      TN.clearErr(ERR);
      if (TN.copy) TN.copy(link);
    });
    TN.on('mailto-open', 'click', function (ev) {
      if (!val('mailto-to')) { ev.preventDefault(); TN.setErr(ERR, 'Enter at least one recipient email address.'); }
    });
    update();
  } catch (e) { /* never throw on load */ }
})();