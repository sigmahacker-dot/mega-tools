(function () {
  'use strict';
  var ERR = 'telegram-link-generator-error';
  function val(id) { var e = TN.el(id); return e ? e.value.trim() : ''; }
  function build() {
    var u = val('tg-user').replace(/^@+/, '');
    if (!u) return { err: 'Enter a Telegram username.' };
    if (!/^[A-Za-z0-9_]{5,32}$/.test(u)) return { err: 'Usernames are 5–32 characters: letters, numbers and underscores.' };
    var profile = 'https://t.me/' + u;
    var msg = val('tg-msg');
    var share = 'https://t.me/share/url?url=' + encodeURIComponent(profile) + (msg ? '&text=' + encodeURIComponent(msg) : '');
    return { profile: profile, share: share };
  }
  function update() {
    if (!TN.el('tg-profile')) return;
    TN.clearErr(ERR);
    var r = build();
    if (r.err) { TN.el('tg-profile').value = ''; TN.el('tg-share').value = ''; TN.setErr(ERR, r.err); return; }
    TN.el('tg-profile').value = r.profile;
    TN.el('tg-share').value = r.share;
  }
  try {
    TN.on('tg-user', 'input', update);
    TN.on('tg-msg', 'input', update);
    TN.on('tg-copy-profile', 'click', function () {
      var r = build(); if (r.err) { TN.setErr(ERR, r.err); return; }
      TN.clearErr(ERR); if (TN.copy) TN.copy(r.profile);
    });
    TN.on('tg-copy-share', 'click', function () {
      var r = build(); if (r.err) { TN.setErr(ERR, r.err); return; }
      TN.clearErr(ERR); if (TN.copy) TN.copy(r.share);
    });
    update();
  } catch (e) { /* never throw on load */ }
})();