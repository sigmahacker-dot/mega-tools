/* Running shoe mileage tracker: localStorage shoes + runs, 500 km warning. */
(function () {
  'use strict';
  var SLUG = 'running-shoe-mileage-tracker';
  var KEY = SLUG + '-data';
  function $(id) { return document.getElementById(id); }
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(d) ? d : []; }
    catch (e) { return []; }
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function err(m) { $(SLUG + '-error').textContent = m; }
  function total(shoe) {
    var t = 0;
    shoe.runs.forEach(function (r) { t += r.km; });
    return t;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function render() {
    var shoes = load();
    var sel = $(SLUG + '-shoe');
    sel.innerHTML = '';
    shoes.forEach(function (s, i) {
      var o = document.createElement('option');
      o.value = i; o.textContent = s.name;
      sel.appendChild(o);
    });
    var box = $(SLUG + '-list');
    if (!shoes.length) { box.innerHTML = '<p class="muted">No shoes yet — add your first pair above.</p>'; return; }
    var html = '<table class="data"><thead><tr><th>Shoe</th><th>Runs</th><th>Total km</th><th>Status</th><th></th></tr></thead><tbody>';
    shoes.forEach(function (s, i) {
      var t = total(s);
      var status = t > 500
        ? '<strong style="color:#b71c1c">⚠️ ' + t.toFixed(1) + ' km — consider replacing</strong>'
        : t.toFixed(1) + ' km — OK';
      html += '<tr><td>' + esc(s.name) + '</td><td>' + s.runs.length + '</td><td>' + t.toFixed(1) + '</td><td>' + status + '</td>' +
        '<td><button class="btn btn-outline" data-del="' + i + '" style="padding:4px 10px">Delete</button></td></tr>';
    });
    html += '</tbody></table>';
    box.innerHTML = html;
    box.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var shoes = load();
        shoes.splice(parseInt(b.getAttribute('data-del'), 10), 1);
        save(shoes); render();
      });
    });
  }
  function addShoe() {
    err('');
    var name = $(SLUG + '-name').value.trim();
    if (!name) { err('Please enter a shoe name.'); return; }
    var shoes = load();
    shoes.push({ name: name, runs: [] });
    save(shoes);
    $(SLUG + '-name').value = '';
    render();
  }
  function logRun() {
    err('');
    var shoes = load();
    var i = parseInt($(SLUG + '-shoe').value, 10);
    if (isNaN(i) || !shoes[i]) { err('Add a shoe first.'); return; }
    var date = $(SLUG + '-date').value;
    var km = parseFloat($(SLUG + '-km').value);
    if (!date) { err('Please pick the run date.'); return; }
    if (isNaN(km) || km <= 0) { err('Please enter a valid distance in km.'); return; }
    shoes[i].runs.push({ d: date, km: km });
    save(shoes);
    $(SLUG + '-km').value = '';
    render();
    if (total(shoes[i]) > 500) err('Note: "' + shoes[i].name + '" is past 500 km — consider replacing it.');
  }
  try {
    $(SLUG + '-add').addEventListener('click', addShoe);
    $(SLUG + '-log').addEventListener('click', logRun);
    render();
  } catch (e) { /* never throw on load */ }
})();
