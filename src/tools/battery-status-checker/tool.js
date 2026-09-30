(function () {
  'use strict';
  var P = 'battery-status-checker-';
  function g(id) { return document.getElementById(P + id); }
  function set(id, val) { var el = g(id); if (el) el.textContent = val; }

  function fmtTime(sec) {
    if (typeof sec !== 'number' || !isFinite(sec) || sec < 0) return 'Unknown';
    var h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    if (m === 60) { h++; m = 0; }
    return h + 'h ' + m + 'm';
  }

  function update(b) {
    var pct = Math.round(b.level * 100);
    set('level', pct + '%');
    set('charging', b.charging ? 'Yes' : 'No');
    var bar = g('bar'); if (bar) bar.style.width = pct + '%';
    var label = g('time-label');
    if (b.charging) {
      if (label) label.textContent = 'Time until full';
      set('time', fmtTime(b.chargingTime));
    } else {
      if (label) label.textContent = 'Time remaining';
      set('time', fmtTime(b.dischargingTime));
    }
  }

  function unsupported() {
    TN.show(P + 'unsupported');
    TN.hide(P + 'out');
  }

  try {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator) || typeof navigator.getBattery !== 'function') {
      unsupported();
      return;
    }
    navigator.getBattery().then(function (b) {
      if (!b) { unsupported(); return; }
      TN.hide(P + 'unsupported');
      TN.show(P + 'out');
      update(b);
      var evts = ['levelchange', 'chargingchange', 'dischargingtimechange', 'chargingtimechange'];
      evts.forEach(function (ev) {
        try { b.addEventListener(ev, function () { update(b); }); } catch (e) {}
      });
    }).catch(function () {
      TN.setErr(P + 'error', 'Could not read battery status — the browser blocked access.');
    });
  } catch (e) {
    unsupported();
  }
})();
