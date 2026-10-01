/* Random Number Generator — range, count, unique, sort, copy. */
(function () {
  'use strict';
  var SLUG = 'random-number-generator';
  var ERR = SLUG + '-error';
  var last = [];

  function $(id) { return document.getElementById(id); }

  function generate() {
    var min = Math.floor(parseFloat($('random-number-generator-min').value));
    var max = Math.floor(parseFloat($('random-number-generator-max').value));
    var count = parseInt($('random-number-generator-count').value, 10);
    if (isNaN(min) || isNaN(max)) { TN.setErr(ERR, 'Enter a valid minimum and maximum.'); return; }
    if (min > max) { TN.setErr(ERR, 'Minimum must be less than or equal to maximum.'); return; }
    if (!(count >= 1 && count <= 1000)) { TN.setErr(ERR, 'Count must be between 1 and 1000.'); return; }
    var unique = $('random-number-generator-unique').checked;
    var range = max - min + 1;
    if (unique && count > range) { TN.setErr(ERR, 'Cannot draw ' + count + ' unique numbers from a range of ' + range + '.'); return; }
    TN.clearErr(ERR);
    var out = [];
    if (unique) {
      var pool = [];
      for (var v = min; v <= max; v++) pool.push(v);
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      out = pool.slice(0, count);
    } else {
      for (var k = 0; k < count; k++) out.push(min + Math.floor(Math.random() * range));
    }
    if ($('random-number-generator-sort').checked) out.sort(function (a, b) { return a - b; });
    last = out;
    var wrap = $('random-number-generator-out');
    wrap.innerHTML = '';
    out.forEach(function (n) {
      var s = document.createElement('span');
      s.textContent = n.toLocaleString('en-US');
      s.style.cssText = 'background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:6px 12px;font-weight:700;font-size:16px';
      wrap.appendChild(s);
    });
    $('random-number-generator-result').hidden = false;
    $('random-number-generator-copy').disabled = false;
  }

  try {
    TN.on('random-number-generator-go', 'click', generate);
    ['random-number-generator-min', 'random-number-generator-max', 'random-number-generator-count'].forEach(function (id) {
      TN.on(id, 'keydown', function (e) { if (e.key === 'Enter') generate(); });
    });
    TN.on('random-number-generator-copy', 'click', function () {
      if (!last.length) return;
      var t = last.join(', ');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { TN.clearErr(ERR); }, function () { TN.setErr(ERR, 'Copy failed.'); });
      } else { TN.setErr(ERR, 'Clipboard not available.'); }
    });
  } catch (e) { /* never throw on load */ }
})();
