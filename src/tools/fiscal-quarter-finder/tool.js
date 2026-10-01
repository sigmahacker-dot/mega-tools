(function () {
  'use strict';
  var P = 'fiscal-quarter-finder-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function fmtD(d) { return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  function calc() {
    if (!g('date')) return;
    TN.clearErr(ERR);
    var v = g('date').value;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) {
      set('fy', '–'); set('q', '–'); set('left', '–');
      g('body').innerHTML = '<tr><td colspan="2" class="muted">Pick a date to find its fiscal quarter.</td></tr>';
      return;
    }
    var d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    var sm = parseInt(g('start').value, 10); /* FY start month 0-11 */
    var mo = d.getMonth(), yr = d.getFullYear();
    var fyEnd = mo >= sm ? yr + 1 : yr;       /* FY labelled by ending year */
    var fyStartYear = fyEnd - 1;
    var q = Math.floor(((mo - sm + 12) % 12) / 3) + 1;
    var qsMonth = (sm + (q - 1) * 3) % 12;
    var qsYear = fyStartYear + (qsMonth < sm ? 1 : 0);
    var qStart = new Date(qsYear, qsMonth, 1);
    var qEnd = new Date(qsYear, qsMonth + 3, 0); /* last day of 3rd month */
    var totalDays = Math.round((qEnd - qStart) / 86400000) + 1;
    var elapsed = Math.round((d - qStart) / 86400000) + 1;
    var left = totalDays - elapsed;
    set('fy', 'FY' + fyEnd);
    set('q', 'Q' + q);
    set('left', String(left));
    var rows = [
      ['Date', fmtD(d)],
      ['Fiscal year', 'FY' + fyEnd + ' (' + MONTHS[sm] + ' ' + fyStartYear + ' – ' + MONTHS[(sm + 11) % 12] + ' ' + fyEnd + ')'],
      ['Quarter', 'Q' + q + ' of FY' + fyEnd],
      ['Quarter starts', fmtD(qStart)],
      ['Quarter ends', fmtD(qEnd)],
      ['Day of quarter', elapsed + ' of ' + totalDays]
    ];
    var html = '';
    rows.forEach(function (r) {
      html += '<tr><td>' + TN.esc(r[0]) + '</td><td>' + TN.esc(r[1]) + '</td></tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    var sel = g('start');
    MONTHS.forEach(function (name, i) {
      var o = document.createElement('option');
      o.value = String(i); o.textContent = name;
      sel.appendChild(o);
    });
    sel.value = '0';
    var t = new Date();
    g('date').value = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    TN.on(P + 'date', 'input', calc);
    TN.on(P + 'date', 'change', calc);
    TN.on(P + 'start', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
