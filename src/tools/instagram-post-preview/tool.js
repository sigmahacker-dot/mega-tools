/* Instagram Post Preview — realistic IG square post mock from text/image. */
(function () {
  'use strict';

  var SLUG = 'instagram-post-preview';
  var uploaded = '';

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function render() {
    TN.clearErr(SLUG + '-error');
    var user = v('user') || 'yourhandle';
    var cap = TN.el(SLUG + '-cap').value;
    var src = uploaded || v('url');
    if (!src) { TN.setErr(SLUG + '-error', 'Upload a photo or paste an image URL first.'); return; }
    if (!cap.trim()) { TN.setErr(SLUG + '-error', 'Type a caption first.'); return; }

    var capHtml = TN.esc(cap).replace(/\n/g, '<br>');
    capHtml = capHtml.replace(/([#@][\w.]+)/g, '<span style="color:#00376b">$1</span>');
    capHtml = capHtml.replace(/(https?:\/\/[^\s<]+)/g, '<span style="color:#00376b">$1</span>');

    TN.el(SLUG + '-mock').innerHTML =
      '<div style="background:#fff;color:#000;border:1px solid #dbdbdb;border-radius:4px;max-width:470px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">' +
      '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px">' +
      '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(45deg,#f09433,#dc2743,#bc1888);padding:2px">' +
      '<div style="width:100%;height:100%;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;font-size:12px">' + TN.esc(user.charAt(0).toUpperCase()) + '</div></div>' +
      '<div style="font-weight:600;font-size:14px;flex:1">' + TN.esc(user) + '</div>' +
      '<div style="font-size:18px">⋯</div></div>' +
      '<img src="' + TN.esc(src) + '" alt="post" style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block" onerror="this.style.display=\'none\'">' +
      '<div style="display:flex;gap:14px;padding:10px 12px;font-size:22px">' +
      '<span>♡</span><span>💬</span><span>➤</span><span style="margin-left:auto">🔖</span></div>' +
      '<div style="padding:0 12px 12px;font-size:14px"><strong>1,248 likes</strong>' +
      '<div style="margin-top:4px"><strong>' + TN.esc(user) + '</strong> ' + capHtml + '</div>' +
      '<div style="color:#8e8e8e;margin-top:4px">View all 32 comments</div>' +
      '<div style="color:#8e8e8e;font-size:11px;margin-top:4px">JUST NOW</div></div></div>';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-render')) return;
      TN.el(SLUG + '-file').addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        TN.readAsDataURL(f).then(function (url) { uploaded = url; }).catch(function () {
          TN.setErr(SLUG + '-error', 'Could not read that image.');
        });
      });
      TN.on(SLUG + '-render', 'click', render);
      TN.on(SLUG + '-copy', 'click', function () {
        var t = TN.el(SLUG + '-cap').value;
        if (!t.trim()) { TN.setErr(SLUG + '-error', 'Nothing to copy yet.'); return; }
        TN.copy(t).catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();