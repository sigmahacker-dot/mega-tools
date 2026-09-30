(function () {
  'use strict';
  var ERR = 'gst-calculator-error';
  var rate = 18;
  var inclusive = false;
  function money(n) {
    try {
      return n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    } catch (e) { return String(Math.round(n * 100) / 100); }
  }
  function markPreset() {
    var btns = TN.qsa('.gst-rate');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var isActive = parseFloat(b.getAttribute('data-rate')) === rate;
      b.className = 'btn btn-sm gst-rate ' + (isActive ? 'btn-primary' : 'btn-outline');
    }
  }
  function setMode(inc) {
    inclusive = inc;
    var ex = TN.el('gst-exclusive-btn'), inb = TN.el('gst-inclusive-btn');
    if (ex) ex.className = 'btn btn-sm ' + (!inc ? 'btn-primary' : 'btn-outline');
    if (inb) inb.className = 'btn btn-sm ' + (inc ? 'btn-primary' : 'btn-outline');
    calc();
  }
  function calc() {
    var aEl = TN.el('gst-amount');
    if (!aEl) return;
    TN.clearErr(ERR);
    var amount = parseFloat(aEl.value);
    if (!(amount >= 0) || isNaN(amount)) { TN.setErr(ERR, 'Please enter a valid amount.'); return; }
    if (!(rate >= 0) || isNaN(rate)) { TN.setErr(ERR, 'Please enter a valid GST rate.'); return; }
    var base, tax, total;
    if (inclusive) {
      total = amount;
      base = amount / (1 + rate / 100);
      tax = amount - base;
    } else {
      base = amount;
      tax = amount * rate / 100;
      total = amount + tax;
    }
    TN.el('gst-base').textContent = money(base);
    TN.el('gst-tax').textContent = money(tax);
    TN.el('gst-total').textContent = money(total);
    var sum = TN.el('gst-summary');
    if (sum) {
      sum.textContent = inclusive
        ? 'Your amount of ' + money(amount) + ' already includes ' + money(tax) + ' GST at ' + rate + '%.'
        : 'GST of ' + money(tax) + ' (' + rate + '%) added to ' + money(amount) + '.';
    }
  }
  try {
    var btns = TN.qsa('.gst-rate');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        TN.on(b, 'click', function () {
          rate = parseFloat(b.getAttribute('data-rate'));
          var c = TN.el('gst-custom');
          if (c) c.value = '';
          markPreset();
          calc();
        });
      })(btns[i]);
    }
    TN.on('gst-custom', 'input', function () {
      var c = TN.el('gst-custom');
      if (!c) return;
      var v = parseFloat(c.value);
      if (!isNaN(v) && v >= 0) {
        rate = v;
        markPreset();
        calc();
      } else if (c.value === '') {
        markPreset();
      }
    });
    TN.on('gst-exclusive-btn', 'click', function () { setMode(false); });
    TN.on('gst-inclusive-btn', 'click', function () { setMode(true); });
    TN.on('gst-amount', 'input', calc);
    markPreset();
    calc();
  } catch (e) { /* never throw on load */ }
})();
