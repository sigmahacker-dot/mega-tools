/* Content Calendar Maker — month grid, schedule posts per day, localStorage, export. */
(function () {
  'use strict';

  var SLUG = 'content-calendar-maker';
  var KEY = 'tn-' + SLUG + '-cal';
  var selectedDay = null;

  var PLAT_COLORS = { Instagram: '#e1306c', TikTok: '#25f4ee', YouTube: '#ff0000', X: '#aaa', Facebook: '#1877f2', LinkedIn: '#0a66c2' };

  function load() {
    try {
      var obj = JSON.parse(localStorage.getItem(KEY) || '{}');
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (e) { return {}; }
  }

  function persist(cal) {
    try { localStorage.setItem(KEY, JSON.stringify(cal)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function monthStr() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
  }

  function pad(n) { return ('0' + n).slice(-2); }

  function render() {
    var ym = TN.el(SLUG + '-month').value || monthStr();
    var parts = ym.split('-');
    var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1;
    var cal = load();
    TN.el(SLUG + '-title').textContent = new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    var first = new Date(y, m, 1);
    var startDow = (first.getDay() + 6) % 7; // Monday first
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var grid = TN.el(SLUG + '-grid');
    grid.innerHTML = '';
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(function (d) {
      var h = document.createElement('div');
      h.style.cssText = 'text-align:center;font-weight:bold;font-size:12px;color:#888;padding:4px';
      h.textContent = d;
      grid.appendChild(h);
    });
    for (var i = 0; i < startDow; i++) grid.appendChild(document.createElement('div'));
    for (var day = 1; day <= daysInMonth; day++) {
      (function (d) {
        var key = y + '-' + pad(m + 1) + '-' + pad(d);
        var cell = document.createElement('button');
        cell.type = 'button';
        var posts = cal[key] || [];
        cell.innerHTML = '<div style="font-weight:bold">' + d + '</div>' +
          (posts.length ? '<div style="font-size:10px">' + posts.slice(0, 3).map(function (p) {
            return '<span style="display:inline-block;background:' + (PLAT_COLORS[p.platform] || '#666') + ';color:#fff;border-radius:6px;padding:1px 5px;margin:1px" title="' + TN.esc(p.text) + '">' + TN.esc(p.platform.slice(0, 2)) + '</span>';
          }).join('') + (posts.length > 3 ? '<span class="muted">+' + (posts.length - 3) + '</span>' : '') + '</div>' : '');
        cell.style.cssText = 'min-height:64px;border-radius:8px;border:1px solid ' +
          (key === selectedDay ? '#4D7C0F' : '#444') + ';background:#1b1b1b;color:#fff;cursor:pointer;padding:4px;font-size:12px';
        cell.addEventListener('click', function () { selectDay(key); });
        grid.appendChild(cell);
      })(day);
    }
  }

  function selectDay(key) {
    selectedDay = key;
    render();
    TN.el(SLUG + '-daypane').style.display = 'block';
    TN.el(SLUG + '-daylabel').textContent = key;
    renderPosts();
  }

  function renderPosts() {
    var cal = load();
    var posts = cal[selectedDay] || [];
    var box = TN.el(SLUG + '-posts');
    if (!posts.length) { box.innerHTML = '<p class="muted">No posts scheduled for this day.</p>'; return; }
    box.innerHTML = posts.map(function (p, i) {
      return '<div class="tool-card" style="margin:6px 0">' +
        '<span style="background:' + (PLAT_COLORS[p.platform] || '#666') + ';color:#fff;border-radius:8px;padding:2px 8px;font-size:12px;font-weight:bold">' + TN.esc(p.platform) + '</span> ' +
        TN.esc(p.text) +
        ' <button class="btn btn-sm btn-outline" data-del="' + i + '" style="float:right">×</button></div>';
    }).join('');
    var dels = box.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          var c = load();
          (c[selectedDay] || []).splice(parseInt(b.getAttribute('data-del'), 10), 1);
          if (!(c[selectedDay] || []).length) delete c[selectedDay];
          persist(c);
          render(); renderPosts();
        });
      })(dels[i]);
    }
  }

  function addPost() {
    TN.clearErr(SLUG + '-error');
    if (!selectedDay) { TN.setErr(SLUG + '-error', 'Click a day first.'); return; }
    var text = TN.el(SLUG + '-text').value.trim();
    var platform = TN.el(SLUG + '-platform').value;
    if (!text) { TN.setErr(SLUG + '-error', 'Type the post idea first.'); return; }
    var cal = load();
    if (!cal[selectedDay]) cal[selectedDay] = [];
    cal[selectedDay].push({ platform: platform, text: text });
    persist(cal);
    TN.el(SLUG + '-text').value = '';
    render(); renderPosts();
  }

  function exportText() {
    TN.clearErr(SLUG + '-error');
    var cal = load();
    var keys = Object.keys(cal).sort();
    if (!keys.length) { TN.setErr(SLUG + '-error', 'Nothing scheduled yet.'); return; }
    var out = 'CONTENT CALENDAR\n\n' + keys.map(function (k) {
      return k + '\n' + cal[k].map(function (p) { return '  [' + p.platform + '] ' + p.text; }).join('\n');
    }).join('\n\n') + '\n';
    TN.downloadText(out, 'content-calendar.txt', 'text/plain');
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-month')) return;
      TN.el(SLUG + '-month').value = monthStr();
      TN.el(SLUG + '-month').addEventListener('change', function () { selectedDay = null; TN.el(SLUG + '-daypane').style.display = 'none'; render(); });
      TN.on(SLUG + '-add', 'click', addPost);
      TN.on(SLUG + '-export', 'click', exportText);
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();