(function () {
  'use strict';
  var P = 'home-maintenance-calendar-', ERR = P + 'error';
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTHLY = ['Test smoke & CO detectors', 'Check HVAC filter; replace if dirty', 'Inspect fire extinguisher pressure', 'Clean range hood filter'];
  var SEASONAL = {
    0: ['Check attic insulation & ventilation', 'Inspect pipes for freeze protection'],
    1: ['Clean dryer vent hose', 'Check sump pump operation'],
    2: ['Service air conditioner before summer', 'Inspect roof for winter damage', 'Clean gutters & downspouts'],
    3: ['Fertilize lawn', 'Check outdoor faucets for leaks', 'Service lawn mower'],
    4: ['Inspect deck/patio; reseal if needed', 'Check window screens; repair tears', 'Flush water heater sediment'],
    5: ['Clean refrigerator coils', 'Check washing machine hoses', 'Trim trees away from house'],
    6: ['Deep-clean garbage disposal', 'Inspect attic for pests', 'Check driveway for cracks'],
    7: ['Service heating system before fall', 'Seal windows & doors (weatherstrip)', 'Clean chimney flue inspection booking'],
    8: ['Clean gutters & downspouts', 'Drain outdoor faucets; store hoses', 'Check roof before rainy season'],
    9: ['Test heating system', 'Reverse ceiling fans to clockwise', 'Check attic insulation'],
    10: ['Inspect fireplace & chimney', 'Protect pipes from freezing', 'Check emergency kit supplies'],
    11: ['Deep-clean oven', 'Check basement for moisture', 'Test GFCI outlets']
  };
  var EXTRAS = {
    pool: { months: [4, 5, 6, 7, 8], task: 'Pool: check chemicals, clean filter, inspect pump' },
    fire: { months: [9, 10, 11, 0, 1], task: 'Fireplace: professional chimney sweep & inspection' },
    garden: { months: [2, 3, 4, 8, 9], task: 'Garden: prune, mulch, check irrigation lines' }
  };
  function g(id) { return TN.el(P + id); }
  function lsKey(start) { return 'tn-home-maintenance-calendar-' + start; }
  function loadDone(start) {
    try {
      var raw = localStorage.getItem(lsKey(start));
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveDone(start, done) {
    try { localStorage.setItem(lsKey(start), JSON.stringify(done)); } catch (e) { /* unavailable */ }
  }
  function gen() {
    try {
      TN.clearErr(ERR);
      var start = g('start').value;
      if (!start) { TN.setErr(ERR, 'Pick a start month.'); return; }
      var sp = start.split('-');
      var y = parseInt(sp[0], 10), m0 = parseInt(sp[1], 10) - 1;
      var extras = [];
      if (g('pool').checked) extras.push('pool');
      if (g('fire').checked) extras.push('fire');
      if (g('garden').checked) extras.push('garden');
      var done = loadDone(start);
      var wrap = g('months');
      var html = '', total = 0, doneCount = 0, mi;
      for (mi = 0; mi < 12; mi++) {
        var m = (m0 + mi) % 12;
        var yy = y + Math.floor((m0 + mi) / 12);
        var tasks = MONTHLY.concat(SEASONAL[m] || []);
        extras.forEach(function (ex) {
          if (EXTRAS[ex].months.indexOf(m) >= 0) tasks.push(EXTRAS[ex].task);
        });
        html += '<div class="result"><h3>' + MONTHS[m] + ' ' + yy + '</h3><ul style="list-style:none;padding:0">';
        tasks.forEach(function (t, ti) {
          var key = mi + ':' + ti;
          var chk = done[key] ? ' checked' : '';
          if (done[key]) doneCount++;
          total++;
          html += '<li><label class="checkbox-row"><input type="checkbox" data-hm="' + key + '"' + chk + '> <span>' + TN.esc(t) + '</span></label></li>';
        });
        html += '</ul></div>';
      }
      wrap.innerHTML = html;
      TN.show(P + 'out');
      g('done').textContent = String(doneCount);
      g('total').textContent = String(total);
      var boxes = wrap.querySelectorAll('[data-hm]');
      for (var i = 0; i < boxes.length; i++) {
        (function (b) {
          TN.on(b, 'change', function () {
            var d = loadDone(start);
            if (b.checked) d[b.getAttribute('data-hm')] = 1; else delete d[b.getAttribute('data-hm')];
            saveDone(start, d);
            var c = 0;
            for (var k in d) if (d.hasOwnProperty(k)) c++;
            g('done').textContent = String(c);
          });
        })(boxes[i]);
      }
    } catch (e) { TN.setErr(ERR, e.message || 'Could not generate the calendar.'); }
  }
  try {
    if (!TN.el(P + 'gen')) return;
    var n = new Date();
    g('start').value = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
    TN.on(P + 'gen', 'click', gen);
  } catch (e) { /* never throw on load */ }
})();
