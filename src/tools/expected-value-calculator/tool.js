(function () {
  'use strict';
  var P = 'expected-value-calculator-', ERR = P + 'error';
  var rowCount = 0;
  function g(id) { return TN.el(P + id); }
  function fmt(x) {
    if (!isFinite(x)) return String(x);
    return String(parseFloat(x.toPrecision(10)));
  }
  function addRow(xv, pv) {
    var i = rowCount++;
    var tr = document.createElement('tr');
    tr.id = P + 'row-' + i;
    tr.innerHTML = '<td>' + (i + 1) + '</td>' +
      '<td><input class="input" style="width:110px" type="number" step="any" id="' + P + 'x-' + i + '" value="' + (xv !== undefined ? xv : '') + '"></td>' +
      '<td><input class="input" style="width:110px" type="number" step="any" min="0" max="1" id="' + P + 'p-' + i + '" value="' + (pv !== undefined ? pv : '') + '"></td>' +
      '<td><button type="button" class="btn btn-outline btn-sm" data-rm="' + i + '">Remove</button></td>';
    g('rows').appendChild(tr);
    var btn = tr.querySelector('[data-rm]');
    TN.on(btn, 'click', function () {
      tr.parentNode.removeChild(tr);
      TN.hide(P + 'out');
    });
  }
  function calc() {
    try {
      TN.clearErr(ERR);
      var rows = g('rows').querySelectorAll('tr');
      if (!rows.length) { TN.setErr(ERR, 'Add at least one outcome row.'); return; }
      var xs = [], ps = [], i;
      for (i = 0; i < rows.length; i++) {
        var id = rows[i].id.replace(P + 'row-', '');
        var x = parseFloat(TN.el(P + 'x-' + id).value);
        var p = parseFloat(TN.el(P + 'p-' + id).value);
        if (isNaN(x)) { TN.setErr(ERR, 'Row ' + (i + 1) + ': outcome value must be a number.'); return; }
        if (isNaN(p) || p < 0 || p > 1) { TN.setErr(ERR, 'Row ' + (i + 1) + ': probability must be between 0 and 1.'); return; }
        xs.push(x); ps.push(p);
      }
      var sumP = ps.reduce(function (s, v) { return s + v; }, 0);
      if (Math.abs(sumP - 1) > 1e-9) { TN.setErr(ERR, 'Probabilities sum to ' + fmt(sumP) + ', not 1. Adjust them so the distribution is complete.'); return; }
      var ev = 0, terms = [];
      for (i = 0; i < xs.length; i++) {
        var t = xs[i] * ps[i];
        ev += t;
        terms.push(fmt(xs[i]) + ' × ' + fmt(ps[i]) + ' = ' + fmt(t));
      }
      var vr = 0, vterms = [];
      for (i = 0; i < xs.length; i++) {
        var d = xs[i] - ev, vt = ps[i] * d * d;
        vr += vt;
        vterms.push(fmt(ps[i]) + ' × (' + fmt(xs[i]) + ' − ' + fmt(ev) + ')² = ' + fmt(vt));
      }
      TN.show(P + 'out');
      g('ev').textContent = fmt(ev);
      g('var').textContent = fmt(vr);
      g('sd').textContent = fmt(Math.sqrt(vr));
      g('steps').innerHTML = '<p>E(X) = Σ x·p = ' + terms.map(TN.esc).join(' + ') + ' = <b>' + fmt(ev) + '</b></p>' +
        '<p>Var(X) = Σ p·(x − μ)² = ' + vterms.map(TN.esc).join(' + ') + ' = <b>' + fmt(vr) + '</b>; σ = √Var = <b>' + fmt(Math.sqrt(vr)) + '</b></p>';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    addRow(10, 0.5); addRow(20, 0.3); addRow(30, 0.2);
    TN.on(P + 'add', 'click', function () { addRow(); });
    TN.on(P + 'calc', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
