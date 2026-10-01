(function () {
  'use strict';
  var ERR = 'credit-card-validator-error';
  function brand(digits) {
    if (/^4/.test(digits)) return 'Visa';
    if (/^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[01][0-9]|720))/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'American Express';
    if (/^6/.test(digits)) return 'Discover';
    return 'Unknown';
  }
  function luhnOk(digits) {
    var sum = 0, dbl = false;
    for (var i = digits.length - 1; i >= 0; i--) {
      var d = digits.charCodeAt(i) - 48;
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }
  function calc() {
    var el = TN.el('card-number');
    if (!el) return;
    TN.clearErr(ERR);
    var digits = el.value.replace(/\D/g, '');
    var statusEl = TN.el('card-status');
    var brandEl = TN.el('card-brand');
    if (!digits) { statusEl.textContent = '–'; brandEl.textContent = '–'; statusEl.style.color = ''; return; }
    if (!/^\d+$/.test(digits) || digits.length < 13 || digits.length > 19) {
      statusEl.textContent = 'Invalid';
      statusEl.style.color = '#b91c1c';
      brandEl.textContent = '–';
      TN.setErr(ERR, 'Card numbers must be 13–19 digits long.');
      return;
    }
    var ok = luhnOk(digits);
    statusEl.textContent = ok ? 'Valid' : 'Invalid';
    statusEl.style.color = ok ? '#166534' : '#b91c1c';
    brandEl.textContent = brand(digits);
    if (!ok) TN.setErr(ERR, 'The Luhn checksum failed — this number is not a well-formed card number.');
  }
  try {
    TN.on('card-number', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
