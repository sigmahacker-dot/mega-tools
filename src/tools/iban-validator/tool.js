(function () {
  'use strict';
  var ERR = 'iban-validator-error';
  function calc() {
    var el = TN.el('iban-value');
    if (!el) return;
    TN.clearErr(ERR);
    var raw = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    var statusEl = TN.el('iban-status');
    var countryEl = TN.el('iban-country');
    var fmtEl = TN.el('iban-formatted');
    function reset() {
      statusEl.textContent = '–';
      countryEl.textContent = '–';
      fmtEl.textContent = '–';
    }
    if (!raw) { reset(); return; }
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(raw)) {
      reset();
      TN.setErr(ERR, 'Not a valid IBAN format: it must start with a 2-letter country code and 2 check digits, followed by 11–30 letters or digits.');
      return;
    }
    // ISO 13616 mod-97: move first 4 chars to the end, letters A=10..Z=35
    var rearranged = raw.slice(4) + raw.slice(0, 4);
    var mod = 0;
    for (var i = 0; i < rearranged.length; i++) {
      var c = rearranged.charCodeAt(i);
      if (c >= 48 && c <= 57) {
        mod = (mod * 10 + (c - 48)) % 97;
      } else {
        var v = c - 55; // A=10 ... Z=35
        mod = (mod * 100 + v) % 97;
      }
    }
    var valid = mod === 1;
    var grouped = raw.replace(/(.{4})/g, '$1 ').trim();
    statusEl.textContent = valid ? 'Valid' : 'Invalid';
    statusEl.style.color = valid ? '#166534' : '#b91c1c';
    countryEl.textContent = raw.slice(0, 2);
    fmtEl.textContent = grouped;
    if (!valid) TN.setErr(ERR, 'The mod-97 checksum failed — this IBAN is not valid. Check for typos.');
  }
  try {
    TN.on('iban-value', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
