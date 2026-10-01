/* Color Name to Hex — all 148 CSS color keywords, searchable, click-to-copy,
   plus hex → name reverse (exact or nearest RGB, honestly labeled). */
(function () {
  'use strict';
  var SLUG = 'color-name-to-hex';
  var COLORS = {
    aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4',
    azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000',
    blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A',
    burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E',
    coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C',
    cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B',
    darkgray: '#A9A9A9', darkgreen: '#006400', darkgrey: '#A9A9A9', darkkhaki: '#BDB76B',
    darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC',
    darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8F', darkslateblue: '#483D8B',
    darkslategray: '#2F4F4F', darkslategrey: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3',
    deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dimgrey: '#696969',
    dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22',
    fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700',
    goldenrod: '#DAA520', gray: '#808080', green: '#008000', greenyellow: '#ADFF2F',
    grey: '#808080', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C',
    indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA',
    lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6',
    lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgray: '#D3D3D3',
    lightgreen: '#90EE90', lightgrey: '#D3D3D3', lightpink: '#FFB6C1', lightsalmon: '#FFA07A',
    lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightslategrey: '#778899',
    lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32',
    linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA',
    mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370DB', mediumseagreen: '#3CB371',
    mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC',
    mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1',
    moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6',
    olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500',
    orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE',
    palevioletred: '#DB7093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F',
    pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080',
    rebeccapurple: '#663399', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1',
    saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57',
    seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB',
    slateblue: '#6A5ACD', slategray: '#708090', slategrey: '#708090', snow: '#FFFAFA',
    springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080',
    thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE',
    wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00',
    yellowgreen: '#9ACD32'
  };
  var NAMES = Object.keys(COLORS).sort();

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function render(filter) {
    var host = el(SLUG + '-list');
    host.innerHTML = '';
    var q = (filter || '').toLowerCase().trim();
    var shown = 0;
    NAMES.forEach(function (name) {
      var hex = COLORS[name];
      if (q && name.indexOf(q) < 0 && hex.toLowerCase().indexOf(q) < 0) return;
      shown++;
      var row = document.createElement('div');
      row.className = 'copy-row';
      row.style.cssText = 'margin-bottom:6px;cursor:pointer;align-items:center';
      row.title = 'Click to copy ' + hex;
      var sw = document.createElement('span');
      sw.style.cssText = 'width:32px;height:32px;border-radius:6px;border:1px solid #ccc;background:' + hex + ';flex:none';
      var nm = document.createElement('span');
      nm.style.flex = '1';
      nm.textContent = name;
      var hx = document.createElement('code');
      hx.className = 'code';
      hx.textContent = hex;
      row.appendChild(sw); row.appendChild(nm); row.appendChild(hx);
      row.addEventListener('click', function () {
        TN.copy(hex).then(function (ok) {
          if (!ok) fail('Copy failed — select the text manually.');
        });
      });
      host.appendChild(row);
    });
    el(SLUG + '-none').classList.toggle('hidden', shown > 0);
  }

  function find() {
    clear();
    var v = el(SLUG + '-reverse').value.trim();
    var verdict = el(SLUG + '-verdict');
    verdict.textContent = '';
    var m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(v);
    if (!m) { fail('Enter a hex like #ff6347 or ff6347.'); return; }
    var norm = '#' + m[1].toUpperCase();
    if (norm.length === 4) norm = '#' + norm[1] + norm[1] + norm[2] + norm[2] + norm[3] + norm[3];
    var exact = null;
    NAMES.forEach(function (name) { if (COLORS[name] === norm) exact = name; });
    if (exact) {
      verdict.innerHTML = 'Exact match: <strong>' + exact + '</strong> ' + norm;
      verdict.style.color = '#2e7d32';
      return;
    }
    var rgb = hexToRgb(norm), best = null, bestD = Infinity;
    NAMES.forEach(function (name) {
      var c = hexToRgb(COLORS[name]);
      var d = Math.pow(c[0] - rgb[0], 2) + Math.pow(c[1] - rgb[1], 2) + Math.pow(c[2] - rgb[2], 2);
      if (d < bestD) { bestD = d; best = name; }
    });
    verdict.innerHTML = 'No exact name — nearest CSS color (approximate): <strong>' + best + '</strong> ' + COLORS[best];
    verdict.style.color = '#ef6c00';
  }

  try {
    TN.on(SLUG + '-search', 'input', TN.debounce(function () {
      render(el(SLUG + '-search').value);
    }, 150));
    TN.on(SLUG + '-find', 'click', find);
    render('');
  } catch (e) { /* never throw on load */ }
})();
