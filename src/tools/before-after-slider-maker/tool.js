/* Before/After Slider Maker — standalone comparison slider as a downloadable .html file. */
(function () {
  'use strict';
  var SLUG = 'before-after-slider-maker';
  var img1 = null, img2 = null;

  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function loadInto(file, slot) {
    if (!file) return;
    TN.clearErr(SLUG + '-error');
    TN.readAsDataURL(file).then(function (url) {
      if (slot === 1) { img1 = url; TN.show(SLUG + '-wrap1'); TN.el(SLUG + '-img1').src = url; }
      else { img2 = url; TN.show(SLUG + '-wrap2'); TN.el(SLUG + '-img2').src = url; }
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not read that image file.');
    });
  }

  function buildHtml() {
    var title = (TN.el(SLUG + '-title') && TN.el(SLUG + '-title').value) || 'Before / After';
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + escAttr(title) + '</title>\n<style>\n' +
      '*{box-sizing:border-box}body{margin:0;background:#111;color:#fff;font-family:Arial,Helvetica,sans-serif}' +
      '.wrap{max-width:1000px;margin:0 auto;padding:24px}h1{text-align:center;font-size:1.4rem}' +
      '.cmp{position:relative;overflow:hidden;border-radius:12px;user-select:none;touch-action:pan-y}' +
      '.cmp img{display:block;width:100%;height:auto;pointer-events:none}' +
      '.cmp .after{position:absolute;inset:0;overflow:hidden}' +
      '.cmp .after img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
      '.bar{position:absolute;top:0;bottom:0;width:3px;background:#fff;box-shadow:0 0 12px rgba(0,0,0,.6);cursor:ew-resize}' +
      '.knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 10px rgba(0,0,0,.5)}' +
      '.lbl{position:absolute;top:12px;padding:6px 12px;background:rgba(0,0,0,.55);border-radius:6px;font-size:13px;letter-spacing:1px}' +
      '.lbl.b{left:12px}.lbl.a{right:12px}\n</style>\n</head>\n<body>\n<div class="wrap">\n' +
      '<h1>' + escAttr(title) + '</h1>\n<div class="cmp" id="cmp">\n' +
      '<img src="' + img1 + '" alt="Before">\n' +
      '<div class="after" id="after"><img src="' + img2 + '" alt="After"></div>\n' +
      '<div class="bar" id="bar"><div class="knob">&#10231;</div></div>\n' +
      '<div class="lbl b">BEFORE</div><div class="lbl a">AFTER</div>\n</div>\n' +
      '<p style="text-align:center;color:#888;font-size:13px">Drag the slider to compare.</p>\n</div>\n' +
      '<script>(function(){var c=document.getElementById("cmp"),a=document.getElementById("after"),b=document.getElementById("bar"),p=50;' +
      'function set(n){p=Math.max(0,Math.min(100,n));a.style.width=p+"%";b.style.left="calc("+p+"% - 1.5px)";}' +
      'function mv(e){var r=c.getBoundingClientRect(),cx=(e.touches?e.touches[0].clientX:e.clientX);set((cx-r.left)/r.width*100);}' +
      'var d=false;c.addEventListener("pointerdown",function(e){d=true;c.setPointerCapture(e.pointerId);mv(e);});' +
      'c.addEventListener("pointermove",function(e){if(d)mv(e);});' +
      'c.addEventListener("pointerup",function(){d=false;});c.addEventListener("pointercancel",function(){d=false;});' +
      'set(50);})();<' + '/script>\n</body>\n</html>';
  }

  function download() {
    if (!img1 || !img2) {
      TN.setErr(SLUG + '-error', 'Please upload both a before and an after image.');
      return;
    }
    var html = buildHtml();
    var blob = new Blob([html], { type: 'text/html' });
    TN.download(blob, 'before-after-slider.html');
  }

  function wireDrop(dropId, fileId, slot) {
    var dz = TN.el(dropId), input = TN.el(fileId);
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) loadInto(input.files[0], slot);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadInto(e.dataTransfer.files[0], slot);
    });
  }

  wireDrop(SLUG + '-drop1', SLUG + '-file1', 1);
  wireDrop(SLUG + '-drop2', SLUG + '-file2', 2);
  TN.on(SLUG + '-download', 'click', download);
})();
