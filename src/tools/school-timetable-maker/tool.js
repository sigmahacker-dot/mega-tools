(function () {
  'use strict';
  var P = 'school-timetable-maker-', ERR = P + 'error', LS = 'tn-school-timetable-maker-grid';
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  function g(id) { return TN.el(P + id); }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function save() {
    try {
      var data = { days: parseInt(g('days').value, 10), periods: parseInt(g('periods').value, 10), cells: {} };
      var inputs = g('wrap').querySelectorAll('input[data-cell]');
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value) data.cells[inputs[i].getAttribute('data-cell')] = inputs[i].value;
      }
      localStorage.setItem(LS, JSON.stringify(data));
    } catch (e) { /* storage may be unavailable */ }
  }
  var saveDeb = null;
  function saveSoon() {
    if (saveDeb) clearTimeout(saveDeb);
    saveDeb = setTimeout(save, 400);
  }
  function build() {
    try {
      TN.clearErr(ERR);
      var days = parseInt(g('days').value, 10), periods = parseInt(g('periods').value, 10);
      if (isNaN(days) || days < 1 || days > 7) { TN.setErr(ERR, 'Days must be 1–7.'); return; }
      if (isNaN(periods) || periods < 1 || periods > 12) { TN.setErr(ERR, 'Periods must be 1–12.'); return; }
      var prev = load(), prevCells = {};
      if (prev && prev.days === days && prev.periods === periods) prevCells = prev.cells || {};
      var h = '<table class="data" style="border-collapse:collapse"><thead><tr><th></th>';
      for (var p = 0; p < periods; p++) h += '<th>Period ' + (p + 1) + '</th>';
      h += '</tr></thead><tbody>';
      for (var d = 0; d < days; d++) {
        h += '<tr><th>' + DAYS[d] + '</th>';
        for (p = 0; p < periods; p++) {
          var key = d + ':' + p;
          var v = prevCells[key] ? ' value="' + prevCells[key].replace(/"/g, '&quot;') + '"' : '';
          h += '<td><input class="input" data-cell="' + key + '"' + v + ' style="min-width:110px" placeholder="Subject"></td>';
        }
        h += '</tr>';
      }
      h += '</tbody></table>';
      g('wrap').innerHTML = h;
      var inputs = g('wrap').querySelectorAll('input[data-cell]');
      for (var i = 0; i < inputs.length; i++) TN.on(inputs[i], 'input', saveSoon);
      save();
    } catch (e) { TN.setErr(ERR, e.message || 'Could not build the grid.'); }
  }
  try {
    if (!TN.el(P + 'build')) return;
    var prev = load();
    if (prev) {
      g('days').value = prev.days; g('periods').value = prev.periods;
    }
    build();
    TN.on(P + 'build', 'click', build);
    TN.on(P + 'print', 'click', function () { window.print(); });
  } catch (e) { /* never throw on load */ }
})();
