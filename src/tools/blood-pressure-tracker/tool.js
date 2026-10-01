(function () {
  'use strict';
  var ERR = 'blood-pressure-tracker-error';
  var KEY = 'tn-blood-pressure-tracker';
  function load() { try { var s = localStorage.getItem(KEY); var a = s ? JSON.parse(s) : []; return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function cat(s, d) {
    if (s > 180 || d > 120) return 'Hypertensive crisis';
    if (s >= 140 || d >= 90) return 'Stage 2 hypertension';
    if (s >= 130 || d >= 80) return 'Stage 1 hypertension';
    if (s >= 120 && d < 80) return 'Elevated';
    return 'Normal';
  }
  function render() {
    var a = load();
    TN.el('bp-count').textContent = a.length;
    if (!a.length) {
      TN.el('bp-avg').textContent = '–';
      TN.el('bp-cat').textContent = '–';
      TN.el('bp-body').innerHTML = '<tr><td colspan="3" class="muted">No readings yet.</td></tr>';
      return;
    }
    var ss = 0, dd = 0;
    a.forEach(function (r) { ss += r.s; dd += r.d; });
    var as = Math.round(ss / a.length), ad = Math.round(dd / a.length);
    TN.el('bp-avg').textContent = as + '/' + ad;
    TN.el('bp-cat').textContent = cat(as, ad);
    var rows = a.slice().reverse().map(function (r) {
      var dt = '';
      try { dt = new Date(r.t).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { dt = ''; }
      return '<tr><td>' + dt + '</td><td>' + r.s + '/' + r.d + '</td><td>' + cat(r.s, r.d) + '</td></tr>';
    });
    TN.el('bp-body').innerHTML = rows.join('');
  }
  function add() {
    TN.clearErr(ERR);
    var s = parseInt(TN.el('bp-sys').value, 10);
    var d = parseInt(TN.el('bp-dia').value, 10);
    if (!(s >= 40 && s <= 300)) { TN.setErr(ERR, 'Enter a systolic value between 40 and 300.'); return; }
    if (!(d >= 20 && d <= 200)) { TN.setErr(ERR, 'Enter a diastolic value between 20 and 200.'); return; }
    if (d >= s) { TN.setErr(ERR, 'Diastolic should be lower than systolic.'); return; }
    var a = load();
    a.push({ t: Date.now(), s: s, d: d });
    save(a);
    TN.el('bp-sys').value = ''; TN.el('bp-dia').value = '';
    render();
  }
  function clearAll() { save([]); render(); }
  try {
    TN.on('bp-add', 'click', add);
    TN.on('bp-clear', 'click', clearAll);
    render();
  } catch (e) { /* never throw on load */ }
})();