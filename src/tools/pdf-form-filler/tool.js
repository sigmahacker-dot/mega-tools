/* PDF Form Filler — detect AcroForm text fields, fill them, download. Requires PDFLib. */
(function () {
  'use strict';
  var SLUG = 'pdf-form-filler';
  var ERR = SLUG + '-error';
  var buffer = null;
  var fieldNames = [];
  var pdfName = 'form.pdf';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function reset() {
    buffer = null; fieldNames = [];
    $('info').textContent = '';
    $('fields').innerHTML = '<p class="muted">No PDF loaded yet.</p>';
    $('fill').disabled = true;
    TN.hide(SLUG + '-result');
    try { $('file').value = ''; } catch (e) {}
  }

  function onFile(ev) {
    TN.clearErr(ERR);
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    if (typeof PDFLib === 'undefined') {
      TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    pdfName = f.name || pdfName;
    (async function () {
      try {
        buffer = await TN.readAsArrayBuffer(f);
        var doc = await PDFLib.PDFDocument.load(buffer);
        var form = null;
        try { form = doc.getForm(); } catch (e) { form = null; }
        if (!form) throw new Error('no-form');
        var fields = form.getFields();
        var textFields = [];
        fields.forEach(function (fld) {
          try {
            if (fld instanceof PDFLib.PDFTextField) textFields.push(fld.getName());
          } catch (e) { /* skip unknown field types */ }
        });
        fieldNames = textFields;
        if (!textFields.length) throw new Error('no-fields');
        $('info').textContent = pdfName + ' — ' + textFields.length + ' fillable text field' + (textFields.length === 1 ? '' : 's') + ' detected.';
        var html = '';
        textFields.forEach(function (nm, i) {
          var current = '';
          try {
            var tf = doc.getForm().getTextField(nm);
            var t = tf.getText();
            if (t) current = t;
          } catch (e) {}
          html += '<div class="field"><label for="' + SLUG + '-f' + i + '">' + esc(nm) + '</label>'
            + '<input type="text" class="input" id="' + SLUG + '-f' + i + '" data-fname="' + esc(nm) + '" value="' + esc(current) + '"></div>';
        });
        $('fields').innerHTML = html;
        $('fill').disabled = false;
        TN.clearErr(ERR);
      } catch (e) {
        reset();
        TN.setErr(ERR, e && e.message === 'no-fields'
          ? 'No fillable text fields found in "' + pdfName + '". This tool works on PDFs that already contain AcroForm fields.'
          : e && e.message === 'no-form'
          ? 'This PDF has no form data. Try a PDF with fillable form fields.'
          : 'Could not read "' + pdfName + '" — is it a valid PDF?');
      }
    })();
  }

  function onFill() {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
    if (!buffer || !fieldNames.length) { TN.setErr(ERR, 'Load a PDF with form fields first.'); return; }
    if (typeof PDFLib === 'undefined') {
      TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    var btn = $('fill');
    btn.disabled = true;
    (async function () {
      try {
        var doc = await PDFLib.PDFDocument.load(buffer);
        var form = doc.getForm();
        var filled = 0;
        fieldNames.forEach(function (nm, i) {
          var input = document.getElementById(SLUG + '-f' + i);
          var val = input ? input.value : '';
          try {
            var tf = form.getTextField(nm);
            tf.setText(val || '');
            if (val) filled++;
          } catch (e) { /* skip */ }
        });
        var bytes = await doc.save();
        TN.download(new Blob([bytes], { type: 'application/pdf' }), pdfName.replace(/\.pdf$/i, '') + '-filled.pdf');
        var res = $('result');
        res.innerHTML = '<p class="success">Filled ' + filled + ' of ' + fieldNames.length + ' fields. The filled PDF has been downloaded.</p>';
        TN.show(SLUG + '-result');
      } catch (e) {
        TN.setErr(ERR, 'Filling failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        btn.disabled = false;
      }
    })();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      TN.on(SLUG + '-file', 'change', onFile);
      TN.on(SLUG + '-fill', 'click', onFill);
      TN.on(SLUG + '-clear', 'click', function () { TN.clearErr(ERR); reset(); });
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
