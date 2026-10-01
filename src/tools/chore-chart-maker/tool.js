/* Chore Chart Maker — family members × chores weekly grid, printable. */
(function () {
  'use strict';

  var SLUG = 'chore-chart-maker';
  var KEY = 'tn-' + SLUG + '-data';
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function load() {
    try {
      var obj = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (obj && typeof obj === 'object') {
        return {
          members: Array.isArray(obj.members) ? obj.members : [],
          chores: Array.isArray(obj.chores) ? obj.chores : [],
          cells: (obj.cells && typeof obj.cells === 'object') ? obj.cells : {}
        };
      }
    } catch (e) { /* fall through */ }
    return { members: [], chores: [], cells: {} };
  }

  function persist(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w.charAt(0).toUpperCase(); }).join('').slice(0, 2);
  }

  function render() {
    var data = load();
    TN.el(SLUG + '-members').textContent = data.members.length ? data.members.join(', ') : '(none yet)';
    var tbl = TN.el(SLUG + '-grid');
    var html = '<tr><th style="text-align:left;padding:8px">Chore</th>' +
      DAYS.map(function (d) { return '<th style="padding:8px">' + d + '</th>'; }).join('') + '</tr>';
    html += data.chores.map(function (chore, ci) {
      var tds = DAYS.map(function (d, di) {
        var key = ci + ':' + di;
        var mi = data.cells[key];
        var label = (mi !== undefined && data.members[mi]) ? initials(data.members[mi]) : '—';
        return '<td style="padding:4px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">' +
          '<button type="button" data-cell="' + key + '" title="click to cycle" style="min-width:44px;min-height:36px;border-radius:8px;border:1px solid #444;background:' +
          (mi !== undefined && data.members[mi] ? '#4D7C0F' : '#222') + ';color:#fff;cursor:pointer">' + TN.esc(label) + '</button></td>';
      }).join('');
      return '<tr><td style="padding:8px;font-weight:bold">' + TN.esc(chore) +
        ' <button class="btn btn-sm btn-outline" data-delchore="' + ci + '" title="remove chore">×</button></td>' + tds + '</tr>';
    }).join('');
    tbl.innerHTML = html;
    var cells = tbl.querySelectorAll('[data-cell]');
    for (var i = 0; i < cells.length; i++) {
      (function (cell) {
        cell.addEventListener('click', function () {
          var d = load();
          if (!d.members.length) { TN.setErr(SLUG + '-error', 'Add a family member first.'); return; }
          var key = cell.getAttribute('data-cell');
          var cur = d.cells[key];
          d.cells[key] = (cur === undefined) ? 0 : (cur + 1 > d.members.length - 1 ? undefined : cur + 1);
          if (d.cells[key] === undefined) delete d.cells[key];
          persist(d); render();
        });
      })(cells[i]);
    }
    var dels = tbl.querySelectorAll('[data-delchore]');
    for (i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          var ci = parseInt(b.getAttribute('data-delchore'), 10);
          var d = load();
          d.chores.splice(ci, 1);
          var nc = {};
          Object.keys(d.cells).forEach(function (k) {
            var parts = k.split(':');
            var c = parseInt(parts[0], 10);
            if (c < ci) nc[k] = d.cells[k];
            else if (c > ci) nc[(c - 1) + ':' + parts[1]] = d.cells[k];
          });
          d.cells = nc;
          persist(d); render();
        });
      })(dels[i]);
    }
  }

  function addMember() {
    TN.clearErr(SLUG + '-error');
    var name = TN.el(SLUG + '-member').value.trim();
    if (!name) { TN.setErr(SLUG + '-error', 'Enter a family member name.'); return; }
    var d = load();
    d.members.push(name);
    persist(d);
    TN.el(SLUG + '-member').value = '';
    render();
  }

  function addChore() {
    TN.clearErr(SLUG + '-error');
    var chore = TN.el(SLUG + '-chore').value.trim();
    if (!chore) { TN.setErr(SLUG + '-error', 'Enter a chore name.'); return; }
    var d = load();
    d.chores.push(chore);
    persist(d);
    TN.el(SLUG + '-chore').value = '';
    render();
  }

  function printChart() {
    TN.clearErr(SLUG + '-error');
    var data = load();
    if (!data.chores.length) { TN.setErr(SLUG + '-error', 'Add at least one chore first.'); return; }
    var w = window.open('', '_blank');
    if (!w) { TN.setErr(SLUG + '-error', 'Popup blocked — allow popups to print.'); return; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    var rows = data.chores.map(function (chore, ci) {
      var tds = DAYS.map(function (d, di) {
        var mi = data.cells[ci + ':' + di];
        return '<td>' + (mi !== undefined && data.members[mi] ? esc(data.members[mi]) : '') + '</td>';
      }).join('');
      return '<tr><td><strong>' + esc(chore) + '</strong></td>' + tds + '</tr>';
    }).join('');
    w.document.write('<!DOCTYPE html><html><head><title>Weekly Chore Chart</title>' +
      '<style>body{font-family:sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:10px;text-align:center}th{background:#f0f0f0}td:first-child{text-align:left}</style>' +
      '</head><body><h1>Weekly Chore Chart</h1><table><tr><th>Chore</th>' +
      DAYS.map(function (d) { return '<th>' + d + '</th>'; }).join('') +
      '</tr>' + rows + '</table></body></html>');
    w.document.close();
    w.focus();
    w.print();
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-grid')) return;
      TN.on(SLUG + '-addmember', 'click', addMember);
      TN.on(SLUG + '-addchore', 'click', addChore);
      TN.on(SLUG + '-print', 'click', printChart);
      TN.on(SLUG + '-reset', 'click', function () {
        if (!window.confirm('Reset the whole chart?')) return;
        persist({ members: [], chores: [], cells: {} });
        render();
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();