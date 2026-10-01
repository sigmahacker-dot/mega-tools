(function () {
  'use strict';
  var ERR = 'css-specificity-calculator-error';
  var LEGACY_PE = /:(before|after|first-line|first-letter|selection|placeholder|marker|backdrop|spelling-error|grammar-error)\b/g;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function maxSpec(x, y) {
    for (var i = 0; i < 3; i++) { if (x[i] !== y[i]) return x[i] > y[i] ? x : y; }
    return x;
  }
  function add(dst, src) { dst[0] += src[0]; dst[1] += src[1]; dst[2] += src[2]; }
  // Compute specificity of a single compound-free selector string (no functional pseudos left).
  function baseSpec(sel, detail) {
    var a = 0, b = 0, c = 0, s = sel;
    var m;
    var attrs = s.match(/\[[^\]]*\]/g) || [];
    b += attrs.length;
    (attrs).forEach(function (x) { if (detail) detail.attrs.push(x); });
    s = s.replace(/\[[^\]]*\]/g, ' ');
    var pes = s.match(/::[\w-]+/g) || [];
    c += pes.length;
    pes.forEach(function (x) { if (detail) detail.pseudoEl.push(x); });
    s = s.replace(/::[\w-]+/g, ' ');
    s = s.replace(LEGACY_PE, function (x) { c++; if (detail) detail.pseudoEl.push(x); return ' '; });
    var ids = s.match(/#[\w-]+/g) || [];
    a += ids.length;
    ids.forEach(function (x) { if (detail) detail.ids.push(x); });
    s = s.replace(/#[\w-]+/g, ' ');
    var cls = s.match(/\.[\w-]+/g) || [];
    b += cls.length;
    cls.forEach(function (x) { if (detail) detail.classes.push(x); });
    s = s.replace(/\.[\w-]+/g, ' ');
    var pcs = s.match(/:[\w-]+(\([^()]*\))?/g) || [];
    b += pcs.length;
    pcs.forEach(function (x) { if (detail) detail.pseudoCl.push(x); });
    s = s.replace(/:[\w-]+(\([^()]*\))?/g, ' ');
    var parts = s.split(/[\s>+~]+/);
    parts.forEach(function (p) {
      p = p.trim();
      if (!p || p === '*' || p === '|*') return;
      var el = p.split('|').pop();
      if (/^[a-zA-Z][\w-]*$/.test(el)) { c++; if (detail) detail.elements.push(el); }
    });
    return [a, b, c];
  }
  function fullSpec(selector, detail) {
    var total = [0, 0, 0], s = selector;
    var guard = 0, m;
    var re = /:(not|is|where|has)\(([^()]*)\)/g;
    while (guard++ < 50 && (m = re.exec(s))) {
      var kind = m[1], arg = m[2];
      if (kind !== 'where') {
        var best = [0, 0, 0];
        arg.split(',').forEach(function (part) {
          best = maxSpec(best, fullSpec(part.trim(), null));
        });
        add(total, best);
        if (detail) detail.func.push(':' + kind + '(' + arg + ') → (' + best.join(', ') + ')');
      } else if (detail) detail.func.push(':where(' + arg + ') → (0, 0, 0)');
      s = s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length);
      re.lastIndex = 0;
    }
    add(total, baseSpec(s, detail));
    return total;
  }
  function update() {
    if (!TN.el('spec-sel')) return;
    TN.clearErr(ERR);
    var sel = TN.el('spec-sel').value.trim();
    if (!sel) {
      TN.el('spec-abc').textContent = '–'; TN.el('spec-score').textContent = '–';
      TN.el('spec-body').innerHTML = '<tr><td colspan="3" class="muted">Type a selector to analyze it.</td></tr>';
      return;
    }
    try {
      var detail = { ids: [], classes: [], attrs: [], pseudoCl: [], pseudoEl: [], elements: [], func: [] };
      var sp = fullSpec(sel, detail);
      TN.el('spec-abc').textContent = '(' + sp.join(', ') + ')';
      TN.el('spec-score').textContent = sp[0] * 100 + sp[1] * 10 + sp[2];
      var rows = [
        ['IDs (#id)', sp[0], detail.ids],
        ['Classes (.c), attributes ([a]), pseudo-classes (:hover)', sp[1], detail.classes.concat(detail.attrs, detail.pseudoCl)],
        ['Elements (div), pseudo-elements (::before)', sp[2], detail.elements.concat(detail.pseudoEl)],
        ['Functional (:not/:is/:has — max of argument)', '—', detail.func]
      ];
      TN.el('spec-body').innerHTML = rows.map(function (r) {
        return '<tr><td><strong>' + esc(r[0]) + '</strong></td><td>' + r[1] + '</td><td style="font-family:ui-monospace,monospace;font-size:.85rem">' +
          (r[2].length ? esc(r[2].join(' ')) : '<span class="muted">—</span>') + '</td></tr>';
      }).join('');
    } catch (e) {
      TN.setErr(ERR, 'Could not parse that selector.');
    }
  }
  try {
    TN.on('spec-sel', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();