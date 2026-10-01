/* Storyboard Maker — 6-frame film storyboard grid with shot types and notes. */
(function () {
  'use strict';
  var SLUG = 'storyboard-maker';
  var ERR = SLUG + '-error';
  var W = 1600;
  var SHOTS = ['Wide', 'Medium', 'Close-up', 'Extreme close-up', 'Aerial', 'POV'];
  var imgs = [null, null, null, null, null, null];

  function buildFrames() {
    var wrap = document.getElementById(SLUG + '-frames');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      (function (i) {
        var d = document.createElement('div');
        d.className = 'field';
        d.style.cssText = 'border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin-bottom:12px;';
        var opts = SHOTS.map(function (s) { return '<option>' + s + '</option>'; }).join('');
        d.innerHTML =
          '<strong>Frame ' + (i + 1) + '</strong>' +
          '<div class="grid2" style="margin-top:8px">' +
          '<div class="field"><label>Shot image (optional)</label>' +
          '<input type="file" accept="image/*" class="input" id="' + SLUG + '-file' + i + '"></div>' +
          '<div class="field"><label>Shot type</label>' +
          '<select class="select" id="' + SLUG + '-shot' + i + '">' + opts + '</select></div>' +
          '</div>' +
          '<div class="field"><label>Director\u2019s notes</label>' +
          '<textarea class="textarea" id="' + SLUG + '-note' + i + '" rows="2" maxlength="220" placeholder="Camera move, dialogue, action…"></textarea></div>';
        wrap.appendChild(d);
        TN.on(SLUG + '-file' + i, 'change', function () {
          var f = this.files && this.files[0];
          if (!f) return;
          TN.clearErr(ERR);
          TN.readAsDataURL(f).then(TN.loadImage).then(function (im) { imgs[i] = im; draw(); })
            .catch(function () { TN.setErr(ERR, 'Frame ' + (i + 1) + ': that file could not be read as an image.'); });
        });
        TN.on(SLUG + '-shot' + i, 'change', draw);
        TN.on(SLUG + '-note' + i, 'input', TN.debounce(draw, 150));
      })(i);
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
    return lines.slice(0, 4);
  }

  function draw() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    var cols = 2, rows = 3;
    var fw = 740, fh = 560; // frame cell
    var gx = 40, gy = 130;
    canvas.width = W;
    canvas.height = gy + rows * fh + 80;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var titleEl = document.getElementById(SLUG + '-title');
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText((titleEl && titleEl.value.trim()) || 'Storyboard', W / 2, 80);

    for (var i = 0; i < 6; i++) {
      (function (i) {
        var c = i % cols, r = Math.floor(i / cols);
        var x = gx + c * (fw + 40), y = gy + r * fh;
        // image 16:9
        var iw = fw, ih = Math.round(fw * 9 / 16);
        ctx.save();
        ctx.beginPath(); ctx.rect(x, y, iw, ih); ctx.clip();
        if (imgs[i]) {
          var im = imgs[i];
          var s = Math.max(iw / im.naturalWidth, ih / im.naturalHeight);
          var dw = im.naturalWidth * s, dh = im.naturalHeight * s;
          ctx.drawImage(im, x + (iw - dw) / 2, y + (ih - dh) / 2, dw, dh);
        } else {
          ctx.fillStyle = '#d9d4c7';
          ctx.fillRect(x, y, iw, ih);
          ctx.strokeStyle = '#b9b2a1';
          ctx.lineWidth = 3;
          ctx.setLineDash([14, 10]);
          ctx.strokeRect(x + 6, y + 6, iw - 12, ih - 12);
          ctx.setLineDash([]);
          ctx.fillStyle = '#8a8474';
          ctx.font = 'bold 40px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SCENE ' + (i + 1), x + iw / 2, y + ih / 2 + 14);
        }
        ctx.restore();
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, iw, ih);
        // frame number badge
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(x + 34, y + 34, 26, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(i + 1), x + 34, y + 43);
        // shot type + notes
        var shotEl = document.getElementById(SLUG + '-shot' + i);
        var noteEl = document.getElementById(SLUG + '-note' + i);
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 30px Arial, sans-serif';
        ctx.textAlign = 'left';
        var ny = y + ih + 44;
        ctx.fillText((shotEl ? shotEl.value : '').toUpperCase(), x + 4, ny);
        var note = noteEl ? noteEl.value.trim() : '';
        ctx.fillStyle = '#4a463c';
        ctx.font = '24px Arial, sans-serif';
        wrapText(ctx, note, iw - 12).forEach(function (ln, li) {
          ctx.fillText(ln, x + 4, ny + 36 + li * 32);
        });
      })(i);
    }
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    buildFrames();
    draw();
    TN.on(SLUG + '-title', 'input', TN.debounce(draw, 150));
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      draw();
      var canvas = document.getElementById(SLUG + '-canvas');
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'storyboard.png');
          else TN.setErr(ERR, 'Could not export the storyboard.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the storyboard.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
