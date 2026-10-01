(function () {
  'use strict';
  var ERR = 'shades-tints-generator-error';
  var current = [];

  function parseHex(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function toHex(r, g, b) {
    function h(v) { return ('0' + Math.round(v).toString(16)).slice(-2); }
    return ('#' + h(r) + h(g) + h(b)).toUpperCase();
  }

  function mix(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    ];
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var el = TN.el('shades-tints-generator-base');
      var base = parseHex(el ? el.value : '#000000');
      var white = [255, 255, 255], black = [0, 0, 0];
      var scale = [];
      for (var i = 9; i >= 1; i--) scale.push({ hex: toHex.apply(null, mix(base, white, i / 10)), kind: 'tint ' + (i * 10) + '%' });
      scale.push({ hex: toHex.apply(null, base), kind: 'base' });
      for (var j = 1; j <= 9; j++) scale.push({ hex: toHex.apply(null, mix(base, black, j / 10)), kind: 'shade ' + (j * 10) + '%' });
      current = scale.map(function (s) { return s.hex; });

      var grid = TN.el('shades-tints-generator-grid');
      grid.innerHTML = '';
      scale.forEach(function (s) {
        var sw = document.createElement('button');
        sw.type = 'button';
        sw.style.background = s.hex;
        sw.style.border = '1px solid rgba(0,0,0,0.2)';
        sw.style.borderRadius = '10px';
        sw.style.height = '84px';
        sw.style.cursor = 'pointer';
        sw.style.display = 'flex';
        sw.style.flexDirection = 'column';
        sw.style.justifyContent = 'flex-end';
        sw.style.padding = '6px';
        sw.style.color = '#fff';
        sw.style.textShadow = '0 1px 3px rgba(0,0,0,0.7)';
        sw.style.fontSize = '11px';
        sw.style.fontWeight = 'bold';
        sw.title = 'Copy ' + s.hex;
        var hx = document.createElement('span');
        hx.textContent = s.hex;
        var kd = document.createElement('span');
        kd.textContent = s.kind;
        kd.style.fontWeight = 'normal';
        kd.style.fontSize = '10px';
        sw.appendChild(hx); sw.appendChild(kd);
        sw.addEventListener('click', function () {
          TN.copy(s.hex).then(function (ok) {
            hx.textContent = ok ? 'Copied!' : s.hex;
            setTimeout(function () { hx.textContent = s.hex; }, 1000);
          });
        });
        grid.appendChild(sw);
      });
    } catch (err) {
      TN.setErr(ERR, 'Could not build the scale.');
    }
  }

  try {
    TN.on('shades-tints-generator-base', 'input', render);
    TN.on('shades-tints-generator-copy', 'click', function () {
      TN.copy(current.join('\n')).then(function (ok) {
        var b = TN.el('shades-tints-generator-copy');
        if (b) {
          b.textContent = ok ? 'Copied!' : 'Copy failed';
          setTimeout(function () { b.textContent = 'Copy all HEX'; }, 1200);
        }
      });
    });
    render();
  } catch (e) { /* never throw on load */ }
})();
