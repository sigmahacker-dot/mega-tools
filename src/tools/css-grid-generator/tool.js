(function () {
  'use strict';
  var S = 'css-grid-generator';
  function vals() {
    return {
      rows: parseInt(TN.el(S + '-rows').value, 10) || 2,
      cols: parseInt(TN.el(S + '-cols').value, 10) || 3,
      gap: parseInt(TN.el(S + '-gap').value, 10) || 0,
      items: parseInt(TN.el(S + '-items').value, 10) || 6
    };
  }
  function css(v) {
    return '.grid {\n' +
      '  display: grid;\n' +
      '  grid-template-columns: repeat(' + v.cols + ', 1fr);\n' +
      '  grid-template-rows: repeat(' + v.rows + ', 1fr);\n' +
      '  gap: ' + v.gap + 'px;\n' +
      '}';
  }
  function update() {
    try {
      var v = vals();
      var demo = TN.el(S + '-demo');
      if (demo) {
        demo.style.display = 'grid';
        demo.style.gridTemplateColumns = 'repeat(' + v.cols + ', 1fr)';
        demo.style.gridTemplateRows = 'repeat(' + v.rows + ', 1fr)';
        demo.style.gap = v.gap + 'px';
        var html = '';
        for (var i = 1; i <= v.items; i++) {
          html += '<div style="background:#166534;color:#fff;border-radius:8px;min-height:56px;' +
            'display:flex;align-items:center;justify-content:center;font-weight:700;">' + i + '</div>';
        }
        demo.innerHTML = html;
      }
      var pre = TN.el(S + '-css');
      if (pre) pre.textContent = css(v);
      [['rows'], ['cols'], ['gap'], ['items']].forEach(function (k) {
        var lab = TN.el(S + '-' + k[0] + '-val');
        if (lab) lab.textContent = TN.el(S + '-' + k[0]).value;
      });
    } catch (e) { /* never throw on input */ }
  }
  function copyCss() {
    try {
      TN.copy(css(vals())).then(function (ok) {
        if (!ok) TN.setErr(S + '-error', 'Copy failed — select the CSS and copy it manually.');
        else TN.clearErr(S + '-error');
      });
    } catch (e) { TN.setErr(S + '-error', 'Copy failed.'); }
  }
  function init() {
    ['rows', 'cols', 'gap', 'items'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', update);
    });
    TN.on(S + '-copy', 'click', copyCss);
    update();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
