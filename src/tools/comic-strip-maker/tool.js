/* Comic Strip Maker — 3-4 panels with uploaded images + caption boxes. */
(function () {
  'use strict';
  var SLUG = 'comic-strip-maker';
  var ERR = SLUG + '-error';
  var PW = 1600, PH = 520, GUT = 16;
  var imgs = [null, null, null, null];
  var DEFAULT_CAPS = ['MEANWHILE…', 'SUDDENLY!', 'BUT THEN…', 'TO BE CONTINUED…'];

  function panelCount() {
    var el = document.getElementById(SLUG + '-count');
    return el ? parseInt(el.value, 10) : 4;
  }

  function buildInputs() {
    var wrap = document.getElementById(SLUG + '-panels');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (var i = 0; i < 4; i++) {
      (function (i) {
        var d = document.createElement('div');
        d.className = 'field';
        d.id = SLUG + '-pwrap' + i;
        d.innerHTML =
          '<label>Panel ' + (i + 1) + ' photo</label>' +
          '<input type="file" accept="image/*" class="input" id="' + SLUG + '-file' + i + '">' +
          '<label style="margin-top:8px">Panel ' + (i + 1) + ' caption</label>' +
          '<input type="text" class="input" id="' + SLUG + '-cap' + i + '" maxlength="60" value="' + DEFAULT_CAPS[i] + '">';
        wrap.appendChild(d);
        TN.on(SLUG + '-file' + i, 'change', function () {
          var f = this.files && this.files[0];
          if (!f) return;
          TN.clearErr(ERR);
          TN.readAsDataURL(f).then(TN.loadImage).then(function (im) { imgs[i] = im; draw(); })
            .catch(function () { TN.setErr(ERR, 'Panel ' + (i + 1) + ': that file could not be read as an image.'); });
        });
        TN.on(SLUG + '-cap' + i, 'input', TN.debounce(draw, 120));
      })(i);
    }
    syncVisibility();
  }

  function syncVisibility() {
    var n = panelCount();
    for (var i = 0; i < 4; i++) {
      var w = document.getElementById(SLUG + '-pwrap' + i);
      if (w) w.style.display = i < n ? '' : 'none';
    }
  }

  function wrapText(ctx, text, maxW) {
    var words = text.split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW) { if (line) lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    var n = panelCount();
    canvas.width = PW; canvas.height = PH;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, PW, PH);
    var pw = (PW - GUT * (n + 1)) / n;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var x = GUT + i * (pw + GUT), y = GUT, ph = PH - GUT * 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, pw, ph);
        ctx.clip();
        if (imgs[i]) {
          var im = imgs[i];
          var s = Math.max(pw / im.naturalWidth, ph / im.naturalHeight);
          var dw = im.naturalWidth * s, dh = im.naturalHeight * s;
          ctx.drawImage(im, x + (pw - dw) / 2, y + (ph - dh) / 2, dw, dh);
        } else {
          var g = ctx.createLinearGradient(0, y, 0, y + ph);
          g.addColorStop(0, '#3a3a42'); g.addColorStop(1, '#232328');
          ctx.fillStyle = g;
          ctx.fillRect(x, y, pw, ph);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font = '28px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Panel ' + (i + 1), x + pw / 2, y + ph / 2);
        }
        // caption box
        var capEl = document.getElementById(SLUG + '-cap' + i);
        var cap = capEl ? capEl.value.trim() : '';
        if (cap) {
          ctx.font = 'bold 30px "Comic Sans MS", "Segoe Print", "Chalkboard SE", cursive';
          var lines = wrapText(ctx, cap, pw - 48);
          var boxH = lines.length * 40 + 28;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 14, y + 14, pw - 28, boxH);
          ctx.strokeStyle = '#111';
          ctx.lineWidth = 4;
          ctx.strokeRect(x + 14, y + 14, pw - 28, boxH);
          ctx.fillStyle = '#111';
          ctx.textAlign = 'center';
          lines.forEach(function (ln, li) {
            ctx.fillText(ln, x + pw / 2, y + 14 + 36 + li * 40);
          });
        }
        ctx.restore();
      })(i);
    }
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    buildInputs();
    draw();
    TN.on(SLUG + '-count', 'change', function () { syncVisibility(); draw(); });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      draw();
      var canvas = document.getElementById(SLUG + '-canvas');
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'comic-strip.png');
          else TN.setErr(ERR, 'Could not export the strip.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the strip.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
