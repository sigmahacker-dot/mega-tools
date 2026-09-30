(function () {
  'use strict';
  var ERR = 'currency-converter-error';
  var CURRENCIES = [
    'USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SAR', 'CNY', 'JPY', 'AUD', 'CAD',
    'CHF', 'SEK', 'NOK', 'DKK', 'TRY', 'QAR', 'KWD', 'BHD', 'OMR', 'MYR', 'IDR',
    'THB', 'SGD', 'HKD', 'NZD', 'ZAR', 'MXN', 'BRL', 'KRW', 'PHP', 'BDT', 'NPR', 'LKR'
  ];
  var cache = {};   // base -> { rates, date }
  var fetching = {}; // base -> Promise

  function fmtNum(n) {
    try { return n.toLocaleString('en-US', { maximumFractionDigits: 2 }); }
    catch (e) { return String(Math.round(n * 100) / 100); }
  }
  function fillSelect(el, selected) {
    if (!el) return;
    var html = '';
    CURRENCIES.forEach(function (c) {
      html += '<option value="' + c + '"' + (c === selected ? ' selected' : '') + '>' + c + '</option>';
    });
    el.innerHTML = html;
  }
  function getRates(base) {
    if (cache[base]) return Promise.resolve(cache[base]);
    if (fetching[base]) return fetching[base];
    var p = fetch('/api/rates?base=' + encodeURIComponent(base)).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      if (!data || !data.rates) throw new Error('bad response');
      var entry = { rates: data.rates, date: data.date || '' };
      cache[base] = entry;
      delete fetching[base];
      return entry;
    }).catch(function (err) {
      delete fetching[base];
      throw err;
    });
    fetching[base] = p;
    return p;
  }
  function convert() {
    var aEl = TN.el('currency-amount'), fEl = TN.el('currency-from'), tEl = TN.el('currency-to');
    if (!aEl || !fEl || !tEl) return;
    TN.clearErr(ERR);
    var amount = parseFloat(aEl.value);
    var from = fEl.value, to = tEl.value;
    var upd = TN.el('currency-updated');
    if (isNaN(amount)) {
      if (upd) upd.textContent = 'Enter an amount to convert.';
      return;
    }
    if (!(amount >= 0)) { TN.setErr(ERR, 'Please enter an amount of 0 or more.'); return; }
    if (from === to) {
      TN.el('currency-value').textContent = fmtNum(amount) + ' ' + to;
      TN.el('currency-rate').textContent = '1 ' + from + ' = 1 ' + to;
      if (upd) upd.textContent = 'Same currency — no conversion needed.';
      return;
    }
    TN.el('currency-value').textContent = 'Loading…';
    getRates(from).then(function (entry) {
      var r = entry.rates[to];
      if (typeof r !== 'number' || !(r > 0)) {
        TN.setErr(ERR, 'Rate not available for ' + to + '. Try another currency.');
        TN.el('currency-value').textContent = '–';
        TN.el('currency-rate').textContent = '–';
        return;
      }
      var result = amount * r;
      TN.el('currency-value').textContent = fmtNum(result) + ' ' + to;
      TN.el('currency-rate').textContent = '1 ' + from + ' = ' + r + ' ' + to;
      if (upd) upd.textContent = 'Rates updated: ' + (entry.date || 'recently') + ' (base ' + from + ')';
    }).catch(function () {
      TN.setErr(ERR, 'Could not fetch exchange rates. Please check your connection and try again.');
      TN.el('currency-value').textContent = '–';
      TN.el('currency-rate').textContent = '–';
    });
  }
  try {
    fillSelect(TN.el('currency-from'), 'USD');
    fillSelect(TN.el('currency-to'), 'PKR');
    TN.on('currency-convert-btn', 'click', convert);
    TN.on('currency-swap-btn', 'click', function () {
      var fEl = TN.el('currency-from'), tEl = TN.el('currency-to');
      if (!fEl || !tEl) return;
      var tmp = fEl.value;
      fEl.value = tEl.value;
      tEl.value = tmp;
      convert();
    });
    var run = TN.debounce ? TN.debounce(convert, 300) : convert;
    TN.on('currency-amount', 'input', run);
    TN.on('currency-from', 'change', convert);
    TN.on('currency-to', 'change', convert);
  } catch (e) { /* never throw on load */ }
})();
