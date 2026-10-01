(function () {
  'use strict';
  var P = 'modular-scale-calculator-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var base = parseFloat(TN.el(P + 'base').value);
      var ratio = parseFloat(TN.el(P + 'ratio').value);
      if (!(base > 0)) { TN.setErr(ERR, 'Enter a base size greater than 0.'); return; }
      if (!(ratio > 1)) { TN.setErr(ERR, 'Ratio must be greater than 1.'); return; }
      var html = '';
      for (var n = 6; n >= -3; n--) {
        var size = base * Math.pow(ratio, n);
        var label = n === 0 ? 'base' : (n > 0 ? '+' + n : String(n));
        html += '<tr><td>' + label + '</td><td><code>' + size.toFixed(2) + 'px</code></td>' +
          '<td><span style="font-size:' + Math.min(size, 72) + 'px;line-height:1.2;">Ag</span></td>' +
          '<td><button type="button" class="btn btn-outline btn-sm" data-size="' + size.toFixed(2) + '">Copy</button></td></tr>';
      }
      var body = TN.el(P + 'body');
      body.innerHTML = html;
      var btns = body.querySelectorAll('button[data-size]');
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          TN.on(b, 'click', function () {
            TN.copy(b.getAttribute('data-size') + 'px').then(function () {
              b.textContent = 'Copied';
              setTimeout(function () { b.textContent = 'Copy'; }, 1000);
            });
          });
        })(btns[i]);
      }
    } catch (e) { TN.setErr(ERR, 'Could not build the scale. Please try again.'); }
  }
  try {
    TN.on(P + 'base', 'input', update);
    TN.on(P + 'ratio', 'change', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
