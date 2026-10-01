(function () {
  'use strict';
  var ERR = 'hydration-reminder-error';
  var KEY = 'tn-hydration-reminder';
  var tick = null, remindLeft = 0;
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function load() { try { var s = localStorage.getItem(KEY); var o = s ? JSON.parse(s) : null; if (o && o.day === todayKey()) return o; } catch (e) {} return { day: todayKey(), total: 0, w: 0, unit: 'kg' }; }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function goalMl(st) {
    if (!(st.w > 0)) return 0;
    return st.unit === 'lb' ? st.w * 0.5 * 29.5735 : st.w * 35;
  }
  function fmtMl(ml) { return ml >= 1000 ? (Math.round(ml / 100) / 10) + ' L' : Math.round(ml) + ' ml'; }
  function render() {
    var st = load();
    var goal = goalMl(st);
    TN.el('hyd-drank').textContent = fmtMl(st.total);
    TN.el('hyd-goal').textContent = goal > 0 ? fmtMl(goal) : '–';
    TN.el('hyd-left').textContent = goal > 0 ? fmtMl(Math.max(0, goal - st.total)) : '–';
    TN.el('hyd-bar').value = goal > 0 ? Math.min(100, st.total / goal * 100) : 0;
    if (remindLeft > 0 && goal > 0) {
      var m = Math.floor(remindLeft / 60), s = remindLeft % 60;
      TN.el('hyd-detail').textContent = 'Next reminder in ' + m + 'm ' + (s < 10 ? '0' : '') + s + 's.';
    } else if (goal > 0 && st.total >= goal) {
      TN.el('hyd-detail').textContent = 'Goal reached! Nice work staying hydrated.';
    } else if (goal > 0) {
      TN.el('hyd-detail').textContent = 'Log each glass as you drink.';
    }
  }
  function bump(ms) {
    var st = load();
    st.total += ms;
    save(st);
    remindLeft = parseInt(TN.el('hyd-every').value, 10) * 60;
    render();
  }
  function tickFn() {
    var st = load();
    if (goalMl(st) <= 0) return;
    if (remindLeft > 0) {
      remindLeft -= 1;
      if (remindLeft === 0) {
        TN.el('hyd-detail').textContent = 'Time to drink water! Log a glass above.';
        try {
          var C = window.AudioContext || window.webkitAudioContext;
          if (C) { var ctx = new C(); var o = ctx.createOscillator(); o.connect(ctx.destination); o.frequency.value = 660; o.start(); o.stop(ctx.currentTime + 0.3); setTimeout(function () { try { ctx.close(); } catch (e) {} }, 500); }
        } catch (e) {}
        remindLeft = parseInt(TN.el('hyd-every').value, 10) * 60;
      }
    }
    render();
  }
  function resetDay() { save({ day: todayKey(), total: 0, w: load().w, unit: load().unit }); remindLeft = 0; render(); }
  try {
    TN.on('hyd-250', 'click', function () { bump(250); });
    TN.on('hyd-500', 'click', function () { bump(500); });
    TN.on('hyd-reset', 'click', resetDay);
    TN.on('hyd-weight', 'input', function () {
      TN.clearErr(ERR);
      var w = parseFloat(TN.el('hyd-weight').value);
      if (isNaN(w) || w < 0) { TN.setErr(ERR, 'Enter a valid weight (0 or more).'); return; }
      var st = load(); st.w = w; st.unit = TN.el('hyd-unit').value; save(st); render();
    });
    TN.on('hyd-unit', 'change', function () { var st = load(); st.unit = TN.el('hyd-unit').value; save(st); render(); });
    TN.on('hyd-every', 'change', function () { remindLeft = parseInt(TN.el('hyd-every').value, 10) * 60; render(); });
    var st0 = load();
    if (st0.w > 0) { TN.el('hyd-weight').value = st0.w; TN.el('hyd-unit').value = st0.unit; }
    remindLeft = parseInt(TN.el('hyd-every').value, 10) * 60;
    if (tick) clearInterval(tick);
    tick = setInterval(tickFn, 1000);
    render();
  } catch (e) { /* never throw on load */ }
})();