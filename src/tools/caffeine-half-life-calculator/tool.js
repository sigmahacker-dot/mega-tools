/* Caffeine half-life calculator: log drinks, 5.5h half-life decay, bedtime estimate. */
(function () {
  'use strict';
  var SLUG = 'caffeine-half-life-calculator';
  var KEY = SLUG + '-data';
  var HALF = 5.5; // hours
  function $(id) { return document.getElementById(id); }
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(d) ? d : []; }
    catch (e) { return []; }
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function err(m) { $(SLUG + '-error').textContent = m; }
  function decay(mg, atMs, nowMs) {
    var h = (nowMs - atMs) / 3600000;
    if (h < 0) return 0;
    return mg * Math.pow(0.5, h / HALF);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function refresh() {
    var drinks = load();
    var now = Date.now();
    var cur = 0;
    drinks.forEach(function (d) { cur += decay(d.mg, d.at, now); });
    $(SLUG + '-now').textContent = Math.round(cur) + ' mg';
    var bedV = $(SLUG + '-bed').value;
    if (bedV) {
      var sp = bedV.split(':');
      var bed = new Date();
      bed.setHours(parseInt(sp[0], 10), parseInt(sp[1], 10), 0, 0);
      if (bed.getTime() < now) bed.setDate(bed.getDate() + 1);
      var bmg = 0;
      drinks.forEach(function (d) { bmg += decay(d.mg, d.at, bed.getTime()); });
      $(SLUG + '-bedmg').textContent = Math.round(bmg) + ' mg';
      $(SLUG + '-tip').textContent = bmg > 100
        ? '⚠️ High caffeine at bedtime — expect lighter, more broken sleep. Cut off caffeine earlier tomorrow.'
        : bmg > 50
        ? 'Moderate caffeine at bedtime — it may delay sleep onset for sensitive sleepers.'
        : '✅ Low caffeine at bedtime — good for sleep.';
    }
    var box = $(SLUG + '-list');
    if (!drinks.length) { box.innerHTML = '<p class="muted">No drinks logged yet.</p>'; return; }
    var html = '<table class="data"><thead><tr><th>Time</th><th>Drink</th><th>Dose</th><th>Remaining now</th><th></th></tr></thead><tbody>';
    drinks.slice().sort(function (a, b) { return b.at - a.at; }).forEach(function (d) {
      html += '<tr><td>' + new Date(d.at).toLocaleString() + '</td><td>' + esc(d.name) + '</td><td>' + d.mg +
        ' mg</td><td>' + Math.round(decay(d.mg, d.at, now)) + ' mg</td>' +
        '<td><button class="btn btn-outline" data-del="' + d.at + '" style="padding:4px 10px">Remove</button></td></tr>';
    });
    html += '</tbody></table>';
    box.innerHTML = html;
    box.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var at = parseFloat(b.getAttribute('data-del'));
        save(load().filter(function (d) { return d.at !== at; }));
        refresh();
      });
    });
  }
  function add() {
    err('');
    var sel = $(SLUG + '-drink');
    var mg = parseFloat($(SLUG + '-mg').value);
    var tv = $(SLUG + '-time').value;
    if (isNaN(mg) || mg <= 0 || mg > 1000) { err('Enter caffeine between 1 and 1000 mg.'); return; }
    var at = tv ? new Date(tv).getTime() : Date.now();
    if (isNaN(at)) { err('Enter a valid time.'); return; }
    var drinks = load();
    drinks.push({ at: at, mg: mg, name: sel.selectedOptions[0].textContent.split('(~')[0].trim() });
    save(drinks);
    refresh();
  }
  try {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    $(SLUG + '-time').value = d.toISOString().slice(0, 16);
    $(SLUG + '-drink').addEventListener('change', function () {
      var v = $(SLUG + '-drink').value;
      if (v !== 'custom') $(SLUG + '-mg').value = v;
    });
    $(SLUG + '-add').addEventListener('click', add);
    $(SLUG + '-bed').addEventListener('input', refresh);
    refresh();
    setInterval(refresh, 60000);
  } catch (e) { /* never throw on load */ }
})();
