(function () {
  'use strict';
  var ERR = 'px-to-rem-converter-error';
  function base() {
    var v = parseFloat(TN.el('pxrem-base').value);
    return (v > 0) ? v : 16;
  }
  function fmt(n) {
    var r = Math.round(n * 10000) / 10000;
    return String(r);
  }
  function renderTable() {
    var b = base(), html = '';
    [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96].forEach(function (px) {
      html += '<tr><td><strong>' + px + 'px</strong></td><td>' + fmt(px / b) + 'rem</td></tr>';
    });
    TN.el('pxrem-table').innerHTML = html;
  }
  function fromPx() {
    TN.clearErr(ERR);
    var b = base();
    var px = parseFloat(TN.el('pxrem-px').value);
    if (isNaN(px)) { TN.el('pxrem-out').textContent = '–'; TN.el('pxrem-out-l').textContent = 'Result'; renderTable(); return; }
    var rem = px / b;
    TN.el('pxrem-rem').value = fmt(rem);
    TN.el('pxrem-out').textContent = fmt(rem) + 'rem';
    TN.el('pxrem-out-l').textContent = px + 'px ÷ ' + b;
    renderTable();
  }
  function fromRem() {
    TN.clearErr(ERR);
    var b = base();
    var rem = parseFloat(TN.el('pxrem-rem').value);
    if (isNaN(rem)) { TN.el('pxrem-out').textContent = '–'; TN.el('pxrem-out-l').textContent = 'Result'; renderTable(); return; }
    var px = rem * b;
    TN.el('pxrem-px').value = fmt(px);
    TN.el('pxrem-out').textContent = fmt(px) + 'px';
    TN.el('pxrem-out-l').textContent = rem + 'rem × ' + b;
    renderTable();
  }
  try {
    TN.on('pxrem-base', 'input', function () { TN.clearErr(ERR); renderTable(); fromPx(); });
    TN.on('pxrem-px', 'input', fromPx);
    TN.on('pxrem-rem', 'input', fromRem);
    renderTable();
  } catch (e) { /* never throw on load */ }
})();