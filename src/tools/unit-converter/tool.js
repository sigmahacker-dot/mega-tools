(function () {
  'use strict';
  var ERR = 'unit-converter-error';
  // factor = how many base units one unit equals
  var UNITS = {
    length: {
      base: 'm',
      list: [
        ['mm', 'Millimeter', 0.001], ['cm', 'Centimeter', 0.01], ['m', 'Meter', 1],
        ['km', 'Kilometer', 1000], ['in', 'Inch', 0.0254], ['ft', 'Foot', 0.3048],
        ['yd', 'Yard', 0.9144], ['mi', 'Mile', 1609.344]
      ]
    },
    weight: {
      base: 'kg',
      list: [
        ['mg', 'Milligram', 0.000001], ['g', 'Gram', 0.001], ['kg', 'Kilogram', 1],
        ['t', 'Metric ton', 1000], ['oz', 'Ounce', 0.028349523125],
        ['lb', 'Pound', 0.45359237], ['st', 'Stone', 6.35029318]
      ]
    },
    temperature: {
      base: 'c',
      list: [['c', 'Celsius (°C)'], ['f', 'Fahrenheit (°F)'], ['k', 'Kelvin (K)']]
    },
    data: {
      base: 'B',
      list: [
        ['bit', 'Bit', 1 / 8], ['B', 'Byte', 1],
        ['Kb', 'Kilobit', 128], ['KB', 'Kilobyte', 1024],
        ['Mb', 'Megabit', 131072], ['MB', 'Megabyte', 1048576],
        ['Gb', 'Gigabit', 134217728], ['GB', 'Gigabyte', 1073741824],
        ['TB', 'Terabyte', 1099511627776]
      ]
    },
    speed: {
      base: 'm/s',
      list: [
        ['m/s', 'Meter/second', 1], ['km/h', 'Kilometer/hour', 1 / 3.6],
        ['mph', 'Mile/hour', 0.44704], ['kn', 'Knot', 0.514444], ['ft/s', 'Foot/second', 0.3048]
      ]
    },
    area: {
      base: 'm²',
      list: [
        ['cm²', 'Square centimeter', 0.0001], ['m²', 'Square meter', 1],
        ['ha', 'Hectare', 10000], ['km²', 'Square kilometer', 1000000],
        ['in²', 'Square inch', 0.00064516], ['ft²', 'Square foot', 0.09290304],
        ['yd²', 'Square yard', 0.83612736], ['ac', 'Acre', 4046.8564224],
        ['mi²', 'Square mile', 2589988.110336]
      ]
    }
  };
  function toCelsius(v, unit) {
    if (unit === 'c') return v;
    if (unit === 'f') return (v - 32) * 5 / 9;
    if (unit === 'k') return v - 273.15;
    return NaN;
  }
  function fromCelsius(v, unit) {
    if (unit === 'c') return v;
    if (unit === 'f') return v * 9 / 5 + 32;
    if (unit === 'k') return v + 273.15;
    return NaN;
  }
  function factor(cat, unit) {
    var list = UNITS[cat].list;
    for (var i = 0; i < list.length; i++) {
      if (list[i][0] === unit) return list[i][2];
    }
    return NaN;
  }
  function unitLabel(cat, unit) {
    var list = UNITS[cat].list;
    for (var i = 0; i < list.length; i++) {
      if (list[i][0] === unit) return list[i][1];
    }
    return unit;
  }
  function fillUnits() {
    var catEl = TN.el('unit-category'), fEl = TN.el('unit-from'), tEl = TN.el('unit-to');
    if (!catEl || !fEl || !tEl) return;
    var cat = catEl.value;
    var list = UNITS[cat] ? UNITS[cat].list : [];
    var fHtml = '', tHtml = '';
    list.forEach(function (u, i) {
      fHtml += '<option value="' + u[0] + '"' + (i === 0 ? ' selected' : '') + '>' + u[1] + '</option>';
      tHtml += '<option value="' + u[0] + '"' + (i === Math.min(1, list.length - 1) ? ' selected' : '') + '>' + u[1] + '</option>';
    });
    fEl.innerHTML = fHtml;
    tEl.innerHTML = tHtml;
  }
  function fmtNum(n) {
    var r = Math.abs(n) < 1e-12 ? 0 : n;
    var rounded = Math.round(r * 1e10) / 1e10;
    try { return rounded.toLocaleString('en-US', { maximumFractionDigits: 10 }); }
    catch (e) { return String(rounded); }
  }
  function calc() {
    var catEl = TN.el('unit-category'), vEl = TN.el('unit-value'),
        fEl = TN.el('unit-from'), tEl = TN.el('unit-to');
    if (!catEl || !vEl || !fEl || !tEl) return;
    TN.clearErr(ERR);
    var cat = catEl.value;
    var v = parseFloat(vEl.value);
    var out = TN.el('unit-output');
    var formula = TN.el('unit-formula');
    if (isNaN(v)) { if (out) out.textContent = '–'; if (formula) formula.textContent = ''; return; }
    var from = fEl.value, to = tEl.value;
    var result, note;
    if (cat === 'temperature') {
      if (from === 'k' && v < 0) { TN.setErr(ERR, 'Kelvin cannot be below 0 (absolute zero).'); return; }
      var c = toCelsius(v, from);
      if (to === 'k' && c < -273.15) { TN.setErr(ERR, 'That temperature is below absolute zero.'); return; }
      result = fromCelsius(c, to);
      note = 'Temperature converts through Celsius (e.g. F = C × 9/5 + 32, K = C + 273.15).';
    } else {
      var ff = factor(cat, from), tf = factor(cat, to);
      if (isNaN(ff) || isNaN(tf) || tf === 0) { TN.setErr(ERR, 'Unknown unit selected.'); return; }
      result = v * ff / tf;
      note = fmtNum(v) + ' ' + unitLabel(cat, from) + ' = ' + fmtNum(result) + ' ' + unitLabel(cat, to);
    }
    if (out) out.textContent = fmtNum(result) + ' ' + unitLabel(cat, to);
    if (formula) formula.textContent = note;
  }
  try {
    fillUnits();
    TN.on('unit-category', 'change', function () { fillUnits(); calc(); });
    TN.on('unit-value', 'input', calc);
    TN.on('unit-from', 'change', calc);
    TN.on('unit-to', 'change', calc);
  } catch (e) { /* never throw on load */ }
})();
