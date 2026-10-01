/* Running Log — distance/time → pace stats, weekly totals, localStorage. */
(function () {
  'use strict';

  var SLUG = 'running-log';
  var KEY = 'tn-' + SLUG + '-runs';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(runs) {
    try { localStorage.setItem(KEY, JSON.stringify(runs)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function parseTime(s) {
    var parts = s.trim().split(':').map(function (p) { return parseFloat(p); });
    if (parts.some(isNaN) || !parts.length) return null;
    var secs = 0;
    if (parts.length === 3) secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) secs = parts[0] * 60 + parts[1];
    else if (parts.length === 1) secs = parts[0];
    else return null;
    return secs > 0 ? secs : null;
  }

  function fmtPace(secPerKm) {
    var m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60);
    return m + ':' + ('0' + s).slice(-2);
  }

  function fmtDur(secs) {
    var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = Math.round(secs % 60);
    return h + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
  }

  function weekKey(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    var dow = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - dow);
    return d.toISOString().slice(0, 10);
  }

  function render() {
    var runs = load();
    var totalKm = runs.reduce(function (a, r) { return a + r.km; }, 0);
    var totalSecs = runs.reduce(function (a, r) { return a + r.secs; }, 0);
    TN.el(SLUG + '-dist').textContent = totalKm.toFixed(1);
    TN.el(SLUG + '-runs').textContent = runs.length;
    TN.el(SLUG + '-pace').textContent = totalKm > 0 ? fmtPace(totalSecs / totalKm) : '—';

    var weeks = {};
    runs.forEach(function (r) {
      var k = weekKey(r.date);
      if (!weeks[k]) weeks[k] = { km: 0, n: 0 };
      weeks[k].km += r.km; weeks[k].n++;
    });
    var wk = Object.keys(weeks).sort().reverse();
    var wbox = TN.el(SLUG + '-weeks');
    if (!wk.length) wbox.innerHTML = '<p class="muted">No runs yet.</p>';
    else {
      wbox.innerHTML = '<table style="width:100%;border-collapse:collapse"><tr>' +
        '<th style="text-align:left;padding:6px">Week of</th><th style="padding:6px">Runs</th><th style="padding:6px">Distance</th></tr>' +
        wk.map(function (k) {
          return '<tr><td style="padding:6px;border-top:1px solid rgba(255,255,255,0.08)">' + k + '</td>' +
            '<td style="padding:6px;border-top:1px solid rgba(255,255,255,0.08)">' + weeks[k].n + '</td>' +
            '<td style="padding:6px;border-top:1px solid rgba(255,255,255,0.08)">' + weeks[k].km.toFixed(1) + ' km</td></tr>';
        }).join('') + '</table>';
    }

    var list = TN.el(SLUG + '-list');
    if (!runs.length) { list.innerHTML = '<p class="muted">No runs logged yet.</p>'; return; }
    list.innerHTML = runs.slice().reverse().map(function (r) {
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>' + TN.esc(r.date) + '</strong> — ' + r.km.toFixed(1) + ' km in ' + fmtDur(r.secs) +
        ' <span class="muted">(' + fmtPace(r.secs / r.km) + '/km)</span>' +
        '<button class="btn btn-sm btn-outline" data-del="' + r.id + '" style="margin-left:8px">Delete</button></div>';
    }).join('');
    var dels = list.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
          render();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var date = TN.el(SLUG + '-date').value || todayStr();
    var km = parseFloat(TN.el(SLUG + '-km').value);
    var secs = parseTime(TN.el(SLUG + '-time').value);
    if (isNaN(km) || km <= 0) { TN.setErr(SLUG + '-error', 'Enter a valid distance.'); return; }
    if (secs === null) { TN.setErr(SLUG + '-error', 'Enter time as h:mm:ss or mm:ss.'); return; }
    var runs = load();
    runs.push({ id: Date.now(), date: date, km: km, secs: secs });
    persist(runs);
    TN.el(SLUG + '-km').value = '';
    TN.el(SLUG + '-time').value = '';
    render();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.el(SLUG + '-date').value = todayStr();
      TN.on(SLUG + '-add', 'click', add);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();