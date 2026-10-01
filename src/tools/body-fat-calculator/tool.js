(function () {
  'use strict';
  var ERR = 'body-fat-calculator-error';
  function log10(x) { return Math.log(x) / Math.LN10; }
  function category(sex, bf) {
    if (sex === 'male') {
      if (bf < 6) return 'Essential fat';
      if (bf <= 13) return 'Athletes';
      if (bf <= 17) return 'Fitness';
      if (bf <= 24) return 'Average';
      return 'Obese';
    }
    if (bf < 14) return 'Essential fat';
    if (bf <= 20) return 'Athletes';
    if (bf <= 24) return 'Fitness';
    if (bf <= 31) return 'Average';
    return 'Obese';
  }
  function calc() {
    if (!TN.el('bf-sex')) return;
    TN.clearErr(ERR);
    var sex = TN.el('bf-sex').value;
    var height = parseFloat(TN.el('bf-height').value);
    var neck = parseFloat(TN.el('bf-neck').value);
    var waist = parseFloat(TN.el('bf-waist').value);
    var hip = parseFloat(TN.el('bf-hip').value);
    TN.el('bf-hip-wrap').style.display = sex === 'female' ? '' : 'none';
    if (!(height >= 100 && height <= 250)) { TN.setErr(ERR, 'Enter a height between 100 and 250 cm.'); return; }
    if (!(neck >= 20 && neck <= 80)) { TN.setErr(ERR, 'Enter a neck measurement between 20 and 80 cm.'); return; }
    if (!(waist >= 40 && waist <= 250)) { TN.setErr(ERR, 'Enter a waist measurement between 40 and 250 cm.'); return; }
    var bf;
    if (sex === 'male') {
      if (!(waist > neck)) { TN.setErr(ERR, 'Waist must be larger than neck for the formula to work.'); return; }
      bf = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450;
    } else {
      if (!(hip >= 40 && hip <= 250)) { TN.setErr(ERR, 'Enter a hip measurement between 40 and 250 cm.'); return; }
      if (!((waist + hip) > neck)) { TN.setErr(ERR, 'Waist + hip must be larger than neck for the formula to work.'); return; }
      bf = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450;
    }
    if (!(bf > 0 && bf < 80)) { TN.setErr(ERR, 'The measurements produced an implausible result — please check your entries.'); return; }
    TN.el('bf-pct').textContent = (Math.round(bf * 10) / 10).toLocaleString('en-US') + '%';
    TN.el('bf-category').textContent = category(sex, bf);
  }
  try {
    ['bf-sex', 'bf-height', 'bf-neck', 'bf-waist', 'bf-hip'].forEach(function (id) {
      TN.on(id, 'input', calc);
      TN.on(id, 'change', calc);
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
