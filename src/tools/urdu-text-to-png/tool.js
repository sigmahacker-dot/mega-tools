(function () {
  'use strict';
  var S = 'urdu-text-to-png';
  var FONT_FAMILY = 'TN Noto Nastaliq Urdu';
  var SCALE = 2;            /* supersample factor for crisp PNG output */
  var MAX_CONTENT_W = 1400; /* max text width in CSS px before word-wrap kicks in */
  var MAX_H = 4000;         /* max canvas height in CSS px */

  function el(id) { return TN.el(S + '-' + id); }
  function on(id, evt, fn) { try { TN.on(S + '-' + id, evt, fn); } catch (e) {} }

  function fontSpec(size) {
    return size + 'px "' + FONT_FAMILY + '", serif';
  }

  /* Split text into wrapped lines that fit maxW. Keeps explicit newlines. */
  function wrapLines(ctx, text, maxW) {
    var lines = [];
    var paras = String(text).split('\n');
    for (var p = 0; p < paras.length; p++) {
      var words = paras[p].split(/\s+/).filter(function (w) { return w.length > 0; });
      if (words.length === 0) { lines.push(''); continue; }
      var line = '';
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        /* char-break a single word that alone exceeds the max width */
        if (ctx.measureText(word).width > maxW && word.length > 1) {
          if (line) { lines.push(line); line = ''; }
          var chunk = '';
          for (var c = 0; c < word.length; c++) {
            var test = chunk + word[c];
            if (chunk && ctx.measureText(test).width > maxW) { lines.push(chunk); chunk = word[c]; }
            else { chunk = test; }
          }
          if (chunk) lines.push(chunk);
          continue;
        }
        var trial = line ? line + ' ' + word : word;
        if (ctx.measureText(trial).width > maxW && line) { lines.push(line); line = word; }
        else { line = trial; }
      }
      if (line) lines.push(line);
    }
    return lines;
  }

  function bgColor() {
    var sel = el('bg');
    var choice = sel ? sel.value : 'transparent';
    if (choice === 'dark') return '#07070b';
    if (choice === 'white') return '#ffffff';
    if (choice === 'custom') { var c = el('bgcolor'); return c ? c.value : '#07070b'; }
    return null; /* transparent */
  }

  function render() {
    try {
      TN.clearErr(S + '-error');
      var canvas = el('canvas');
      var previewRow = el('preview-row');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      var text = (el('text') && el('text').value || '').replace(/[ \t]+$/gm, '');
      if (!text) {
        /* empty: tiny cleared canvas, hide the preview */
        canvas.width = 2; canvas.height = 2;
        ctx.clearRect(0, 0, 2, 2);
        if (previewRow) TN.hide(previewRow);
        return;
      }
      var size = parseInt(el('size') && el('size').value, 10) || 64;
      var pad = parseInt(el('padding') && el('padding').value, 10) || 48;
      var color = (el('color') && el('color').value) || '#ffffff';

      ctx.font = fontSpec(size);
      var lines = wrapLines(ctx, text, MAX_CONTENT_W);
      var lineH = size * 2.0; /* Nastaliq needs a tall line box (tall ascenders/descenders) */

      var maxW = 0;
      for (var i = 0; i < lines.length; i++) {
        var w = ctx.measureText(lines[i]).width;
        if (w > maxW) maxW = w;
      }
      var cssW = Math.ceil(maxW + pad * 2);
      var cssH = Math.ceil(lines.length * lineH + pad * 2);
      if (cssH > MAX_H) cssH = MAX_H;
      if (cssW < 2) cssW = 2; if (cssH < 2) cssH = 2;

      canvas.width = Math.round(cssW * SCALE);
      canvas.height = Math.round(cssH * SCALE);
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

      var bg = bgColor();
      if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, cssW, cssH); }
      else { ctx.clearRect(0, 0, cssW, cssH); }

      ctx.font = fontSpec(size); /* font must be re-set after canvas resize */
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      var cx = cssW / 2;
      for (var j = 0; j < lines.length; j++) {
        var y = pad + lineH * (j + 0.5);
        if (y > cssH - 1) break;
        if (lines[j]) ctx.fillText(lines[j], cx, y);
      }
      if (previewRow) TN.show(previewRow);
    } catch (e) { /* keep the page alive; download path reports errors */ }
  }

  function ensureFontThenRender() {
    var done = false;
    function finish() { if (!done) { done = true; render(); } }
    try {
      if (document.fonts && document.fonts.load) {
        document.fonts.load('64px "' + FONT_FAMILY + '"').then(function () {
          if (document.fonts.ready) return document.fonts.ready;
          return null;
        }).then(finish, finish);
        /* safety net: render even if the font promise never settles */
        setTimeout(finish, 3000);
      } else { finish(); }
    } catch (e) { finish(); }
  }

  function syncLabels() {
    var sv = el('size-val'), s = el('size');
    if (sv && s) sv.textContent = s.value + 'px';
    var pv = el('padding-val'), p = el('padding');
    if (pv && p) pv.textContent = p.value + 'px';
  }

  function syncBg() {
    var sel = el('bg'), wrap = el('bgcolor-wrap');
    if (sel && wrap) {
      if (sel.value === 'custom') TN.show(wrap); else TN.hide(wrap);
    }
  }

  function downloadPNG() {
    try {
      TN.clearErr(S + '-error');
      var text = (el('text') && el('text').value || '').trim();
      if (!text) { TN.setErr(S + '-error', 'Please type some Urdu text first.'); return; }
      var canvas = el('canvas');
      if (!canvas || canvas.width < 4) { TN.setErr(S + '-error', 'Nothing to download yet — the preview is empty.'); return; }
      if (!canvas.toBlob) { TN.setErr(S + '-error', 'Your browser does not support PNG export.'); return; }
      ensureFontThenRender();
      canvas.toBlob(function (blob) {
        if (blob) { TN.download(blob, 'urdu-text.png'); }
        else { TN.setErr(S + '-error', 'Could not create the PNG. Please try again.'); }
      }, 'image/png');
    } catch (e) { TN.setErr(S + '-error', 'Could not create the PNG. Please try again.'); }
  }

  var debouncedRender = TN.debounce(function () { ensureFontThenRender(); }, 250);
  on('text', 'input', debouncedRender);
  on('size', 'input', function () { syncLabels(); debouncedRender(); });
  on('padding', 'input', function () { syncLabels(); debouncedRender(); });
  on('color', 'input', debouncedRender);
  on('bgcolor', 'input', debouncedRender);
  on('bg', 'change', function () { syncBg(); debouncedRender(); });
  on('download', 'click', downloadPNG);

  syncLabels();
  syncBg();
  /* re-render when the webfont swaps in (font-display: swap) */
  try {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { render(); }, function () {});
    }
  } catch (e) {}
  render();
})();
