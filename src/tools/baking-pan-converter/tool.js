(function () {
  'use strict';
  var S = 'baking-pan-converter';
  function num(id) {
    var v = parseFloat(TN.el(id).value);
    return isFinite(v) && v > 0 ? v : NaN;
  }
  function fmtMl(ml) {
    if (!isFinite(ml)) return '–';
    var cups = ml / 236.5882365;
    return Math.round(ml) + ' ml (' + (Math.round(cups * 10) / 10) + ' cups)';
  }
  function panVolume(shape, d1, d2, depth) {
    if (shape === 'round') {
      if (!isFinite(d1) || !isFinite(depth)) return NaN;
      return Math.PI * Math.pow(d1 / 2, 2) * depth;
    }
    if (!isFinite(d1) || !isFinite(d2) || !isFinite(depth)) return NaN;
    return d1 * d2 * depth;
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var noteEl = TN.el(S + '-note');
      var shapeA = TN.el(S + '-shapeA').value;
      var shapeB = TN.el(S + '-shapeB').value;
      var toCm = TN.el(S + '-units').value === 'in' ? 2.54 : 1;
      var volA = panVolume(shapeA, num(S + '-a1') * toCm, num(S + '-a2') * toCm, num(S + '-depthA') * toCm);
      var volB = panVolume(shapeB, num(S + '-b1') * toCm, num(S + '-b2') * toCm, num(S + '-depthB') * toCm);
      if (TN.el(S + '-volA')) TN.el(S + '-volA').textContent = fmtMl(volA);
      if (TN.el(S + '-volB')) TN.el(S + '-volB').textContent = fmtMl(volB);
      if (!isFinite(volA) || !isFinite(volB)) {
        if (TN.el(S + '-factor')) TN.el(S + '-factor').textContent = '–';
        if (noteEl) noteEl.textContent = 'Enter both pans\' dimensions to compare. Round pans use diameter; square/rectangular pans need length, width and depth.';
        return;
      }
      var factor = volB / volA;
      if (TN.el(S + '-factor')) TN.el(S + '-factor').textContent = '× ' + (Math.round(factor * 100) / 100);
      /* assume batter filled pan A to half; estimate fill level of pan B */
      var estFillB = 0.5 / factor;
      var warn;
      if (estFillB > 0.67) warn = ' Warning: the same batter would fill pan B to about ' + Math.round(estFillB * 100) + '% — over two-thirds full, risk of overflow.';
      else if (estFillB < 0.5) warn = ' Note: the same batter would only fill pan B to about ' + Math.round(estFillB * 100) + '% — under half full, so the bake may dry out unless you scale the recipe up.';
      else warn = ' Fill looks healthy: about ' + Math.round(estFillB * 100) + '% full (target ½–⅔).';
      if (noteEl) noteEl.textContent = 'Multiply every ingredient by ×' + (Math.round(factor * 100) / 100) + '.' + warn;
    } catch (e) { /* never throw on input */ }
  }
  function syncShapes() {
    try {
      if (TN.el(S + '-shapeA').value === 'rect') TN.show(S + '-a2-wrap'); else TN.hide(S + '-a2-wrap');
      if (TN.el(S + '-shapeB').value === 'rect') TN.show(S + '-b2-wrap'); else TN.hide(S + '-b2-wrap');
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['a1', 'a2', 'b1', 'b2', 'depthA', 'depthB'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
    });
    ['shapeA', 'shapeB', 'units'].forEach(function (k) {
      TN.on(S + '-' + k, 'change', function () { syncShapes(); convert(); });
    });
    syncShapes();
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
