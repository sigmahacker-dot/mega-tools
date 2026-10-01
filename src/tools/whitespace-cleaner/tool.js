(function () {
  'use strict';
  var P = 'whitespace-cleaner-';
  var ERR = P + 'error';
  var OPTS = ['opt-crlf', 'opt-tabs', 'opt-trim', 'opt-trailing', 'opt-tabwidth', 'opt-blanks'];
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function clean() {
    var inEl = g('in'), outEl = g('out');
    if (!inEl || !outEl) return;
    TN.clearErr(ERR);
    var src = inEl.value, t = src;
    var linesBefore = src === '' ? 0 : src.split('\n').length;
    try {
      if (g('opt-crlf').checked) t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      if (g('opt-tabs').checked) {
        var w = parseInt(g('opt-tabwidth').value, 10) || 4;
        var sp = '';
        for (var i = 0; i < w; i++) sp += ' ';
        t = t.replace(/\t/g, sp);
      }
      if (g('opt-trim').checked) {
        t = t.split('\n').map(function (l) { return l.replace(/^[\t ]+|[\t ]+$/g, ''); }).join('\n');
      }
      var blanks = g('opt-blanks').value;
      if (blanks === '1') t = t.replace(/\n{3,}/g, '\n\n');
      else if (blanks === '2') t = t.replace(/\n{4,}/g, '\n\n\n');
      if (g('opt-trailing').checked) t = t.replace(/\s+$/, '');
      outEl.value = t;
      set('cbefore', String(src.length));
      set('cafter', String(t.length));
      set('lbefore', String(linesBefore));
      set('lafter', String(t === '' ? 0 : t.split('\n').length));
    } catch (e) {
      TN.setErr(ERR, 'Cleaning failed: ' + (e && e.message ? e.message : e));
    }
  }
  try {
    TN.on(P + 'in', 'input', clean);
    OPTS.forEach(function (o) {
      var el = g(o);
      if (el) el.addEventListener('change', clean);
    });
    TN.on(P + 'copy', 'click', function () { var o = g('out'); if (o && o.value) TN.copy(o.value); });
  } catch (e) { /* never throw on load */ }
})();
