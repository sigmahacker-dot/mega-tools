/* Ukulele Chord Chart Generator — 34 real GCEA shapes, canvas diagrams, PNG download. */
(function () {
  'use strict';
  var SLUG = 'ukulele-chord-chart-generator';
  var ERR = SLUG + '-error';
  // frets: G C E A, -1 = muted, 0 = open; fingers: 0 = none; barres: {fret, from, to}
  var CHORDS = [
    { n: 'C', f: [0, 0, 0, 3], g: [0, 0, 0, 3] },
    { n: 'C7', f: [0, 0, 0, 1], g: [0, 0, 0, 1] },
    { n: 'Cmaj7', f: [0, 0, 0, 2], g: [0, 0, 0, 2] },
    { n: 'Csus4', f: [0, 0, 1, 3], g: [0, 0, 1, 2] },
    { n: 'Am', f: [2, 0, 0, 0], g: [2, 0, 0, 0] },
    { n: 'Am7', f: [0, 0, 0, 0], g: [0, 0, 0, 0] },
    { n: 'Amaj7', f: [1, 1, 0, 0], g: [1, 1, 0, 0] },
    { n: 'A', f: [2, 1, 0, 0], g: [2, 1, 0, 0] },
    { n: 'A7', f: [0, 1, 0, 0], g: [0, 1, 0, 0] },
    { n: 'Asus4', f: [2, 2, 0, 0], g: [1, 2, 0, 0] },
    { n: 'F', f: [2, 0, 1, 0], g: [2, 0, 1, 0] },
    { n: 'F7', f: [2, 3, 1, 0], g: [2, 3, 1, 0] },
    { n: 'G', f: [0, 2, 3, 2], g: [0, 1, 3, 2] },
    { n: 'G7', f: [0, 2, 1, 2], g: [0, 2, 1, 3] },
    { n: 'Gmaj7', f: [0, 2, 2, 2], g: [0, 1, 2, 3] },
    { n: 'D', f: [2, 2, 2, 0], g: [1, 2, 3, 0] },
    { n: 'D7', f: [2, 2, 2, 3], g: [1, 2, 3, 4] },
    { n: 'Dm', f: [2, 2, 1, 0], g: [2, 3, 1, 0] },
    { n: 'Dm7', f: [2, 2, 1, 3], g: [2, 3, 1, 4] },
    { n: 'Dmaj7', f: [2, 2, 2, 4], g: [1, 2, 3, 4] },
    { n: 'Dsus4', f: [0, 2, 3, 0], g: [0, 1, 2, 0] },
    { n: 'Em', f: [0, 4, 3, 2], g: [0, 3, 2, 1] },
    { n: 'Em7', f: [0, 2, 0, 2], g: [0, 1, 0, 2] },
    { n: 'E', f: [4, 4, 4, 2], g: [1, 1, 1, 1], b: [{ fret: 4, from: 0, to: 2 }] },
    { n: 'E7', f: [1, 2, 0, 2], g: [1, 2, 0, 3] },
    { n: 'Esus4', f: [4, 4, 0, 0], g: [1, 2, 0, 0] },
    { n: 'Bb', f: [3, 2, 1, 1], g: [3, 2, 1, 1] },
    { n: 'Bbm', f: [3, 1, 1, 1], g: [2, 1, 1, 1], b: [{ fret: 1, from: 1, to: 3 }] },
    { n: 'Eb', f: [0, 3, 3, 1], g: [0, 3, 4, 1], b: [{ fret: 3, from: 1, to: 2 }] },
    { n: 'Ab', f: [5, 3, 4, 3], g: [1, 1, 1, 1], b: [{ fret: 3, from: 1, to: 3 }] },
    { n: 'Cm', f: [0, 3, 3, 3], g: [0, 1, 1, 1], b: [{ fret: 3, from: 1, to: 3 }] },
    { n: 'Gm', f: [0, 2, 3, 1], g: [0, 2, 3, 1] },
    { n: 'Bm', f: [4, 2, 2, 2], g: [1, 1, 1, 1], b: [{ fret: 2, from: 1, to: 3 }] },
    { n: 'F#m', f: [2, 1, 2, 0], g: [2, 1, 3, 0] }
  ];

  function drawChord(ch) {
    var cv = document.getElementById(SLUG + '-canvas');
    var scale = 2, W = 300, H = 420;
    cv.width = W * scale; cv.height = H * scale;
    var ctx = cv.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);

    var strings = 4;
    var marginX = 52, gridW = W - marginX * 2;
    var sx = function (s) { return marginX + (gridW / (strings - 1)) * s; };
    var nutY = 78, fretH = 56, fretsShown = 5;

    var pressed = ch.f.filter(function (f) { return f > 0; });
    var base = pressed.length ? Math.min.apply(null, pressed) : 1;

    ctx.fillStyle = '#111827';
    ctx.font = '700 30px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ch.n, W / 2, 44);

    if (base > 1) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '600 15px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(base + 'fr', 10, nutY + fretH / 2 + 5);
    }

    ctx.font = '700 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (var s = 0; s < strings; s++) {
      var f = ch.f[s];
      ctx.fillStyle = '#6b7280';
      if (f === -1) ctx.fillText('✕', sx(s), nutY - 12);
      else if (f === 0) { ctx.fillStyle = '#111827'; ctx.fillText('○', sx(s), nutY - 12); }
    }

    ctx.strokeStyle = '#374151';
    for (var fr = 0; fr <= fretsShown; fr++) {
      ctx.lineWidth = (fr === 0 && base === 1) ? 6 : 2;
      ctx.beginPath();
      ctx.moveTo(sx(0), nutY + fr * fretH);
      ctx.lineTo(sx(strings - 1), nutY + fr * fretH);
      ctx.stroke();
    }
    for (var st = 0; st < strings; st++) {
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sx(st), nutY);
      ctx.lineTo(sx(st), nutY + fretsShown * fretH);
      ctx.stroke();
    }

    function fretY(fret) { return nutY + (fret - base) * fretH + fretH / 2; }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    (ch.b || []).forEach(function (b) {
      var x0 = sx(b.from), x1 = sx(b.to);
      ctx.fillStyle = '#1f2937';
      roundRect(x0 - 13, fretY(b.fret) - 13, (x1 - x0) + 26, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(ch.g[b.from]), (x0 + x1) / 2, fretY(b.fret) + 5);
    });

    for (var d = 0; d < strings; d++) {
      var fd = ch.f[d], gd = ch.g[d];
      if (fd <= 0) continue;
      var barred = (ch.b || []).some(function (b) { return b.fret === fd && d >= b.from && d <= b.to; });
      if (barred) continue;
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(sx(d), fretY(fd), 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(gd), sx(d), fretY(fd) + 5);
    }

    // string names
    ctx.fillStyle = '#6b7280';
    ctx.font = '600 13px system-ui, sans-serif';
    var names = ['G', 'C', 'E', 'A'];
    for (var n2 = 0; n2 < strings; n2++) {
      ctx.fillText(names[n2], sx(n2), nutY + fretsShown * fretH + 24);
    }

    var seq = ch.f.map(function (f) { return f < 0 ? 'x' : String(f); }).join(' ');
    document.getElementById(SLUG + '-label').textContent = 'Frets (G C E A): ' + seq + ' · GCEA tuning';
  }

  try {
    if (!document.getElementById(SLUG + '-chord')) return;
    var sel = document.getElementById(SLUG + '-chord');
    CHORDS.forEach(function (c, i) {
      var o = document.createElement('option');
      o.value = String(i); o.textContent = c.n;
      sel.appendChild(o);
    });
    function show() {
      TN.clearErr(ERR);
      var ch = CHORDS[parseInt(sel.value, 10)] || CHORDS[0];
      drawChord(ch);
    }
    TN.on(SLUG + '-chord', 'change', show);
    TN.on(SLUG + '-download', 'click', function () {
      var ch = CHORDS[parseInt(sel.value, 10)] || CHORDS[0];
      var cv = document.getElementById(SLUG + '-canvas');
      if (cv.toBlob) {
        cv.toBlob(function (blob) {
          if (blob) TN.download(blob, 'ukulele-chord-' + ch.n.replace(/[#b]/g, '') + '.png');
          else TN.setErr(ERR, 'Could not export the PNG.');
        }, 'image/png');
      } else {
        TN.setErr(ERR, 'PNG export is not supported in this browser.');
      }
    });
    show();
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
