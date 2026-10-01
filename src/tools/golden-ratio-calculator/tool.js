(function () {
  'use strict';
  var P = 'golden-ratio-calculator-', ERR = P + 'error';
  var PHI = (1 + Math.sqrt(5)) / 2;
  function update() {
    try {
      TN.clearErr(ERR);
      var base = parseFloat(TN.el(P + 'base').value);
      if (!(base > 0)) { TN.setErr(ERR, 'Enter a base value greater than 0.'); return; }
      function f(n) { return (Math.round(n * 100) / 100).toLocaleString('en-US'); }
      TN.el(P + 'phi').textContent = PHI.toFixed(10);
      TN.el(P + 'up').textContent = f(base * PHI);
      TN.el(P + 'down').textContent = f(base / PHI);
      var steps = [['÷ φ²', base / (PHI * PHI)], ['÷ φ', base / PHI], ['base', base], ['× φ', base * PHI], ['× φ²', base * PHI * PHI]];
      TN.el(P + 'body').innerHTML = steps.map(function (s) {
        return '<tr><td>' + s[0] + '</td><td>' + f(s[1]) + '</td></tr>';
      }).join('');
      var rect = TN.el(P + 'rect');
      rect.style.aspectRatio = PHI.toFixed(6) + ' / 1';
      rect.style.maxWidth = Math.min(480, base * 2) + 'px';
    } catch (e) { TN.setErr(ERR, 'Could not compute the golden ratio. Please try again.'); }
  }
  try {
    TN.on(P + 'base', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
