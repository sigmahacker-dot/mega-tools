/* Daily Screen Time Log — log entries, daily totals, 7-day bar chart, localStorage. */
(function () {
  'use strict';
  var SLUG = 'daily-screen-time-log';
  var KEY = 'tn_screentime_v1';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var entries = [];

  var COLORS = { Social: '#e53935', Work: '#1e88e5', Entertainment: '#8e24aa', Games: '#43a047', News: '#fb8c00', Other: '#757575' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      entries = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(entries)) entries = [];
    } catch (e) { entries = []; }
  }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch (e) {} }

  function fmtH(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return h ? h + 'h ' + m + 'm' : m + 'm';
  }

  function render() {
    var tk = todayKey();
    var todayTotal = 0;
    var byCat = {};
    entries.forEach(function (e) {
      if (e.date === tk) {
        todayTotal += e.mins;
        byCat[e.cat] = (byCat[e.cat] || 0) + e.mins;
      }
    });
    $('total').textContent = fmtH(todayTotal);

    // 7-day chart ending today
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var k = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
      var tot = 0;
      entries.forEach(function (e) { if (e.date === k) tot += e.mins; });
      days.push({ key: k, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), total: tot });
    }
    var max = Math.max.apply(null, days.map(function (x) { return x.total; }).concat([1]));
    var avg = Math.round(days.reduce(function (a, x) { return a + x.total; }, 0) / 7);
    $('avg').textContent = fmtH(avg);
    var ch = $('chart');
    ch.innerHTML = '';
    days.forEach(function (x) {
      var h = Math.max(3, Math.round(x.total / max * 110));
      var bar = document.createElement('div');
      bar.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0';
      bar.innerHTML = '<div title="' + x.total + ' min" style="width:70%;max-width:34px;height:' + h + 'px;background:' +
        (x.key === tk ? '#1e88e5' : '#90caf9') + ';border-radius:4px 4px 0 0"></div>' +
        '<div class="muted" style="font-size:11px;margin-top:4px">' + esc(x.label) + '</div>' +
        '<div class="muted" style="font-size:10px">' + (x.total ? x.total + 'm' : '') + '</div>';
      ch.appendChild(bar);
    });

    // entries list (today, newest first)
    var list = $('list');
    var todays = entries.filter(function (e) { return e.date === tk; }).reverse();
    if (!todays.length) {
      list.innerHTML = '<p class="muted">Nothing logged today yet.</p>';
    } else {
      var html = '';
      todays.forEach(function (e) {
        html += '<div style="display:flex;align-items:center;gap:10px;border:1px solid #e0e0e0;border-radius:8px;padding:6px 12px;margin-bottom:6px">' +
          '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + (COLORS[e.cat] || '#757575') + '"></span>' +
          '<span style="flex:1"><strong>' + esc(e.cat) + '</strong></span>' +
          '<span class="code">' + e.mins + ' min</span>' +
          '<button class="btn btn-outline st-del" data-id="' + e.id + '" style="padding:4px 10px" aria-label="Delete entry">✕</button></div>';
      });
      list.innerHTML = html;
      TN.qsa('.st-del', list).forEach(function (btn) {
        btn.addEventListener('click', function () {
          entries = entries.filter(function (e) { return String(e.id) !== btn.getAttribute('data-id'); });
          save(); render();
        });
      });
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var date = $('date').value || todayKey();
    var cat = $('cat').value;
    var mins = parseInt($('mins').value, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { TN.setErr(SLUG + '-error', 'Please pick a valid date.'); return; }
    if (!(mins >= 1 && mins <= 1440)) { TN.setErr(SLUG + '-error', 'Minutes must be between 1 and 1440.'); return; }
    entries.push({ id: Date.now() + '' + Math.floor(Math.random() * 1000), date: date, cat: cat, mins: mins });
    $('mins').value = '';
    save(); render();
  }

  try {
    load();
    $('date').value = todayKey();
    render();
    TN.on(SLUG + '-add', 'click', add);
  } catch (e) { /* never throw on load */ }
})();
