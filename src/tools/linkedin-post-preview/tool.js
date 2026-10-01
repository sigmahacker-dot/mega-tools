/* LinkedIn Post Preview — realistic LinkedIn post mock from your text. */
(function () {
  'use strict';

  var SLUG = 'linkedin-post-preview';
  var FOLD = 210;

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w.charAt(0).toUpperCase(); }).join('').slice(0, 2) || '?';
  }

  function render() {
    TN.clearErr(SLUG + '-error');
    var name = v('name') || 'Your Name';
    var headline = v('headline') || 'Your headline';
    var text = TN.el(SLUG + '-text').value;
    var img = v('img');
    if (!text.trim()) { TN.setErr(SLUG + '-error', 'Type some post text first.'); return; }

    var visible = text.length > FOLD ? text.slice(0, FOLD) : text;
    var body = TN.esc(visible).replace(/\n/g, '<br>') +
      (text.length > FOLD ? ' <span style="color:#666">…see more</span>' : '');
    // linkify hashtags/mentions/urls (display only)
    body = body.replace(/(https?:\/\/[^\s<]+)/g, '<span style="color:#0a66c2;font-weight:600">$1</span>');
    body = body.replace(/([#@][\w-]+)/g, '<span style="color:#0a66c2;font-weight:600">$1</span>');

    TN.el(SLUG + '-mock').innerHTML =
      '<div style="background:#fff;color:#191919;border:1px solid #ddd;border-radius:8px;max-width:540px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">' +
      '<div style="display:flex;gap:10px;padding:12px">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:#0a66c2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold">' + TN.esc(initials(name)) + '</div>' +
      '<div><div style="font-weight:600;font-size:14px">' + TN.esc(name) + ' <span style="color:#666;font-weight:400">• 1st</span></div>' +
      '<div style="font-size:12px;color:#666">' + TN.esc(headline) + '</div>' +
      '<div style="font-size:12px;color:#666">Just now • 🌐</div></div></div>' +
      '<div style="padding:0 12px 12px;font-size:14px;line-height:1.5">' + body + '</div>' +
      (img ? '<img src="' + TN.esc(img) + '" alt="post image" style="width:100%;display:block" onerror="this.style.display=\'none\'">' : '') +
      '<div style="padding:8px 12px;font-size:12px;color:#666;border-top:1px solid #eee">👍❤️ 128 • 14 comments • 3 reposts</div>' +
      '<div style="display:flex;border-top:1px solid #eee;padding:4px">' +
      ['👍 Like', '💬 Comment', '🔁 Repost', '📤 Send'].map(function (a) {
        return '<div style="flex:1;text-align:center;padding:8px;font-size:13px;color:#666;font-weight:600">' + a + '</div>';
      }).join('') + '</div></div>' +
      (text.length > FOLD ? '<p class="muted" style="margin-top:6px">✂️ “see more” fold at ' + FOLD + ' characters — put your hook above it.</p>' : '');
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-render')) return;
      TN.el(SLUG + '-text').addEventListener('input', function () {
        TN.el(SLUG + '-count').textContent = this.value.length;
      });
      TN.on(SLUG + '-render', 'click', render);
      TN.on(SLUG + '-copy', 'click', function () {
        var t = TN.el(SLUG + '-text').value;
        if (!t.trim()) { TN.setErr(SLUG + '-error', 'Nothing to copy yet.'); return; }
        TN.copy(t).catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();