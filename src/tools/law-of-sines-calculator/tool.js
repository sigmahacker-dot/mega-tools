/* Law of sines triangle solver with ambiguous SSA handling. */
(function () {
  'use strict';
  var SLUG = 'law-of-sines-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  function tri(a, b, c, A, B, C) {
    return '  sides: a=' + f(a) + ', b=' + f(b) + ', c=' + f(c) +
           '\n  angles: A=' + f(A) + '\u00B0, B=' + f(B) + '\u00B0, C=' + f(C) + '\u00B0';
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var cs = $(SLUG + '-case').value;
    var v1 = parseFloat($(SLUG + '-v1').value), v2 = parseFloat($(SLUG + '-v2').value), v3 = parseFloat($(SLUG + '-v3').value);
    if (isNaN(v1) || isNaN(v2) || isNaN(v3)) { err('Enter all three values.'); return; }
    var out = [];
    if (cs === 'AAS') {
      var A = v1, B = v2, a = v3;
      if (A <= 0 || B <= 0 || A + B >= 180 || a <= 0) { err('Angles must be positive with A+B < 180\u00B0, side a > 0.'); return; }
      var C = 180 - A - B;
      var k = a / Math.sin(A * D2R);
      var b = k * Math.sin(B * D2R), c = k * Math.sin(C * D2R);
      out.push('Law of sines: a/sin A = b/sin B = c/sin C');
      out.push('C = 180\u00B0 \u2212 A \u2212 B = ' + f(C) + '\u00B0');
      out.push('k = a / sin A = ' + f(a) + ' / sin ' + f(A) + '\u00B0 = ' + f(k));
      out.push('b = k \u00D7 sin B = ' + f(b) + '      c = k \u00D7 sin C = ' + f(c));
      out.push('\nSolution:\n' + tri(a, b, c, A, B, C));
    } else if (cs === 'ASA') {
      var A2 = v1, B2 = v2, c2 = v3;
      if (A2 <= 0 || B2 <= 0 || A2 + B2 >= 180 || c2 <= 0) { err('Angles must be positive with A+B < 180\u00B0, side c > 0.'); return; }
      var C2 = 180 - A2 - B2;
      var k2 = c2 / Math.sin(C2 * D2R);
      var a2 = k2 * Math.sin(A2 * D2R), b2 = k2 * Math.sin(B2 * D2R);
      out.push('Law of sines: side c is between angles A and B.');
      out.push('C = 180\u00B0 \u2212 A \u2212 B = ' + f(C2) + '\u00B0');
      out.push('k = c / sin C = ' + f(k2));
      out.push('a = k \u00D7 sin A = ' + f(a2) + '      b = k \u00D7 sin B = ' + f(b2));
      out.push('\nSolution:\n' + tri(a2, b2, c2, A2, B2, C2));
    } else {
      var a3 = v1, b3 = v2, A3 = v3;
      if (a3 <= 0 || b3 <= 0 || A3 <= 0 || A3 >= 180) { err('Sides must be > 0 and 0 < A < 180\u00B0.'); return; }
      var h = b3 * Math.sin(A3 * D2R);
      out.push('Ambiguous case: height h = b \u00D7 sin A = ' + f(h) + '; side a = ' + f(a3));
      if (a3 < h - 1e-9) {
        out.push('\na < h \u2192 NO solution. Side a cannot reach the base.');
      } else if (Math.abs(a3 - h) < 1e-9) {
        out.push('\na = h \u2192 exactly ONE right-triangle solution: B = 90\u00B0.');
        var C3 = 90 - A3, c3 = a3 / Math.sin(A3 * D2R) * Math.sin(C3 * D2R);
        out.push('\nSolution:\n' + tri(a3, b3, c3, A3, 90, C3));
      } else {
        var sinB = b3 * Math.sin(A3 * D2R) / a3;
        if (sinB > 1) { out.push('\nsin B > 1 \u2192 NO solution.'); }
        else {
          var B3a = Math.asin(Math.min(1, sinB)) * R2D;
          var B3b = 180 - B3a;
          out.push('\nsin B = b \u00D7 sin A / a = ' + f(sinB) + ' \u2192 B \u2248 ' + f(B3a) + '\u00B0 or ' + f(B3b) + '\u00B0');
          var sols = 0;
          [[B3a, 'acute'], [B3b, 'obtuse']].forEach(function (pair) {
            var Bb = pair[0];
            if (A3 + Bb < 180 - 1e-9) {
              sols++;
              var Cc = 180 - A3 - Bb;
              var cc = a3 / Math.sin(A3 * D2R) * Math.sin(Cc * D2R);
              out.push('\nSolution ' + sols + ' (' + pair[1] + ' B):\n' + tri(a3, b3, cc, A3, Bb, Cc));
            }
          });
          if (!sols) out.push('\nBoth candidates make A+B \u2265 180\u00B0 \u2192 NO valid solution.');
          else out.push('\n' + sols + ' valid solution' + (sols > 1 ? 's' : '') + ' found.');
        }
      }
    }
    $(SLUG + '-out').textContent = out.join('\n');
  }
  function syncLabels() {
    var cs = $(SLUG + '-case').value;
    var L = [$(SLUG + '-l1'), $(SLUG + '-l2'), $(SLUG + '-l3')];
    if (cs === 'AAS') { L[0].textContent = 'A (deg)'; L[1].textContent = 'B (deg)'; L[2].textContent = 'a (side)'; }
    else if (cs === 'ASA') { L[0].textContent = 'A (deg)'; L[1].textContent = 'B (deg)'; L[2].textContent = 'c (side)'; }
    else { L[0].textContent = 'a (side)'; L[1].textContent = 'b (side)'; L[2].textContent = 'A (deg)'; }
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-case', 'change', function () { syncLabels(); calc(); });
    ['v1', 'v2', 'v3'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    syncLabels(); calc();
  } catch (e) {}
})();