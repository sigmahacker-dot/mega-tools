(function () {
  'use strict';
  var ERR = 'fence-calculator-error';
  function calc() {
    if (!TN.el('fence-length')) return;
    TN.clearErr(ERR);
    var L = parseFloat(TN.el('fence-length').value);
    var sp = parseFloat(TN.el('fence-spacing').value);
    var pw = parseFloat(TN.el('fence-picket').value);
    var rails = parseInt(TN.el('fence-rails').value, 10);
    if (!(L > 0)) { TN.setErr(ERR, 'Enter a fence length greater than 0 ft.'); return; }
    if (!(sp > 0)) { TN.setErr(ERR, 'Enter post spacing greater than 0 ft.'); return; }
    if (!(pw > 0)) { TN.setErr(ERR, 'Enter a picket width greater than 0 inches.'); return; }
    var sections = Math.ceil(L / sp - 1e-9);
    var posts = sections + 1;
    var pickets = Math.ceil(L * 12 / pw - 1e-9);
    TN.el('fence-posts').textContent = posts;
    TN.el('fence-pickets').textContent = pickets;
    TN.el('fence-railsout').textContent = sections * rails;
  }
  try {
    TN.on('fence-length', 'input', calc);
    TN.on('fence-spacing', 'input', calc);
    TN.on('fence-picket', 'input', calc);
    TN.on('fence-rails', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();