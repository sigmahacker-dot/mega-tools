/* Period tracker lite: log starts -> avg cycle, next period, fertile window. */
(function () {
  'use strict';
  var SLUG = 'period-tracker-lite';
  var KEY = SLUG + '-data';
  function $(id) { return document.getElementById(id); }
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(d) ? d : []; }
    catch (e) { return []; }
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function err(m) { $(SLUG + '-error').textContent = m; }
  function fdate(ms) {
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function render() {
    var dates = load().slice().sort(function (a, b) { return a - b; });
    var box = $(SLUG + '-list');
    if (!dates.length) {
      box.innerHTML = '<p class="muted">No periods logged yet.</p>';
      $(SLUG + '-out').classList.add('hidden');
      return;
    }
    var html = '<table class="data"><thead><tr><th>#</th><th>Start date</th><th>Cycle length</th><th></th></tr></thead><tbody>';
    dates.forEach(function (ms, i) {
      var gap = i === 0 ? '–' : Math.round((ms - dates[i - 1]) / 86400000) + ' days';
      html += '<tr><td>' + (i + 1) + '</td><td>' + fdate(ms) + '</td><td>' + gap +
        '</td><td><button class="btn btn-outline" data-del="' + ms + '" style="padding:4px 10px">Delete</button></td></tr>';
    });
    html += '</tbody></table>';
    box.innerHTML = html;
    box.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ms = parseFloat(b.getAttribute('data-del'));
        save(load().filter(function (d) { return d !== ms; }));
        render();
      });
    });
    if (dates.length >= 2) {
      var gaps = [];
      for (var i = 1; i < dates.length; i++) gaps.push((dates[i] - dates[i - 1]) / 86400000);
      var avg = gaps.reduce(function (a, b) { return a + b; }, 0) / gaps.length;
      var last = dates[dates.length - 1];
      var next = last + avg * 86400000;
      var ovu = next - 14 * 86400000;
      $(SLUG + '-avg').textContent = avg.toFixed(1) + ' days';
      $(SLUG + '-next').textContent = fdate(next);
      $(SLUG + '-fertile').textContent = fdate(ovu - 5 * 86400000) + ' – ' + fdate(ovu + 86400000);
      $(SLUG + '-out').classList.remove('hidden');
    } else {
      $(SLUG + '-out').classList.add('hidden');
    }
  }
  function add() {
    err('');
    var v = $(SLUG + '-date').value;
    if (!v) { err('Pick the period start date.'); return; }
    var ms = new Date(v + 'T00:00:00').getTime();
    var dates = load();
    if (dates.indexOf(ms) !== -1) { err('That date is already logged.'); return; }
    dates.push(ms);
    save(dates);
    $(SLUG + '-date').value = '';
    render();
  }
  try {
    $(SLUG + '-add').addEventListener('click', add);
    render();
  } catch (e) { /* never throw on load */ }
})();
