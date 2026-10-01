(function () {
  'use strict';
  var ERR = 'grocery-list-generator-error';
  var state = [];
  var custom = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(id, dflt) { var e = TN.el(id); var v = e ? parseInt(e.value, 10) : NaN; return isNaN(v) ? dflt : v; }
  function r1(n) { return Math.round(n * 10) / 10; }
  function generate() {
    TN.clearErr(ERR);
    var p = Math.min(30, Math.max(1, num('groc-people', 2)));
    var d = Math.min(60, Math.max(1, num('groc-days', 7)));
    var diet = TN.el('groc-diet').value;
    var bf = TN.el('groc-m-bf').checked, ln = TN.el('groc-m-ln').checked,
        dn = TN.el('groc-m-dn').checked, sn = TN.el('groc-m-sn').checked;
    var pd = p * d; // person-days
    var cats = [];
    var prod = [], dairy = [], pantry = [], meat = [], snacks = [];
    if (bf) {
      prod.push(['Bananas', r1(pd * 0.5) + ' pcs']); dairy.push(['Milk', r1(pd * 0.25) + ' L']);
      pantry.push(['Oats / cereal', r1(pd * 0.06) + ' kg']); pantry.push(['Eggs', Math.ceil(pd * 0.7) + ' pcs']);
      if (diet !== 'vegan') dairy.push(['Yogurt', r1(pd * 0.1) + ' kg']);
    }
    if (ln || dn) {
      var meals = (ln ? 1 : 0) + (dn ? 1 : 0);
      prod.push(['Mixed vegetables', r1(pd * 0.35 * meals) + ' kg']);
      prod.push(['Potatoes / rice base', r1(pd * 0.15 * meals) + ' kg']);
      prod.push(['Onions & garlic', r1(pd * 0.08 * meals) + ' kg']);
      prod.push(['Fresh fruit', r1(pd * 0.2) + ' kg']);
      pantry.push(['Rice / pasta', r1(pd * 0.1 * meals) + ' kg']);
      pantry.push(['Cooking oil', r1(pd * 0.02 * meals) + ' L']);
      pantry.push(['Bread', Math.ceil(pd * 0.3 * meals) + ' loaves']);
      if (diet === 'any') meat.push(['Chicken / meat', r1(pd * 0.15 * meals) + ' kg']);
      else { pantry.push(['Lentils / beans', r1(pd * 0.08 * meals) + ' kg']); pantry.push(['Tofu / paneer', r1(pd * 0.1 * meals) + ' kg']); }
      if (diet !== 'vegan') dairy.push(['Cheese', r1(pd * 0.03 * meals) + ' kg']);
    }
    if (sn) { snacks.push(['Nuts / trail mix', r1(pd * 0.05) + ' kg']); snacks.push(['Biscuits / crackers', Math.ceil(pd * 0.2) + ' packs']); prod.push(['Snack fruit', r1(pd * 0.15) + ' kg']); }
    pantry.push(['Salt, pepper & spices', '1 set']); pantry.push(['Tea / coffee', r1(pd * 0.01) + ' kg']);
    if (prod.length) cats.push(['Produce', prod]);
    if (dairy.length) cats.push(['Dairy' + (diet === 'vegan' ? ' alternatives' : ''), dairy]);
    if (meat.length) cats.push(['Meat', meat]);
    if (pantry.length) cats.push(['Pantry', pantry]);
    if (snacks.length) cats.push(['Snacks', snacks]);
    state = [];
    cats.forEach(function (c) { c[1].forEach(function (it) { state.push({ cat: c[0], item: it[0], qty: it[1], done: false }); }); });
    custom.forEach(function (c) { state.push({ cat: 'Custom', item: c.item, qty: c.qty, done: false }); });
    if (!state.length) { TN.setErr(ERR, 'Select at least one meal or add a custom item.'); return; }
    render();
  }
  function render() {
    var box = TN.el('groc-list');
    if (!state.length) { box.innerHTML = '<p class="muted">Press Generate list to build your grocery list.</p>'; TN.el('groc-count').textContent = '–'; TN.el('groc-est').textContent = '–'; return; }
    var html = '', lastCat = null, done = 0;
    state.forEach(function (s, i) {
      if (s.done) done++;
      if (s.cat !== lastCat) { html += '<h4 style="margin:14px 0 4px">' + esc(s.cat) + '</h4>'; lastCat = s.cat; }
      html += '<div class="checkbox-row"><input type="checkbox" data-i="' + i + '" id="groc-it-' + i + '"' + (s.done ? ' checked' : '') +
        '><label for="groc-it-' + i + '"' + (s.done ? ' style="text-decoration:line-through;opacity:.6"' : '') + '>' +
        esc(s.item) + ' <span class="muted">— ' + esc(s.qty) + '</span></label></div>';
    });
    box.innerHTML = html;
    TN.el('groc-count').textContent = state.length;
    var est = 0;
    state.forEach(function (s) { if (s.cat === 'Produce') { var m = /([\d.]+)\s*kg/.exec(s.qty); if (m) est += parseFloat(m[1]); } });
    TN.el('groc-est').textContent = r1(est) + ' kg';
    TN.qsa('#groc-list input[type=checkbox]').forEach(function (cb) {
      cb.addEventListener('change', function () { state[parseInt(cb.getAttribute('data-i'), 10)].done = cb.checked; render(); });
    });
  }
  function asText() {
    var lines = ['GROCERY LIST', ''], lastCat = null;
    state.forEach(function (s) {
      if (s.cat !== lastCat) { lines.push('', s.cat.toUpperCase()); lastCat = s.cat; }
      lines.push((s.done ? '[x] ' : '[ ] ') + s.item + ' — ' + s.qty);
    });
    return lines.join('\n');
  }
  try {
    TN.on('groc-gen', 'click', generate);
    TN.on('groc-add', 'click', function () {
      var item = TN.el('groc-custom').value.trim(), qty = TN.el('groc-custom-qty').value.trim() || '1';
      if (!item) { TN.setErr(ERR, 'Type a custom item name first.'); return; }
      TN.clearErr(ERR);
      custom.push({ item: item, qty: qty });
      TN.el('groc-custom').value = ''; TN.el('groc-custom-qty').value = '';
      if (state.length) { state.push({ cat: 'Custom', item: item, qty: qty, done: false }); render(); }
    });
    TN.on('groc-dl', 'click', function () {
      if (!state.length) { TN.setErr(ERR, 'Generate a list first.'); return; }
      TN.clearErr(ERR);
      var b = new Blob([asText()], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'grocery-list.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
    TN.on('groc-copy', 'click', function () {
      if (!state.length) { TN.setErr(ERR, 'Generate a list first.'); return; }
      TN.clearErr(ERR);
      if (TN.copy) TN.copy(asText());
    });
    render();
  } catch (e) { /* never throw on load */ }
})();