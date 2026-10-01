/* Avatar Generator — procedural seeded SVG avatars, downloadable as SVG/PNG. */
(function () {
  'use strict';
  var SLUG = 'avatar-generator';

  var SKIN = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffcc99', '#f0c8a0', '#d9a066'];
  var BG = ['#1e3a5f', '#166534', '#7c2d12', '#4a1d6b', '#0f4c5c', '#5f1e3a', '#2d4a22', '#3b3b6b', '#6b3b1d', '#1d4b6b'];
  var HAIR = ['#2b2b2b', '#5b3a1e', '#8a5a2b', '#c9a227', '#d9541e', '#7a2d2d', '#4a4a6b', '#1e6b5f', '#8b1e4b', '#333'];
  var SHIRT = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6', '#34495e', '#d35400'];

  function xmur3(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rngFromSeed(seed) {
    var s = seed || 'avatar';
    return mulberry32(xmur3(s)());
  }

  function buildSVG(seed) {
    var rnd = rngFromSeed(seed);
    function rp(a) { return a[Math.floor(rnd() * a.length)]; }
    function rr(a, b) { return a + rnd() * (b - a); }

    var bg = rp(BG), skin = rp(SKIN), hair = rp(HAIR), shirt = rp(SHIRT);
    var faceW = rr(64, 76), faceH = rr(70, 82);
    var hairStyle = Math.floor(rnd() * 4); /* 0 short, 1 long, 2 mohawk, 3 bald */
    var eyeStyle = Math.floor(rnd() * 3);  /* 0 dots, 1 happy arcs, 2 sleepy */
    var mouth = Math.floor(rnd() * 3);     /* 0 smile, 1 grin, 2 flat */
    var glasses = rnd() < 0.3, blush = rnd() < 0.5, beard = rnd() < 0.25;

    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">';
    s += '<rect width="200" height="200" fill="' + bg + '"/>';
    /* body */
    s += '<rect x="55" y="150" width="90" height="60" rx="18" fill="' + shirt + '"/>';
    s += '<rect x="88" y="140" width="24" height="22" fill="' + skin + '"/>';
    /* face */
    s += '<ellipse cx="100" cy="105" rx="' + faceW / 2 + '" ry="' + faceH / 2 + '" fill="' + skin + '"/>';
    /* hair */
    if (hairStyle === 0) s += '<path d="M' + (100 - faceW / 2 - 4) + ' 95 Q100 ' + (105 - faceH / 2 - 26) + ' ' + (100 + faceW / 2 + 4) + ' 95 L' + (100 + faceW / 2 - 6) + ' 78 Q100 ' + (105 - faceH / 2 - 12) + ' ' + (100 - faceW / 2 + 6) + ' 78 Z" fill="' + hair + '"/>';
    else if (hairStyle === 1) s += '<path d="M' + (100 - faceW / 2 - 8) + ' 60 Q100 ' + (105 - faceH / 2 - 30) + ' ' + (100 + faceW / 2 + 8) + ' 60 L' + (100 + faceW / 2 + 8) + ' 150 Q' + (100 + faceW / 2 - 10) + ' 130 ' + (100 + faceW / 2 - 4) + ' 92 L' + (100 - faceW / 2 + 4) + ' 92 Q' + (100 - faceW / 2 + 10) + ' 130 ' + (100 - faceW / 2 - 8) + ' 150 Z" fill="' + hair + '"/>';
    else if (hairStyle === 2) s += '<rect x="92" y="' + (105 - faceH / 2 - 30) + '" width="16" height="34" rx="8" fill="' + hair + '"/>';
    /* eyes */
    var ey = 100;
    if (eyeStyle === 0) {
      s += '<circle cx="82" cy="' + ey + '" r="5" fill="#222"/><circle cx="118" cy="' + ey + '" r="5" fill="#222"/>';
      s += '<circle cx="84" cy="' + (ey - 2) + '" r="1.6" fill="#fff"/><circle cx="120" cy="' + (ey - 2) + '" r="1.6" fill="#fff"/>';
    } else if (eyeStyle === 1) {
      s += '<path d="M74 ' + ey + ' Q82 ' + (ey - 9) + ' 90 ' + ey + '" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>';
      s += '<path d="M110 ' + ey + ' Q118 ' + (ey - 9) + ' 126 ' + ey + '" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>';
    } else {
      s += '<path d="M74 ' + ey + ' Q82 ' + (ey + 6) + ' 90 ' + ey + '" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>';
      s += '<path d="M110 ' + ey + ' Q118 ' + (ey + 6) + ' 126 ' + ey + '" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>';
    }
    if (glasses) {
      s += '<circle cx="82" cy="' + ey + '" r="13" fill="none" stroke="#222" stroke-width="3.5"/>';
      s += '<circle cx="118" cy="' + ey + '" r="13" fill="none" stroke="#222" stroke-width="3.5"/>';
      s += '<path d="M95 ' + ey + ' L105 ' + ey + '" stroke="#222" stroke-width="3.5"/>';
    }
    if (blush) {
      s += '<ellipse cx="66" cy="118" rx="8" ry="5" fill="#f1948a" opacity="0.7"/>';
      s += '<ellipse cx="134" cy="118" rx="8" ry="5" fill="#f1948a" opacity="0.7"/>';
    }
    /* mouth */
    var my = 128;
    if (mouth === 0) s += '<path d="M86 ' + my + ' Q100 ' + (my + 12) + ' 114 ' + my + '" stroke="#7a2d2d" stroke-width="4" fill="none" stroke-linecap="round"/>';
    else if (mouth === 1) s += '<path d="M84 ' + my + ' Q100 ' + (my + 16) + ' 116 ' + my + ' Q100 ' + (my + 4) + ' 84 ' + my + ' Z" fill="#7a2d2d"/>';
    else s += '<path d="M88 ' + (my + 4) + ' L112 ' + (my + 4) + '" stroke="#7a2d2d" stroke-width="4" stroke-linecap="round"/>';
    if (beard) s += '<path d="M' + (100 - faceW / 2 + 6) + ' 118 Q100 ' + (105 + faceH / 2 + 14) + ' ' + (100 + faceW / 2 - 6) + ' 118 Q100 132 ' + (100 - faceW / 2 + 6) + ' 118 Z" fill="' + hair + '" opacity="0.9"/>';
    s += '</svg>';
    return s;
  }

  var currentSVG = '', currentSeed = '';

  function show() {
    var stage = TN.el(SLUG + '-stage');
    stage.innerHTML = currentSVG;
    var svg = stage.querySelector('svg');
    if (svg) { svg.style.width = '220px'; svg.style.height = '220px'; svg.style.borderRadius = '16px'; }
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    function generate(seed) {
      try {
        TN.clearErr(SLUG + '-error');
        currentSeed = seed;
        currentSVG = buildSVG(seed);
        show();
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate the avatar. Please try again.'); }
    }
    TN.on(SLUG + '-go', 'click', function () {
      var seed = TN.el(SLUG + '-seed').value.trim();
      generate(seed || ('avatar-' + Math.floor(Math.random() * 1e9)));
    });
    TN.on(SLUG + '-shuffle', 'click', function () {
      var seed = 'avatar-' + Math.floor(Math.random() * 1e9);
      TN.el(SLUG + '-seed').value = seed;
      generate(seed);
    });
    TN.on(SLUG + '-svg', 'click', function () {
      if (!currentSVG) { TN.setErr(SLUG + '-error', 'Generate an avatar first.'); return; }
      TN.downloadText(currentSVG, 'avatar-' + currentSeed.replace(/[^a-z0-9]+/gi, '-') + '.svg', 'image/svg+xml');
    });
    TN.on(SLUG + '-png', 'click', function () {
      if (!currentSVG) { TN.setErr(SLUG + '-error', 'Generate an avatar first.'); return; }
      try {
        var blob = new Blob([currentSVG], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(blob);
        var img = new Image();
        img.onload = function () {
          try {
            var cv = document.createElement('canvas');
            cv.width = 512; cv.height = 512;
            cv.getContext('2d').drawImage(img, 0, 0, 512, 512);
            URL.revokeObjectURL(url);
            cv.toBlob(function (b) {
              if (b) TN.download(b, 'avatar-' + currentSeed.replace(/[^a-z0-9]+/gi, '-') + '.png');
              else TN.setErr(SLUG + '-error', 'PNG export failed in this browser.');
            }, 'image/png');
          } catch (e) { TN.setErr(SLUG + '-error', 'PNG export failed in this browser.'); }
        };
        img.onerror = function () { TN.setErr(SLUG + '-error', 'PNG export failed in this browser.'); };
        img.src = url;
      } catch (e) { TN.setErr(SLUG + '-error', 'PNG export failed in this browser.'); }
    });
    generate('avatar-seed-1');
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
