/* Identicon Generator — 5×5 symmetric identicon hashed (FNV-1a) from text, PNG export. */
(function () {
  'use strict';
  var SLUG = 'identicon-generator';
  var N = 5, CELL = 50;

  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function draw(text) {
    var cv = TN.el(SLUG + '-canvas');
    var ctx = cv.getContext('2d');
    var h1 = fnv1a(text || 'identicon');
    var h2 = fnv1a('salt:' + (text || 'identicon'));
    var hue = h1 % 360;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = 'hsl(' + hue + ',70%,55%)';
    var bits = h2;
    var used = 0;
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < 3; x++) {
        if (used >= 31) bits = fnv1a(bits + ':' + y + ':' + x);
        var on = ((bits >>> used) & 1) === 1;
        used++;
        if (on) {
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
          ctx.fillRect((N - 1 - x) * CELL, y * CELL, CELL, CELL);
        }
      }
    }
    return 'hsl(' + hue + ',70%,55%)';
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var t = TN.el(SLUG + '-text').value.trim();
        if (!t) { TN.setErr(SLUG + '-error', 'Type some text to hash first.'); return; }
        draw(t);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate the identicon. Please try again.'); }
    });
    TN.on(SLUG + '-random', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var t = 'user-' + Math.floor(Math.random() * 1e9);
        TN.el(SLUG + '-text').value = t;
        draw(t);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate the identicon. Please try again.'); }
    });
    TN.on(SLUG + '-png', 'click', function () {
      try {
        var cv = TN.el(SLUG + '-canvas');
        cv.toBlob(function (b) {
          if (b) TN.download(b, 'identicon.png');
          else TN.setErr(SLUG + '-error', 'PNG export failed in this browser.');
        }, 'image/png');
      } catch (e) { TN.setErr(SLUG + '-error', 'PNG export failed in this browser.'); }
    });
    try { draw('identicon'); } catch (e) { /* canvas unavailable */ }
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
