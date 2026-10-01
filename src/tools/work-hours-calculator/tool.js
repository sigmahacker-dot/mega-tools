(function () {
  'use strict';
  var ERR = 'work-hours-calculator-error';
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function toMin(v) {
    if (!v) return null;
    var m = /^(\d{1,2}):(\d{2})$/.exec(v);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function fmtH(mins) {
    var h = Math.floor(mins / 60);
    var m = Math.round(mins % 60);
    if (m === 60) { h++; m = 0; }
    return h + 'h ' + ('0' + m).slice(-2) + 'm';
  }

  function buildRows() {
    var c = TN.el('work-hours-calculator-rows');
    if (!c) return;
    c.innerHTML = '';
    DAYS.forEach(function (day, i) {
      var wrap = document.createElement('div');
      wrap.className = 'grid2';
      wrap.style.marginBottom = '4px';
      var lab = document.createElement('div');
      lab.className = 'field';
      var strong = document.createElement('label');
      strong.textContent = day;
      lab.appendChild(strong);
      var row = document.createElement('div');
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '1fr 1fr 1fr';
      row.style.gap = '8px';
      var tin = document.createElement('input');
      tin.type = 'time'; tin.className = 'input'; tin.id = 'work-hours-calculator-in-' + i;
      tin.setAttribute('aria-label', day + ' clock in');
      var tout = document.createElement('input');
      tout.type = 'time'; tout.className = 'input'; tout.id = 'work-hours-calculator-out-' + i;
      tout.setAttribute('aria-label', day + ' clock out');
      var brk = document.createElement('input');
      brk.type = 'number'; brk.className = 'input'; brk.id = 'work-hours-calculator-break-' + i;
      brk.min = '0'; brk.placeholder = 'Break min';
      brk.setAttribute('aria-label', day + ' unpaid break minutes');
      row.appendChild(tin); row.appendChild(tout); row.appendChild(brk);
      var spacer = document.createElement('div');
      wrap.appendChild(lab); wrap.appendChild(row);
      c.appendChild(wrap);
      void spacer;
    });
  }

  function calc() {
    TN.clearErr(ERR);
    try {
      var perDay = [];
      var total = 0;
      for (var i = 0; i < 7; i++) {
        var tin = TN.el('work-hours-calculator-in-' + i).value;
        var tout = TN.el('work-hours-calculator-out-' + i).value;
        var brkS = TN.el('work-hours-calculator-break-' + i).value.trim();
        if (!tin && !tout) { perDay.push(null); continue; }
        var inM = toMin(tin);
        var outM = toMin(tout);
        if (inM === null || outM === null) throw new Error(DAYS[i] + ': enter both clock-in and clock-out, or leave the day blank.');
        if (outM <= inM) outM += 24 * 60; // overnight
        var brk = brkS === '' ? 0 : Number(brkS);
        if (!isFinite(brk) || brk < 0) throw new Error(DAYS[i] + ': break minutes must be 0 or more.');
        var mins = outM - inM - brk;
        if (mins < 0) throw new Error(DAYS[i] + ': break is longer than the shift.');
        perDay.push(mins);
        total += mins;
      }
      if (!perDay.some(function (v) { return v !== null; })) throw new Error('Enter at least one day.');

      var body = TN.el('work-hours-calculator-body');
      body.innerHTML = '';
      perDay.forEach(function (mins, i) {
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.scope = 'row';
        th.textContent = DAYS[i];
        var td = document.createElement('td');
        td.textContent = mins === null ? '—' : fmtH(mins);
        tr.appendChild(th); tr.appendChild(td);
        body.appendChild(tr);
      });

      var ot = Math.max(0, total - 40 * 60);
      TN.el('work-hours-calculator-total').textContent = fmtH(total);
      TN.el('work-hours-calculator-ot').textContent = ot > 0 ? fmtH(ot) : '0h 00m';
      var rateS = TN.el('work-hours-calculator-rate').value.trim();
      if (rateS === '') {
        TN.el('work-hours-calculator-pay').textContent = '–';
      } else {
        var rate = Number(rateS);
        if (!isFinite(rate) || rate < 0) throw new Error('Hourly rate must be 0 or more.');
        TN.el('work-hours-calculator-pay').textContent = (total / 60 * rate).toFixed(2);
      }
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    buildRows();
    TN.on('work-hours-calculator-go', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
