(function () {
  'use strict';
  var ERR = 'pace-calculator-error';
  var MI = 1609.344;
  function toMeters(v, unit) {
    if (unit === 'km') return v * 1000;
    if (unit === 'mi') return v * MI;
    return v;
  }
  function fromMeters(m, unit) {
    if (unit === 'km') return m / 1000;
    if (unit === 'mi') return m / MI;
    return m;
  }
  function paceMeters(unit) { return unit === 'km' ? 1000 : MI; }
  function fmtTime(sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    function p(x) { return (x < 10 ? '0' : '') + x; }
    return h > 0 ? h + ':' + p(m) + ':' + p(s) : m + ':' + p(s);
  }
  function fmtPace(secPerUnit, unit) {
    var m = Math.floor(secPerUnit / 60), s = Math.round(secPerUnit % 60);
    if (s === 60) { m++; s = 0; }
    return m + ':' + (s < 10 ? '0' : '') + s + ' min/' + (unit === 'km' ? 'km' : 'mi');
  }
  function calc() {
    if (!TN.el('pace-dist')) return;
    TN.clearErr(ERR);
    var mode = TN.el('pace-mode').value;
    var distUnit = TN.el('pace-dist-unit').value;
    var paceUnit = TN.el('pace-pace-unit').value;
    var distVal = parseFloat(TN.el('pace-dist').value);
    var th = parseFloat(TN.el('pace-time-h').value) || 0;
    var tm = parseFloat(TN.el('pace-time-m').value) || 0;
    var ts = parseFloat(TN.el('pace-time-s').value) || 0;
    var pm = parseFloat(TN.el('pace-pace-min').value);
    var ps = parseFloat(TN.el('pace-pace-sec').value) || 0;
    var timeSec = th * 3600 + tm * 60 + ts;
    var paceSecPerUnit = isNaN(pm) ? NaN : pm * 60 + ps;
    var ansEl = TN.el('pace-answer');
    var labEl = TN.el('pace-answer-label');

    if (mode === 'pace') {
      labEl.textContent = 'Pace';
      if (!(distVal > 0)) { TN.setErr(ERR, 'Enter a distance greater than 0.'); return; }
      if (!(timeSec > 0)) { TN.setErr(ERR, 'Enter a time greater than 0.'); return; }
      var distM = toMeters(distVal, distUnit);
      var perUnit = paceMeters(paceUnit);
      ansEl.textContent = fmtPace(timeSec / (distM / perUnit), paceUnit);
    } else if (mode === 'time') {
      labEl.textContent = 'Time';
      if (!(distVal > 0)) { TN.setErr(ERR, 'Enter a distance greater than 0.'); return; }
      if (!(paceSecPerUnit > 0)) { TN.setErr(ERR, 'Enter a pace greater than 0.'); return; }
      var dM = toMeters(distVal, distUnit);
      ansEl.textContent = fmtTime(dM / paceMeters(paceUnit) * paceSecPerUnit);
    } else {
      labEl.textContent = 'Distance';
      if (!(timeSec > 0)) { TN.setErr(ERR, 'Enter a time greater than 0.'); return; }
      if (!(paceSecPerUnit > 0)) { TN.setErr(ERR, 'Enter a pace greater than 0.'); return; }
      var distMeters = timeSec / paceSecPerUnit * paceMeters(paceUnit);
      var out = fromMeters(distMeters, distUnit);
      var unitLabel = distUnit === 'km' ? 'km' : distUnit === 'mi' ? 'mi' : 'm';
      ansEl.textContent = (Math.round(out * 100) / 100).toLocaleString('en-US') + ' ' + unitLabel;
    }
  }
  try {
    TN.on('pace-mode', 'change', calc);
    TN.on('pace-dist-unit', 'change', calc);
    TN.on('pace-pace-unit', 'change', calc);
    ['pace-dist', 'pace-time-h', 'pace-time-m', 'pace-time-s', 'pace-pace-min', 'pace-pace-sec'].forEach(function (id) {
      TN.on(id, 'input', calc);
    });
    TN.qsa('[data-dist]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        TN.el('pace-dist').value = btn.getAttribute('data-dist');
        TN.el('pace-dist-unit').value = btn.getAttribute('data-unit');
        calc();
      });
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
