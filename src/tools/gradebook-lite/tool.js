/* Gradebook — assignments with weights → weighted grade, what-if tester. */
(function () {
  'use strict';

  var SLUG = 'gradebook-lite';
  var KEY = 'tn-' + SLUG + '-assignments';

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function weighted(items) {
    var g = 0, wsum = 0;
    items.forEach(function (a) {
      if (a.max > 0) {
        g += (a.score / a.max) * a.weight;
        wsum += a.weight;
      }
    });
    return { grade: g, wsum: wsum };
  }

  function letter(g) {
    if (g >= 93) return 'A';
    if (g >= 90) return 'A-';
    if (g >= 87) return 'B+';
    if (g >= 83) return 'B';
    if (g >= 80) return 'B-';
    if (g >= 77) return 'C+';
    if (g >= 73) return 'C';
    if (g >= 70) return 'C-';
    if (g >= 67) return 'D+';
    if (g >= 63) return 'D';
    if (g >= 60) return 'D-';
    return 'F';
  }

  function render() {
    var items = load();
    var w = weighted(items);
    TN.el(SLUG + '-grade').textContent = items.length ? w.grade.toFixed(1) + '%' : '—';
    TN.el(SLUG + '-letter').textContent = items.length ? letter(w.grade) : '—';
    TN.el(SLUG + '-wsum').textContent = w.wsum.toFixed(1) + '%';
    var list = TN.el(SLUG + '-list');
    if (!items.length) { list.innerHTML = '<p class="muted">No assignments yet.</p>'; return; }
    list.innerHTML = items.map(function (a) {
      var pct = a.max > 0 ? (a.score / a.max * 100).toFixed(1) : '—';
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>' + TN.esc(a.name) + '</strong> — ' + a.score + '/' + a.max + ' (' + pct + '%) ' +
        '<span class="muted">weight ' + a.weight + '%</span>' +
        '<button class="btn btn-sm btn-outline" data-del="' + a.id + '" style="float:right">Delete</button></div>';
    }).join('');
    var dels = list.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
          render();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = TN.el(SLUG + '-name').value.trim();
    var score = parseFloat(TN.el(SLUG + '-score').value);
    var max = parseFloat(TN.el(SLUG + '-max').value);
    var weight = parseFloat(TN.el(SLUG + '-weight').value);
    if (!name) { TN.setErr(SLUG + '-error', 'Enter an assignment name.'); return; }
    if (isNaN(score) || score < 0) { TN.setErr(SLUG + '-error', 'Enter a valid score.'); return; }
    if (isNaN(max) || max <= 0) { TN.setErr(SLUG + '-error', 'Max points must be above 0.'); return; }
    if (isNaN(weight) || weight <= 0) { TN.setErr(SLUG + '-error', 'Weight must be above 0.'); return; }
    var items = load();
    items.push({ id: Date.now(), name: name, score: score, max: max, weight: weight });
    persist(items);
    TN.el(SLUG + '-name').value = '';
    TN.el(SLUG + '-score').value = '';
    TN.el(SLUG + '-max').value = '';
    TN.el(SLUG + '-weight').value = '';
    render();
  }

  function testWhatIf() {
    TN.clearErr(SLUG + '-error');
    var wscore = parseFloat(TN.el(SLUG + '-wscore').value);
    var ww = parseFloat(TN.el(SLUG + '-ww').value);
    var wname = TN.el(SLUG + '-wname').value.trim() || 'Hypothetical';
    if (isNaN(wscore) || wscore < 0 || wscore > 100) { TN.setErr(SLUG + '-error', 'Score % must be 0–100.'); return; }
    if (isNaN(ww) || ww <= 0) { TN.setErr(SLUG + '-error', 'Weight must be above 0.'); return; }
    var items = load();
    var cur = weighted(items);
    var hypothetical = cur.grade + (wscore / 100) * ww;
    TN.el(SLUG + '-wresult').innerHTML =
      '<p>Current grade: <strong>' + cur.grade.toFixed(1) + '% (' + letter(cur.grade) + ')</strong></p>' +
      '<p>If you score <strong>' + wscore + '%</strong> on <strong>' + TN.esc(wname) + '</strong> (weight ' + ww + '%): ' +
      'grade becomes <strong>' + hypothetical.toFixed(1) + '% (' + letter(hypothetical) + ')</strong></p>';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-test', 'click', testWhatIf);
      TN.on(SLUG + '-clear', 'click', function () {
        if (!window.confirm('Delete all assignments?')) return;
        persist([]); render();
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();