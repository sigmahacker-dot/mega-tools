(function () {
  'use strict';
  var ERR = 'intermittent-fasting-timer-error';
  var KEY = 'tn-intermittent-fasting-timer';
  var tick = null;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ms) {
    ms = Math.max(0, ms);
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return pad(h) + ':' + pad(m) + ':' + pad(sec);
  }
  function fmtTime(t) { try { return new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }
  function load() { try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function save(st) { try { if (st) localStorage.setItem(KEY, JSON.stringify(st)); else localStorage.removeItem(KEY); } catch (e) {} }
  function render() {
    var st = load();
    if (!st) {
      TN.el('if-status').textContent = 'Not fasting';
      TN.el('if-remaining').textContent = '–';
      TN.el('if-elapsed').textContent = '–';
      TN.el('if-bar').value = 0;
      TN.el('if-detail').textContent = 'No active fast. Choose a plan and press Start fasting.';
      return;
    }
    var now = Date.now();
    var fastMs = st.fastHrs * 3600000;
    var elapsed = now - st.start;
    if (elapsed >= 24 * 3600000) { save(null); render(); return; }
    if (elapsed < fastMs) {
      TN.el('if-status').textContent = 'FASTING';
      TN.el('if-remaining-label').textContent = 'Fasting remaining';
      TN.el('if-remaining').textContent = fmt(fastMs - elapsed);
      TN.el('if-elapsed').textContent = fmt(elapsed);
      TN.el('if-bar').value = Math.min(100, elapsed / fastMs * 100);
      TN.el('if-detail').textContent = 'Eating window opens at ' + fmtTime(st.start + fastMs) + '. Stay hydrated!';
    } else {
      var windowMs = (24 - st.fastHrs) * 3600000;
      var eatElapsed = elapsed - fastMs;
      TN.el('if-status').textContent = 'EATING WINDOW';
      TN.el('if-remaining-label').textContent = 'Window remaining';
      TN.el('if-remaining').textContent = fmt(windowMs - eatElapsed);
      TN.el('if-elapsed').textContent = fmt(elapsed);
      TN.el('if-bar').value = 100;
      TN.el('if-detail').textContent = 'Fast complete! Window closes at ' + fmtTime(st.start + 24 * 3600000) + '.';
    }
  }
  function start() {
    TN.clearErr(ERR);
    var plan = parseInt(TN.el('if-plan').value, 10);
    save({ start: Date.now(), fastHrs: plan });
    render();
  }
  function stop() { save(null); render(); }
  try {
    TN.on('if-start', 'click', start);
    TN.on('if-stop', 'click', stop);
    TN.on('if-plan', 'change', function () { var st = load(); if (!st) render(); });
    if (tick) clearInterval(tick);
    tick = setInterval(render, 1000);
    render();
  } catch (e) { /* never throw on load */ }
})();