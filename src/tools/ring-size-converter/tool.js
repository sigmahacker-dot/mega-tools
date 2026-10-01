(function () {
  'use strict';
  var ERR = 'ring-size-converter-error';
  var UK = [[3, 'F½'], [3.5, 'G½'], [4, 'H½'], [4.5, 'I½'], [5, 'J½'], [5.5, 'K½'], [6, 'L½'], [6.5, 'M½'], [7, 'N½'], [7.5, 'O½'], [8, 'P½'], [8.5, 'Q½'], [9, 'R½'], [9.5, 'S½'], [10, 'T½'], [10.5, 'U½'], [11, 'V½'], [11.5, 'W½'], [12, 'X½'], [12.5, 'Y'], [13, 'Z']];
  function calc() {
    if (!TN.el('ring-circ')) return;
    TN.clearErr(ERR);
    var c = parseFloat(TN.el('ring-circ').value);
    var d = parseFloat(TN.el('ring-dia').value);
    var us = parseFloat(TN.el('ring-us').value);
    var circ = NaN;
    if (c > 0) circ = c;
    else if (d > 0) circ = d * Math.PI;
    else if (us > 0) circ = us * 2.5 + 36.9;
    if (isNaN(circ)) { TN.setErr(ERR, 'Fill in one measurement greater than 0.'); return; }
    if (circ < 35 || circ > 80) { TN.setErr(ERR, 'That measurement is outside the normal ring range (35–80 mm circumference).'); return; }
    var usSize = Math.round((circ - 36.9) / 2.5 * 2) / 2;
    var uk = '–';
    for (var i = 0; i < UK.length; i++) { if (Math.abs(UK[i][0] - usSize) < 0.26) { uk = UK[i][1]; break; } }
    TN.el('ring-usout').textContent = usSize;
    TN.el('ring-uk').textContent = uk;
    TN.el('ring-eu').textContent = (Math.round(circ * 2) / 2).toFixed(1);
    TN.el('ring-jp').textContent = Math.round(circ - 40);
    TN.el('ring-body').innerHTML =
      '<tr><td>Inner circumference</td><td>' + circ.toFixed(1) + ' mm</td></tr>' +
      '<tr><td>Inner diameter</td><td>' + (circ / Math.PI).toFixed(2) + ' mm</td></tr>';
  }
  try {
    TN.on('ring-circ', 'input', calc);
    TN.on('ring-dia', 'input', calc);
    TN.on('ring-us', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();