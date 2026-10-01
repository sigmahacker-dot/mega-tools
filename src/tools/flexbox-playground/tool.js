(function () {
  'use strict';
  var S = 'flexbox-playground';
  var PROPS = ['direction', 'wrap', 'justify', 'align-items', 'align-content'];
  function vals() {
    return {
      direction: TN.el(S + '-direction').value,
      wrap: TN.el(S + '-wrap').value,
      justify: TN.el(S + '-justify').value,
      alignItems: TN.el(S + '-align-items').value,
      alignContent: TN.el(S + '-align-content').value,
      gap: TN.el(S + '-gap').value,
      items: parseInt(TN.el(S + '-items').value, 10) || 5
    };
  }
  function css(v) {
    return '.container {\n' +
      '  display: flex;\n' +
      '  flex-direction: ' + v.direction + ';\n' +
      '  flex-wrap: ' + v.wrap + ';\n' +
      '  justify-content: ' + v.justify + ';\n' +
      '  align-items: ' + v.alignItems + ';\n' +
      '  align-content: ' + v.alignContent + ';\n' +
      '  gap: ' + v.gap + 'px;\n' +
      '}';
  }
  function update() {
    try {
      var v = vals();
      var demo = TN.el(S + '-demo');
      if (demo) {
        demo.style.display = 'flex';
        demo.style.flexDirection = v.direction;
        demo.style.flexWrap = v.wrap;
        demo.style.justifyContent = v.justify;
        demo.style.alignItems = v.alignItems;
        demo.style.alignContent = v.alignContent;
        demo.style.gap = v.gap + 'px';
        var html = '';
        for (var i = 1; i <= v.items; i++) {
          html += '<div style="background:#4D7C0F;color:#fff;border-radius:8px;min-width:56px;min-height:56px;' +
            'display:flex;align-items:center;justify-content:center;font-weight:700;">' + i + '</div>';
        }
        demo.innerHTML = html;
      }
      var pre = TN.el(S + '-css');
      if (pre) pre.textContent = css(v);
      var gv = TN.el(S + '-gap-val');
      if (gv) gv.textContent = v.gap;
      var iv = TN.el(S + '-items-val');
      if (iv) iv.textContent = v.items;
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
    ['direction', 'wrap', 'justify', 'align-items', 'align-content'].forEach(function (k) {
      TN.on(S + '-' + k, 'change', update);
    });
    TN.on(S + '-gap', 'input', update);
    TN.on(S + '-items', 'input', update);
    TN.on(S + '-copy', 'click', copyCss);
    update();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
