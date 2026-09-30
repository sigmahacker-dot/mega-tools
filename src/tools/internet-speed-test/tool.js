(function () {
  'use strict';
  var P = 'internet-speed-test-';
  function g(id) { return document.getElementById(P + id); }

  var startBtn = g('start');
  if (!startBtn) return;

  var RUNS = 3, running = false;

  function setStatus(t) { var el = g('status'); if (el) el.textContent = t || ''; }
  function setBar(pct) { var el = g('bar'); if (el) el.style.width = Math.max(0, Math.min(100, pct)) + '%'; }

  function fmtTime(secs) {
    if (secs < 1) return Math.round(secs * 1000) + ' ms';
    return secs.toFixed(1) + ' s';
  }

  async function downloadOnce(runNo) {
    var url = '/speedtest.bin?cb=' + Date.now() + '_' + runNo; // cache-busting
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error('server returned HTTP ' + resp.status);
    var total = parseInt(resp.headers.get('content-length') || '0', 10);
    var loaded = 0;
    if (resp.body && typeof resp.body.getReader === 'function') {
      var reader = resp.body.getReader();
      for (;;) {
        var chunk = await reader.read();
        if (chunk.done) break;
        loaded += chunk.value.length;
        if (total > 0) {
          setBar(((runNo - 1) / RUNS + (loaded / total) / RUNS) * 100);
        } else {
          setStatus('Run ' + runNo + ' of ' + RUNS + ' — downloaded ' + (loaded / 1048576).toFixed(1) + ' MB…');
        }
      }
    } else {
      var buf = await resp.arrayBuffer();
      loaded = buf.byteLength;
      setBar((runNo / RUNS) * 100);
    }
    var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var secs = (t1 - t0) / 1000;
    if (secs <= 0 || loaded <= 0) throw new Error('no data was transferred');
    return { mbps: (loaded * 8) / (secs * 1e6), secs: secs, bytes: loaded };
  }

  async function run() {
    if (running) return;
    if (typeof fetch !== 'function') {
      TN.setErr(P + 'error', 'Your browser does not support the fetch API needed for this test.');
      return;
    }
    running = true;
    startBtn.disabled = true;
    TN.clearErr(P + 'error');
    TN.show(P + 'progress');
    TN.hide(P + 'results');
    setBar(0);
    var rows = g('rows');
    if (rows) rows.innerHTML = '';

    try {
      var speeds = [];
      for (var i = 1; i <= RUNS; i++) {
        setStatus('Run ' + i + ' of ' + RUNS + ' — downloading…');
        var r = await downloadOnce(i);
        speeds.push(r.mbps);
        if (rows) {
          var tr = document.createElement('tr');
          var c1 = document.createElement('td'); c1.textContent = 'Run ' + i;
          var c2 = document.createElement('td'); c2.textContent = r.mbps.toFixed(1);
          var c3 = document.createElement('td'); c3.textContent = fmtTime(r.secs);
          tr.appendChild(c1); tr.appendChild(c2); tr.appendChild(c3);
          rows.appendChild(tr);
        }
      }
      var avg = speeds.reduce(function (a, b) { return a + b; }, 0) / speeds.length;
      var best = Math.max.apply(null, speeds);
      var avgEl = g('avg'); if (avgEl) avgEl.textContent = avg.toFixed(1);
      var bestEl = g('best'); if (bestEl) bestEl.textContent = best.toFixed(1);
      TN.show(P + 'results');
      setBar(100);
      setStatus('Done — average of ' + RUNS + ' runs. Remember: approximate, real-world speeds vary.');
    } catch (e) {
      TN.setErr(P + 'error', 'Speed test failed (' + (e && e.message ? e.message : 'network error') + '). The test file may be temporarily unavailable — please try again later.');
      setStatus('');
      TN.hide(P + 'progress');
    }
    running = false;
    startBtn.disabled = false;
  }

  TN.on(startBtn, 'click', run);
})();
