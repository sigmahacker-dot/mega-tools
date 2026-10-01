/* Resting heart rate tracker: log morning RHR -> 7-day avg, trend, interpretation. */
(function () {
  'use strict';
  var SLUG = 'resting-heart-rate-tracker';
  var KEY = SLUG + '-data';
  function $(id) { return document.getElementById(id); }
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(d) ? d : []; }
    catch (e) { return []; }
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function err(m) { $(SLUG + '-error').textContent = m; }
  function avg(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function level(bpm) {
    if (bpm < 60) return 'Athletic';
    if (bpm < 70) return 'Good';
    if (bpm < 80) return 'Average';
    if (bpm <= 100) return 'Below average';
    return 'High — consider a check-up';
  }
  function render() {
    var rows = load().slice().sort(function (a, b) { return a.at - b.at; });
    var box = $(SLUG + '-list');
    if (!rows.length) {
      box.innerHTML = '<p class="muted">No readings yet — log your first morning measurement.</p>';
      $(SLUG + '-avg').textContent = '–';
      $(SLUG + '-trend').textContent = '–';
      $(SLUG + '-level').textContent = '–';
      return;
    }
    var cutoff = Date.now() - 7 * 86400000;
    var recent = rows.filter(function (r) { return r.at >= cutoff; }).map(function (r) { return r.bpm; });
    var a7 = recent.length ? avg(recent) : avg(rows.slice(-7).map(function (r) { return r.bpm; }));
    $(SLUG + '-avg').textContent = Math.round(a7) + ' bpm';
    var trend = '–';
    if (rows.length >= 4) {
      var last3 = avg(rows.slice(-3).map(function (r) { return r.bpm; }));
      var prev = avg(rows.slice(-6, -3).map(function (r) { return r.bpm; }));
      var d = last3 - prev;
      trend = d <= -2 ? '↘ Improving' : d >= 2 ? '↗ Rising' : '→ Stable';
    }
    $(SLUG + '-trend').textContent = trend;
    $(SLUG + '-level').textContent = level(a7);
    var html = '<table class="data"><thead><tr><th>Date</th><th>BPM</th><th></th></tr></thead><tbody>';
    rows.slice().reverse().forEach(function (r) {
      html += '<tr><td>' + new Date(r.at).toLocaleDateString() + '</td><td>' + r.bpm +
        '</td><td><button class="btn btn-outline" data-del="' + r.at + '" style="padding:4px 10px">Delete</button></td></tr>';
    });
    html += '</tbody></table>';
    box.innerHTML = html;
    box.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var at = parseFloat(b.getAttribute('data-del'));
        save(load().filter(function (r) { return r.at !== at; }));
        render();
      });
    });
  }
  function add() {
    err('');
    var v = $(SLUG + '-date').value;
    var bpm = parseInt($(SLUG + '-bpm').value, 10);
    if (!v) { err('Pick the measurement date.'); return; }
    if (isNaN(bpm) || bpm < 25 || bpm > 220) { err('Enter a BPM between 25 and 220.'); return; }
    var at = new Date(v + 'T00:00:00').getTime();
    var rows = load().filter(function (r) { return r.at !== at; });
    rows.push({ at: at, bpm: bpm });
    save(rows);
    $(SLUG + '-bpm').value = '';
    render();
  }
  try {
    $(SLUG + '-add').addEventListener('click', add);
    render();
  } catch (e) { /* never throw on load */ }
})();
