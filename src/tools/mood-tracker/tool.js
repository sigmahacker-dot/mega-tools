/* Mood Tracker — daily 1-5 log with 30-day canvas bar chart. */
(function () {
  'use strict';

  var SLUG = 'mood-tracker';
  var KEY = 'tn-' + SLUG + '-log';
  var picked = 0;

  var COLORS = { 1: '#e74c3c', 2: '#e67e22', 3: '#f1c40f', 4: '#2ecc71', 5: '#27ae60' };

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '{}');
      return (arr && typeof arr === 'object') ? arr : {};
    } catch (e) { return {}; }
  }

  function saveLog(log) {
    try { localStorage.setItem(KEY, JSON.stringify(log)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function last30() {
    var days = [];
    var d = new Date();
    for (var i = 29; i >= 0; i--) {
      var t = new Date(d.getTime() - i * 86400000);
      days.push(t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2));
    }
    return days;
  }

  function pickButtons() {
    var btns = TN.el(SLUG + '-pick').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          picked = parseInt(b.getAttribute('data-m'), 10);
          for (var j = 0; j < btns.length; j++) btns[j].classList.remove('btn');
          b.classList.add('btn');
          TN.clearErr(SLUG + '-error');
        });
      })(btns[i]);
    }
  }

  function drawChart(log, days) {
    var cv = TN.el(SLUG + '-chart');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    var pad = 30, bw = (W - pad * 2) / 30;
    for (var g = 1; g <= 5; g++) {
      var y = H - pad - (g / 5) * (H - pad * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '12px sans-serif';
      ctx.fillText(String(g), 8, y + 4);
    }
    days.forEach(function (day, i) {
      var m = log[day] && log[day].m;
      var x = pad + i * bw + bw * 0.15;
      var w = bw * 0.7;
      if (m) {
        var h = (m / 5) * (H - pad * 2);
        var y2 = H - pad - h;
        ctx.fillStyle = COLORS[m];
        ctx.fillRect(x, y2, w, h);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '10px sans-serif';
        ctx.fillText(day.slice(8), x, H - 8);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x, H - pad - 3, w, 3);
      }
    });
  }

  function renderStats(log, days) {
    var box = TN.el(SLUG + '-stats');
    if (!box) return;
    var vals = days.map(function (d) { return log[d] && log[d].m; }).filter(Boolean);
    var avg = vals.length ? (vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) : 0;
    var best = vals.length ? Math.max.apply(null, vals) : 0;
    box.innerHTML =
      stat('Entries', vals.length + '/30') +
      stat('Average', vals.length ? avg.toFixed(1) : '—') +
      stat('Best mood', best ? best + '/5' : '—');
    function stat(l, v) {
      return '<div class="stat-card"><div class="v">' + TN.esc(String(v)) + '</div><div class="l">' + TN.esc(l) + '</div></div>';
    }
  }

  function refresh() {
    var log = load();
    var days = last30();
    drawChart(log, days);
    renderStats(log, days);
  }

  function saveMood() {
    TN.clearErr(SLUG + '-error');
    if (!picked) { TN.setErr(SLUG + '-error', 'Pick a mood from 1 to 5 first.'); return; }
    var log = load();
    log[todayStr()] = { m: picked, note: TN.el(SLUG + '-note').value.trim() };
    saveLog(log);
    TN.el(SLUG + '-note').value = '';
    refresh();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-pick')) return;
      TN.el(SLUG + '-today').textContent = todayStr();
      pickButtons();
      TN.on(SLUG + '-save', 'click', saveMood);
      refresh();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();