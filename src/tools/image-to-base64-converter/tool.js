(function () {
  'use strict';
  var ERR = 'image-to-base64-converter-error';
  var lastName = 'image';
  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(2) + ' MB';
  }
  function handle(file) {
    TN.clearErr(ERR);
    if (!file) return;
    if (!/^image\//.test(file.type)) { TN.setErr(ERR, 'Please choose an image file.'); return; }
    if (file.size > 15 * 1048576) { TN.setErr(ERR, 'File is larger than 15 MB — pick a smaller image.'); return; }
    lastName = file.name.replace(/\.[^.]+$/, '') || 'image';
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var url = String(reader.result);
        TN.el('b64-text').value = url;
        var img = TN.el('b64-img');
        img.src = url;
        img.style.display = '';
        TN.el('b64-orig').textContent = fmtSize(file.size);
        TN.el('b64-out').textContent = fmtSize(url.length);
        TN.el('b64-growth').textContent = '+' + Math.round((url.length / file.size - 1) * 100) + '%';
      } catch (e) { TN.setErr(ERR, 'Could not read that file.'); }
    };
    reader.onerror = function () { TN.setErr(ERR, 'Could not read that file.'); };
    reader.readAsDataURL(file);
  }
  try {
    TN.on('b64-file', 'change', function () {
      var f = TN.el('b64-file').files;
      handle(f && f[0]);
    });
    TN.on('b64-copy', 'click', function () {
      var v = TN.el('b64-text').value;
      if (!v) { TN.setErr(ERR, 'Choose an image first.'); return; }
      TN.clearErr(ERR);
      if (TN.copy) TN.copy(v);
    });
    TN.on('b64-dl', 'click', function () {
      var v = TN.el('b64-text').value;
      if (!v) { TN.setErr(ERR, 'Choose an image first.'); return; }
      TN.clearErr(ERR);
      var b = new Blob([v], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = lastName + '-base64.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
  } catch (e) { /* never throw on load */ }
})();