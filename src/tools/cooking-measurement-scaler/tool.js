(function () {
  'use strict';
  var ERR = 'cooking-measurement-scaler-error';
  var UNITS = ['cup', 'tbsp', 'tsp', 'fl oz', 'ml', 'L', 'g', 'kg', 'oz', 'lb', 'piece'];
  var TOML = { 'cup': 236.588, 'tbsp': 14.7868, 'tsp': 4.92892, 'fl oz': 29.5735, 'ml': 1, 'L': 1000 };
  var TOG = { 'g': 1, 'kg': 1000, 'oz': 28.3495, 'lb': 453.592 };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return String(Math.round(n * 100) / 100); }
  function buildRows() {
    var tb = TN.el('cook-rows');
    var html = '';
    for (var i = 0; i < 8; i++) {
      html += '<tr><td><input type="number" class="input" id="cook-amt' + i + '" min="0" step="any" style="min-width:80px"></td>' +
        '<td><select class="input" id="cook-unit' + i + '">' + UNITS.map(function (u) { return '<option>' + u + '</option>'; }).join('') + '</select></td>' +
        '<td><input type="text" class="input" id="cook-name' + i + '" placeholder="e.g. flour" style="min-width:120px"></td></tr>';
    }
    tb.innerHTML = html;
    for (var j = 0; j < 8; j++) { TN.on('cook-amt' + j, 'input', calc); TN.on('cook-unit' + j, 'change', calc); TN.on('cook-name' + j, 'input', calc); }
  }
  function calc() {
    if (!TN.el('cook-orig')) return;
    TN.clearErr(ERR);
    var orig = parseFloat(TN.el('cook-orig').value);
    var want = parseFloat(TN.el('cook-want').value);
    if (!(orig > 0)) { TN.setErr(ERR, 'Enter original servings greater than 0.'); return; }
    if (!(want > 0)) { TN.setErr(ERR, 'Enter desired servings greater than 0.'); return; }
    var f = want / orig;
    TN.el('cook-factor').textContent = '×' + fmt(f);
    var rows = [];
    for (var i = 0; i < 8; i++) {
      var a = parseFloat(TN.el('cook-amt' + i).value);
      if (!(a > 0)) continue;
      var u = TN.el('cook-unit' + i).value;
      var name = (TN.el('cook-name' + i).value || '').trim() || ('Ingredient ' + (i + 1));
      var scaled = a * f;
      var equiv = '–';
      if (TOML[u]) { var ml = scaled * TOML[u]; equiv = ml >= 1000 ? fmt(ml / 1000) + ' L' : fmt(ml) + ' ml'; }
      else if (TOG[u]) { var g = scaled * TOG[u]; equiv = g >= 1000 ? fmt(g / 1000) + ' kg' : fmt(g) + ' g'; }
      rows.push('<tr><td>' + esc(name) + '</td><td>' + fmt(scaled) + ' ' + u + '</td><td>' + equiv + '</td></tr>');
    }
    TN.el('cook-body').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="3" class="muted">Enter at least one ingredient.</td></tr>';
  }
  try {
    buildRows();
    TN.on('cook-orig', 'input', calc);
    TN.on('cook-want', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();