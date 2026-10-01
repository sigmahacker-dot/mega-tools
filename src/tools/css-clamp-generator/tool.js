(function () {
  'use strict';
  var P = 'css-clamp-generator-', ERR = P + 'error';
  function num(id) { var v = parseFloat(TN.el(P + id).value); return isNaN(v) ? NaN : v; }
  function fmt(n, unit) {
    var s = (Math.round(n * 10000) / 10000).toString();
    return s + unit;
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var minS = num('min'), maxS = num('max'), minV = num('minvw'), maxV = num('maxvw');
      var useRem = TN.el(P + 'rem').checked;
      if (!(minS > 0) || !(maxS > 0)) { TN.setErr(ERR, 'Min and max sizes must be greater than 0.'); return; }
      if (minS >= maxS) { TN.setErr(ERR, 'Max size must be larger than min size.'); return; }
      if (!(minV > 0) || !(maxV > 0) || minV >= maxV) { TN.setErr(ERR, 'Viewport range must be positive with min < max.'); return; }
      var slope = (maxS - minS) / (maxV - minV);
      var intercept = minS - slope * minV;
      var unit = useRem ? 'rem' : 'px', div = useRem ? 16 : 1;
      var css = 'font-size: clamp(' + fmt(minS / div, unit) + ', ' + fmt(intercept / div, unit) + ' + ' + fmt(slope * 100 / div, 'vw') + ', ' + fmt(maxS / div, unit) + ');';
      TN.el(P + 'css').value = css;
      TN.el(P + 'demo').style.fontSize = 'clamp(' + (minS / div) + unit + ', ' + (intercept / div) + unit + ' + ' + (slope * 100 / div) + 'vw, ' + (maxS / div) + unit + ')';
      TN.el(P + 'math').textContent = 'Slope = (' + maxS + '−' + minS + ')/(' + maxV + '−' + minV + ') = ' + (slope * 100).toFixed(4) + 'vw per 100vw; intercept = ' + intercept.toFixed(2) + 'px.';
    } catch (e) { TN.setErr(ERR, 'Could not generate the clamp() rule. Please try again.'); }
  }
  try {
    ['min', 'max', 'minvw', 'maxvw'].forEach(function (k) { TN.on(P + k, 'input', update); });
    TN.on(P + 'rem', 'change', update);
    TN.on(P + 'copy', 'click', function () {
      var v = TN.el(P + 'css').value;
      if (!v) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
      TN.clearErr(ERR);
      TN.copy(v).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy CSS'; }, 1200);
      });
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
