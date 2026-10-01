/* Setlist Planner — ordered songs with durations, encore split, localStorage. */
(function () {
  'use strict';
  var SLUG = 'setlist-planner';
  var ERR = SLUG + '-error';
  var KEY = 'tn-' + SLUG + '-songs';
  var songs = []; // {name, secs, encore}

  function parseDur(s) {
    s = (s || '').trim();
    if (!s) return -1;
    var m = s.match(/^(\d+):([0-5]?\d)$/);
    if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    var f = parseFloat(s);
    if (!isNaN(f) && f > 0 && f < 600) return Math.round(f * 60);
    return -1;
  }

  function fmt(secs) {
    secs = Math.round(secs);
    var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    var mm = (h ? (m < 10 ? '0' : '') : '') + m;
    var base = (h ? h + ':' : '') + mm + ':' + (s < 10 ? '0' : '') + s;
    return base;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(songs)); } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) songs = arr.filter(function (x) { return x && x.name; });
      }
    } catch (e) {}
  }

  function render() {
    var rows = document.getElementById(SLUG + '-rows');
    rows.innerHTML = '';
    var main = 0, enc = 0;
    songs.forEach(function (sg, i) {
      if (sg.encore) enc += sg.secs; else main += sg.secs;
      var tr = document.createElement('tr');
      if (sg.encore) tr.style.background = 'rgba(22,101,52,0.06)';
      function td(txt) { var d = document.createElement('td'); d.textContent = txt; return d; }
      tr.appendChild(td(i + 1));
      var tn = document.createElement('td');
      tn.innerHTML = '<strong>' + TN.esc(sg.name) + '</strong>';
      tr.appendChild(tn);
      tr.appendChild(td(fmt(sg.secs)));
      var te = document.createElement('td');
      var cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = !!sg.encore;
      cb.title = 'Encore song';
      cb.onchange = function () { sg.encore = cb.checked; save(); render(); };
      te.appendChild(cb);
      tr.appendChild(te);
      var ta = document.createElement('td');
      ta.style.whiteSpace = 'nowrap';
      [['↑', -1], ['↓', 1]].forEach(function (mv) {
        var b = document.createElement('button');
        b.className = 'btn btn-sm btn-outline';
        b.textContent = mv[0];
        b.style.marginRight = '4px';
        b.title = mv[1] < 0 ? 'Move up' : 'Move down';
        b.onclick = function () {
          var j = i + mv[1];
          if (j < 0 || j >= songs.length) return;
          var tmp = songs[i]; songs[i] = songs[j]; songs[j] = tmp;
          save(); render();
        };
        ta.appendChild(b);
      });
      var del = document.createElement('button');
      del.className = 'btn btn-sm btn-outline';
      del.textContent = '×';
      del.title = 'Remove';
      del.onclick = function () { songs.splice(i, 1); save(); render(); };
      ta.appendChild(del);
      tr.appendChild(ta);
      rows.appendChild(tr);
    });
    document.getElementById(SLUG + '-empty').style.display = songs.length ? 'none' : '';
    document.getElementById(SLUG + '-main').textContent = fmt(main);
    document.getElementById(SLUG + '-encore').textContent = fmt(enc);
    document.getElementById(SLUG + '-total').textContent = fmt(main + enc);
  }

  try {
    if (!document.getElementById(SLUG + '-add')) return;
    load();
    render();
    function add() {
      TN.clearErr(ERR);
      var nameEl = document.getElementById(SLUG + '-name');
      var durEl = document.getElementById(SLUG + '-dur');
      var name = nameEl.value.trim();
      var secs = parseDur(durEl.value);
      if (!name) { TN.setErr(ERR, 'Type a song name first.'); return; }
      if (secs < 0) { TN.setErr(ERR, 'Duration not understood — use m:ss (3:45) or minutes (3.75).'); return; }
      songs.push({ name: name, secs: secs, encore: false });
      nameEl.value = ''; durEl.value = '';
      nameEl.focus();
      save(); render();
    }
    TN.on(SLUG + '-add', 'click', add);
    TN.on(SLUG + '-name', 'keydown', function (e) { if (e.key === 'Enter') add(); });
    TN.on(SLUG + '-dur', 'keydown', function (e) { if (e.key === 'Enter') add(); });
    TN.on(SLUG + '-clear', 'click', function () {
      if (!songs.length) return;
      songs = []; save(); render();
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!songs.length) { TN.setErr(ERR, 'Nothing to copy — add songs first.'); return; }
      var lines = songs.map(function (sg, i) {
        return (i + 1) + '. ' + sg.name + ' — ' + fmt(sg.secs) + (sg.encore ? ' (encore)' : '');
      });
      TN.copy('SETLIST\n' + lines.join('\n')).then(function () {
        TN.clearErr(ERR);
      }).catch(function () { TN.setErr(ERR, 'Copy failed — select the list manually.'); });
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
