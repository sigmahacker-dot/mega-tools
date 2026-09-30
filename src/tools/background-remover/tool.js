/* Background Remover — ES module.
   Uses @imgly/background-removal via dynamic import so a CDN failure
   shows a friendly error instead of a dead tool. */
'use strict';

var CDN_URL = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm';

function $(id) { return document.getElementById(id); }

function setStatus(msg) {
  var s = $('background-remover-status');
  if (s) s.textContent = msg;
}

function setProgress(pct) {
  var bar = $('background-remover-bar');
  if (bar) bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
}

var file = null;
var resultBlob = null;
var resultUrl = null;
var busy = false;

function reset() {
  TN.clearErr('background-remover-error');
  var r = $('background-remover-result');
  if (r) r.classList.add('hidden');
  if (resultUrl) { try { URL.revokeObjectURL(resultUrl); } catch (e) {} resultUrl = null; }
  resultBlob = null;
  setProgress(0);
}

function onFile(f) {
  if (!f) return;
  var t = (f.type || '').toLowerCase();
  if (t.indexOf('image/') !== 0 && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name || '')) {
    TN.setErr('background-remover-error', 'Please choose an image file (JPG, PNG, WebP…).');
    return;
  }
  TN.clearErr('background-remover-error');
  file = f;
  reset();
  var orig = $('background-remover-original');
  if (orig) {
    if (orig.src && orig.src.indexOf('blob:') === 0) { try { URL.revokeObjectURL(orig.src); } catch (e) {} }
    orig.src = URL.createObjectURL(f);
    orig.classList.remove('hidden');
  }
  var btn = $('background-remover-btn');
  if (btn) btn.disabled = false;
  setStatus('Ready — press “Remove background”.');
}

async function onRemove() {
  if (busy) return;
  if (!file) {
    TN.setErr('background-remover-error', 'Choose an image first.');
    return;
  }
  busy = true;
  TN.clearErr('background-remover-error');
  var btn = $('background-remover-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Working…'; }
  try {
    setStatus('Downloading AI model on first use (~40MB, one-time)…');
    setProgress(2);
    var mod = await import(CDN_URL);
    if (!mod || typeof mod.removeBackground !== 'function') {
      throw new Error('The AI library did not load correctly.');
    }
    setStatus('Removing background…');
    var blob = await mod.removeBackground(file, {
      progress: function (key, current, total) {
        if (total > 0) setProgress((current / total) * 100);
      }
    });
    if (!blob || !blob.size) throw new Error('The AI returned an empty result.');
    setProgress(100);
    resultBlob = blob;
    resultUrl = URL.createObjectURL(blob);
    var prev = $('background-remover-preview');
    if (prev) prev.src = resultUrl;
    var res = $('background-remover-result');
    if (res) res.classList.remove('hidden');
    setStatus('Done! Your transparent PNG is ready.');
  } catch (e) {
    setStatus('');
    setProgress(0);
    var detail = e && e.message ? ' (' + e.message + ')' : '';
    TN.setErr('background-remover-error',
      'Background removal failed. Check your internet connection (the AI model downloads from a CDN on first use) and try again with a smaller photo.' + detail);
  } finally {
    busy = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Remove background'; }
  }
}

function onDownload() {
  if (!resultBlob) return;
  var base = (file && file.name ? file.name : 'image').replace(/\.[^.]+$/, '');
  TN.download(resultBlob, (base || 'image') + '-no-bg.png');
}

function wireDropzone() {
  var dz = $('background-remover-drop');
  var input = $('background-remover-file');
  if (!dz || !input) return;
  dz.addEventListener('click', function () { input.click(); });
  input.addEventListener('change', function () {
    var f = input.files && input.files[0];
    input.value = '';
    onFile(f);
  });
  ['dragover', 'dragenter'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
  });
  dz.addEventListener('drop', function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    onFile(f);
  });
}

try {
  wireDropzone();
  TN.on('background-remover-btn', 'click', onRemove);
  TN.on('background-remover-download', 'click', onDownload);
} catch (e) {
  /* never throw on page load */
}
