/* Crypto DCA calculator — dynamic buy rows, totals, P/L at current price. */
(function () {
  'use strict';
  var SLUG = 'crypto-dca-calculator';
  var rowCount = 0;
  function $(id) { return document.getElementById(id); }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function parseV(el) { var v = parseFloat(String(el.value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function addRow(date, amt, price) {
    rowCount++;
    var i = rowCount;
    var tr = document.createElement('tr');
    tr.id = SLUG + '-row-' + i;
    tr.innerHTML =
      '<td><input class="input" id="' + SLUG + '-date-' + i + '" type="date" value="' + (date || '') + '" style="min-width:130px"></td>' +
      '<td><input class="input" id="' + SLUG + '-amt-' + i + '" type="number" min="0" step="any" value="' + (amt == null ? '' : amt) + '" placeholder="100"></td>' +
      '<td><input class="input" id="' + SLUG + '-price-' + i + '" type="number" min="0" step="any" value="' + (price == null ? '' : price) + '" placeholder="50000"></td>' +
      '<td id="' + SLUG + '-coins-' + i + '" class="muted">—</td>' +
      '<td><button class="btn btn-outline" type="button" id="' + SLUG + '-del-' + i + '" aria-label="Remove row">✕</button></td>';
    $(SLUG + '-table').appendChild(tr);
    TN.on(SLUG + '-del-' + i, 'click', function () { tr.remove(); calc(); });
    var a = $(SLUG + '-amt-' + i), p = $(SLUG + '-price-' + i);
    a.addEventListener('input', calc); p.addEventListener('input', calc);
    return i;
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var curEl = $(SLUG + '-current');
    var cur = parseV(curEl);
    var invested = 0, coins = 0, valid = true;
    var rows = document.querySelectorAll('tr[id^="' + SLUG + '-row-"]');
    for (var k = 0; k < rows.length; k++) {
      var rid = rows[k].id.replace(SLUG + '-row-', '');
      var a = parseV($(SLUG + '-amt-' + rid)), p = parseV($(SLUG + '-price-' + rid));
      var cell = $(SLUG + '-coins-' + rid);
      if (isNaN(a) || isNaN(p) || a <= 0 || p <= 0) { cell.textContent = '—'; continue; }
      var c = a / p;
      invested += a; coins += c;
      cell.textContent = c.toFixed(8);
    }
    if (rows.length === 0 || invested <= 0) {
      TN.setErr(SLUG + '-error', 'Add at least one buy with a positive amount and price.');
      return;
    }
    if (isNaN(cur) || cur < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid current price.');
      return;
    }
    var avg = invested / coins;
    var value = coins * cur;
    var pl = value - invested;
    $(SLUG + '-invested').textContent = money(invested);
    $(SLUG + '-coins').textContent = coins.toFixed(8);
    $(SLUG + '-avg').textContent = money(avg);
    $(SLUG + '-value').textContent = money(value);
    $(SLUG + '-pl').textContent = money(pl);
    $(SLUG + '-plpct').textContent = (pl / invested * 100).toFixed(2) + '%';
  }
  try {
    TN.on(SLUG + '-add', 'click', function () { addRow('', '', ''); });
    TN.on(SLUG + '-calc', 'click', calc);
    curElInit();
    addRow('2024-01-15', 500, 42000);
    addRow('2024-04-15', 500, 65000);
    addRow('2024-07-15', 500, 58000);
    calc();
  } catch (e) { /* never throw on load */ }
  function curElInit() {
    $(SLUG + '-current').addEventListener('input', calc);
  }
})();