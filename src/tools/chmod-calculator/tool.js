/* chmod Calculator — rwx checkboxes ↔ octal ↔ symbolic, live both ways, with special bits. */
(function () {
  'use strict';
  var SLUG = 'chmod-calculator';
  var WHO = ['u', 'g', 'o'], PERM = ['r', 'w', 'x'];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function readBits() {
    var bits = { u: 0, g: 0, o: 0 };
    WHO.forEach(function (w) {
      var v = 0;
      if (el(SLUG + '-' + w + '-r').checked) v += 4;
      if (el(SLUG + '-' + w + '-w').checked) v += 2;
      if (el(SLUG + '-' + w + '-x').checked) v += 1;
      bits[w] = v;
    });
    var special = 0;
    if (el(SLUG + '-setuid').checked) special += 4;
    if (el(SLUG + '-setgid').checked) special += 2;
    if (el(SLUG + '-sticky').checked) special += 1;
    return { bits: bits, special: special };
  }

  function symbolic(bits, special) {
    var s = '';
    WHO.forEach(function (w, wi) {
      var v = bits[w];
      s += (v & 4) ? 'r' : '-';
      s += (v & 2) ? 'w' : '-';
      var x = (v & 1) ? true : false;
      var sp = wi === 0 ? (special & 4) : wi === 1 ? (special & 2) : (special & 1);
      if (wi === 2 && (special & 1)) s += x ? 't' : 'T';
      else if (sp) s += x ? 's' : 'S';
      else s += x ? 'x' : '-';
    });
    return s;
  }

  function render() {
    clear();
    var r = readBits();
    var oct = '' + r.bits.u + r.bits.g + r.bits.o;
    var full = (r.special ? String(r.special) : '') + oct;
    el(SLUG + '-octal').value = full;
    el(SLUG + '-symbolic').value = symbolic(r.bits, r.special);
    el(SLUG + '-cmd').textContent = 'chmod ' + full + ' filename';
  }

  function fromOctal(str) {
    clear();
    if (!/^[0-7]{3,4}$/.test(str.trim())) { fail('Octal must be 3–4 digits, each 0–7 (e.g. 755).'); return; }
    var d = str.trim().split('').map(Number);
    var special = d.length === 4 ? d.shift() : 0;
    var vals = d;
    WHO.forEach(function (w, i) {
      el(SLUG + '-' + w + '-r').checked = !!(vals[i] & 4);
      el(SLUG + '-' + w + '-w').checked = !!(vals[i] & 2);
      el(SLUG + '-' + w + '-x').checked = !!(vals[i] & 1);
    });
    el(SLUG + '-setuid').checked = !!(special & 4);
    el(SLUG + '-setgid').checked = !!(special & 2);
    el(SLUG + '-sticky').checked = !!(special & 1);
    render();
  }

  function fromSymbolic(str) {
    clear();
    var m = /^(-|r)(-|w)(-|x|s|S)(-|r)(-|w)(-|x|s|S)(-|r)(-|w)(-|x|t|T)$/.exec(str.trim());
    if (!m) { fail('Symbolic must look like rwxr-xr-x (9 chars).'); return; }
    var vals = [0, 0, 0], special = 0;
    for (var w = 0; w < 3; w++) {
      var r = m[1 + w * 3] === 'r', ww = m[2 + w * 3] === 'w', x = m[3 + w * 3];
      vals[w] = (r ? 4 : 0) + (ww ? 2 : 0) + ((x === 'x' || x === 's' || x === 't') ? 1 : 0);
      if (x === 's' || x === 'S') special |= (w === 0 ? 4 : 2);
      if (x === 't' || x === 'T') special |= 1;
    }
    WHO.forEach(function (who, i) {
      el(SLUG + '-' + who + '-r').checked = !!(vals[i] & 4);
      el(SLUG + '-' + who + '-w').checked = !!(vals[i] & 2);
      el(SLUG + '-' + who + '-x').checked = !!(vals[i] & 1);
    });
    el(SLUG + '-setuid').checked = !!(special & 4);
    el(SLUG + '-setgid').checked = !!(special & 2);
    el(SLUG + '-sticky').checked = !!(special & 1);
    render();
  }

  try {
    var boxes = document.querySelectorAll('#' + SLUG + '-grid input, #' + SLUG + '-setuid, #' + SLUG + '-setgid, #' + SLUG + '-sticky');
    for (var i = 0; i < boxes.length; i++) boxes[i].addEventListener('change', render);
    TN.on(SLUG + '-octal', 'input', function () { fromOctal(el(SLUG + '-octal').value); });
    TN.on(SLUG + '-symbolic', 'input', function () { fromSymbolic(el(SLUG + '-symbolic').value); });
    TN.on(SLUG + '-preset-755', 'click', function () { fromOctal('755'); });
    TN.on(SLUG + '-preset-644', 'click', function () { fromOctal('644'); });
    TN.on(SLUG + '-preset-600', 'click', function () { fromOctal('600'); });
    TN.on(SLUG + '-preset-777', 'click', function () { fromOctal('777'); });
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(el(SLUG + '-cmd').textContent).then(function (ok) {
        if (!ok) fail('Copy failed — select the text manually.');
      });
    });
    render();
  } catch (e) { /* never throw on load */ }
})();
