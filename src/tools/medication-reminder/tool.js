(function () {
  'use strict';
  var ERR = 'medication-reminder-error';
  var KEY = 'tn-medication-reminder';
  var tick = null;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function load() { try { var s = localStorage.getItem(KEY); var a = s ? JSON.parse(s) : []; return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function nextDose(timeStr) {
    var parts = String(timeStr).split(':');
    var d = new Date();
    d.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  function fmtDur(ms) {
    ms = Math.max(0, ms);
    var m = Math.floor(ms / 60000);
    var h = Math.floor(m / 60);
    if (h > 0) return h + 'h ' + (m % 60) + 'm';
    return m + 'm';
  }
  function render() {
    var a = load();
    TN.el('med-count').textContent = a.length;
    if (!a.length) {
      TN.el('med-next').textContent = '–';
      TN.el('med-body').innerHTML = '<tr><td colspan="5" class="muted">No medications added yet.</td></tr>';
      return;
    }
    var soonest = Infinity;
    var rows = a.map(function (r, i) {
      var nd = nextDose(r.time);
      if (nd < soonest) soonest = nd;
      var status = r.taken ? 'Taken ' + r.taken : 'Pending';
      return '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.time) + '</td><td>' + fmtDur(nd - Date.now()) + '</td><td>' + esc(status) + '</td>' +
        '<td><button class="btn" data-take="' + i + '">Taken</button> <button class="btn" data-del="' + i + '">Delete</button></td></tr>';
    });
    TN.el('med-next').textContent = fmtDur(soonest - Date.now());
    TN.el('med-body').innerHTML = rows.join('');
    var btns = TN.el('med-body').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        if (b.getAttribute('data-take') !== null) b.onclick = function () { take(parseInt(b.getAttribute('data-take'), 10)); };
        else b.onclick = function () { del(parseInt(b.getAttribute('data-del'), 10)); };
      })(btns[i]);
    }
  }
  function take(i) {
    var a = load();
    if (!a[i]) return;
    var t = '';
    try { t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch (e) {}
    a[i].taken = t;
    save(a); render();
  }
  function del(i) { var a = load(); a.splice(i, 1); save(a); render(); }
  function add() {
    TN.clearErr(ERR);
    var name = (TN.el('med-name').value || '').trim();
    var time = TN.el('med-time').value;
    if (!name) { TN.setErr(ERR, 'Enter a medication name.'); return; }
    if (!time) { TN.setErr(ERR, 'Pick a dose time.'); return; }
    var a = load();
    a.push({ name: name, time: time, taken: '' });
    save(a);
    TN.el('med-name').value = '';
    render();
  }
  try {
    TN.on('med-add', 'click', add);
    if (tick) clearInterval(tick);
    tick = setInterval(render, 30000);
    render();
  } catch (e) { /* never throw on load */ }
})();