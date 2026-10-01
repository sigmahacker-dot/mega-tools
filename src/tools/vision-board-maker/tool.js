/* Vision Board Maker — canvas collage of uploaded images + affirmations, download PNG. */
(function () {
  'use strict';

  var SLUG = 'vision-board-maker';
  var images = []; // HTMLImageElement list
  var built = false;

  var THEMES = {
    dark: { bg: '#111827', fg: '#f9fafb', card: '#1f2937' },
    light: { bg: '#faf6ef', fg: '#1f2937', card: '#ffffff' },
    green: { bg: '#0b3d2e', fg: '#ecfdf5', card: '#14532d' }
  };

  function drawCover(ctx, img, x, y, w, h) {
    var s = Math.max(w / img.width, h / img.height);
    var dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function wrapText(ctx, text, maxW) {
    var words = text.split(/\s+/), lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; }
      else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }

  function build(shuffle) {
    TN.clearErr(SLUG + '-error');
    var affirm = TN.el(SLUG + '-text').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (!images.length && !affirm.length) {
      TN.setErr(SLUG + '-error', 'Upload at least one image or type an affirmation first.');
      return;
    }
    var theme = THEMES[TN.el(SLUG + '-theme').value] || THEMES.dark;
    var cv = TN.el(SLUG + '-canvas');
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height, pad = 20;
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    var items = [];
    images.forEach(function (img) { items.push({ type: 'img', img: img }); });
    affirm.forEach(function (t) { items.push({ type: 'text', text: t }); });
    if (shuffle) {
      for (var i = items.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
      }
    }
    // grid sized to item count
    var cols = Math.ceil(Math.sqrt(items.length * (W / H)));
    var rows = Math.ceil(items.length / cols);
    var cw = (W - pad * (cols + 1)) / cols;
    var ch = (H - pad * (rows + 1)) / rows;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    items.forEach(function (it, idx) {
      var r = Math.floor(idx / cols), c = idx % cols;
      var x = pad + c * (cw + pad), y = pad + r * (ch + pad);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cw, ch);
      ctx.clip();
      if (it.type === 'img') {
        drawCover(ctx, it.img, x, y, cw, ch);
      } else {
        ctx.fillStyle = theme.card;
        ctx.fillRect(x, y, cw, ch);
        ctx.fillStyle = theme.fg;
        var fs = Math.max(18, Math.min(44, cw / 10));
        ctx.font = 'bold ' + fs + 'px Georgia, serif';
        var lines = wrapText(ctx, '\u201c' + it.text + '\u201d', cw - 40);
        var lh = fs * 1.4;
        var startY = y + ch / 2 - (lines.length - 1) * lh / 2;
        lines.forEach(function (ln, li) { ctx.fillText(ln, x + cw / 2, startY + li * lh); });
      }
      ctx.restore();
    });
    built = true;
    TN.el(SLUG + '-status').textContent = 'Board ready — ' + images.length + ' image(s), ' + affirm.length + ' affirmation(s).';
  }

  function download() {
    if (!built) { TN.setErr(SLUG + '-error', 'Build the board first.'); return; }
    var cv = TN.el(SLUG + '-canvas');
    if (cv.toBlob) {
      cv.toBlob(function (blob) { if (blob) TN.download(blob, 'vision-board.png'); });
    } else {
      var a = document.createElement('a');
      a.href = cv.toDataURL('image/png');
      a.download = 'vision-board.png';
      document.body.appendChild(a); a.click(); a.remove();
    }
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-build')) return;
      TN.el(SLUG + '-files').addEventListener('change', function (e) {
        images = [];
        var files = e.target.files;
        if (!files || !files.length) return;
        var pending = files.length;
        for (var i = 0; i < files.length; i++) {
          (function (f) {
            TN.readAsDataURL(f).then(function (url) {
              var img = new Image();
              img.onload = function () { images.push(img); if (--pending === 0) build(false); };
              img.onerror = function () { if (--pending === 0) build(false); };
              img.src = url;
            }).catch(function () { if (--pending === 0) build(false); });
          })(files[i]);
        }
      });
      TN.on(SLUG + '-build', 'click', function () { build(false); });
      TN.on(SLUG + '-shuffle', 'click', function () { build(true); });
      TN.on(SLUG + '-dl', 'click', download);
    } catch (e) { /* never throw on load */ }
  }

  init();
})();