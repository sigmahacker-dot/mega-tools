(function () {
  'use strict';
  var ERR = 'bmi-calculator-error';
  var mode = 'metric';
  function calc() {
    var cmEl = TN.el('bmi-cm'), kgEl = TN.el('bmi-kg'),
        ftEl = TN.el('bmi-ft'), inEl = TN.el('bmi-in'), lbEl = TN.el('bmi-lb');
    if (!cmEl || !kgEl) return;
    TN.clearErr(ERR);
    var heightM, weightKg, heightIn;
    if (mode === 'metric') {
      var cm = parseFloat(cmEl.value);
      var kg = parseFloat(kgEl.value);
      if (!(cm > 0)) { TN.setErr(ERR, 'Please enter a height greater than 0 cm.'); return; }
      if (!(kg > 0)) { TN.setErr(ERR, 'Please enter a weight greater than 0 kg.'); return; }
      heightM = cm / 100;
      weightKg = kg;
      heightIn = cm / 2.54;
    } else {
      var ft = parseFloat(ftEl.value) || 0;
      var inch = parseFloat(inEl.value) || 0;
      var lb = parseFloat(lbEl.value);
      var totalIn = ft * 12 + inch;
      if (!(totalIn > 0)) { TN.setErr(ERR, 'Please enter a height greater than 0.'); return; }
      if (!(lb > 0)) { TN.setErr(ERR, 'Please enter a weight greater than 0 lb.'); return; }
      heightM = totalIn * 0.0254;
      weightKg = lb * 0.45359237;
      heightIn = totalIn;
    }
    var bmi = weightKg / (heightM * heightM);
    var cat, cls;
    if (bmi < 18.5) { cat = 'Underweight'; cls = 'tag'; }
    else if (bmi < 25) { cat = 'Normal weight'; cls = 'tag success'; }
    else if (bmi < 30) { cat = 'Overweight'; cls = 'tag'; }
    else { cat = 'Obese'; cls = 'tag error'; }

    var lo = 18.5 * heightM * heightM;
    var hi = 24.9 * heightM * heightM;
    var rangeText;
    if (mode === 'metric') {
      rangeText = lo.toFixed(1) + ' – ' + hi.toFixed(1) + ' kg';
    } else {
      rangeText = (lo / 0.45359237).toFixed(0) + ' – ' + (hi / 0.45359237).toFixed(0) + ' lb';
    }
    TN.el('bmi-value').textContent = bmi.toFixed(1);
    TN.el('bmi-range').textContent = rangeText;
    var tag = TN.el('bmi-category');
    if (tag) { tag.textContent = cat; tag.className = cls; }
  }
  function setMode(m) {
    mode = m;
    var mBtn = TN.el('bmi-metric-btn'), iBtn = TN.el('bmi-imperial-btn');
    var mF = TN.el('bmi-metric-fields'), iF = TN.el('bmi-imperial-fields');
    if (mBtn && iBtn) {
      mBtn.className = 'btn btn-sm ' + (m === 'metric' ? 'btn-primary' : 'btn-outline');
      iBtn.className = 'btn btn-sm ' + (m === 'imperial' ? 'btn-primary' : 'btn-outline');
    }
    if (mF && iF) {
      if (m === 'metric') { TN.show(mF); TN.hide(iF); }
      else { TN.hide(mF); TN.show(iF); }
    }
    TN.clearErr(ERR);
    calc();
  }
  try {
    TN.on('bmi-metric-btn', 'click', function () { setMode('metric'); });
    TN.on('bmi-imperial-btn', 'click', function () { setMode('imperial'); });
    ['bmi-cm', 'bmi-kg', 'bmi-ft', 'bmi-in', 'bmi-lb'].forEach(function (id) {
      TN.on(id, 'input', calc);
    });
  } catch (e) { /* never throw on load */ }
})();
