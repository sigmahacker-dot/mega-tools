/* Contact Form Generator — field toggles → styled contact form HTML+CSS, live preview. */
(function () {
  'use strict';
  var SLUG = 'contact-form-generator';
  var FIELDS = [
    { key: 'name', label: 'Your name', type: 'text', ph: 'Jane Doe', ac: 'name' },
    { key: 'email', label: 'Email', type: 'email', ph: 'you@example.com', ac: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel', ph: '+1 555 000 1234', ac: 'tel' },
    { key: 'subject', label: 'Subject', type: 'text', ph: 'How can we help?', ac: '' },
    { key: 'message', label: 'Message', type: 'textarea', ph: 'Write your message…', ac: '' }
  ];
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function build(o) {
    var dark = o.theme === 'dark';
    var cardBg = dark ? '#27272a' : '#ffffff';
    var textC = dark ? '#f4f4f5' : '#18181b';
    var mutC = dark ? '#a1a1aa' : '#52525b';
    var req = o.required ? ' required' : '';
    var fields = '';
    o.active.forEach(function (f) {
      if (f.type === 'textarea') {
        fields += '    <label class="cf-label" for="cf-' + f.key + '">' + f.label + '</label>\n' +
          '    <textarea class="cf-input" id="cf-' + f.key + '" name="' + f.key + '" rows="4" placeholder="' + TN.esc(f.ph) + '"' + req + '></textarea>\n';
      } else {
        fields += '    <label class="cf-label" for="cf-' + f.key + '">' + f.label + '</label>\n' +
          '    <input class="cf-input" type="' + f.type + '" id="cf-' + f.key + '" name="' + f.key + '" placeholder="' + TN.esc(f.ph) + '"' +
          (f.ac ? ' autocomplete="' + f.ac + '"' : '') + req + '>\n';
      }
    });
    var html =
      '<form class="cf-card" action="#" method="post">\n' +
      '  <h1 class="cf-title">' + TN.esc(o.title) + '</h1>\n' + fields +
      '  <button type="submit" class="cf-submit">' + TN.esc(o.btn) + '</button>\n</form>';
    var css =
      '.cf-card { background: ' + cardBg + '; color: ' + textC + '; max-width: 520px; margin: 0 auto; border-radius: 16px; padding: 32px; font-family: system-ui, sans-serif; box-shadow: 0 12px 40px rgba(0,0,0,.16); }\n' +
      '.cf-title { margin: 0 0 22px; font-size: 24px; }\n' +
      '.cf-label { display: block; font-size: 14px; font-weight: 600; margin: 0 0 6px; }\n' +
      '.cf-input { width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 10px; border: 1px solid ' + (dark ? '#3f3f46' : '#d4d4d8') + '; background: ' + (dark ? '#18181b' : '#fafafa') + '; color: ' + textC + '; font-size: 15px; font-family: inherit; margin-bottom: 16px; }\n' +
      'textarea.cf-input { resize: vertical; }\n' +
      '.cf-input:focus { outline: 2px solid ' + o.accent + '; border-color: ' + o.accent + '; }\n' +
      '.cf-submit { width: 100%; padding: 13px; border: none; border-radius: 10px; background: ' + o.accent + '; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 4px; }\n' +
      '.cf-submit:hover { filter: brightness(1.08); }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var active = FIELDS.filter(function (f) { return el(SLUG + '-f-' + f.key).checked; });
    if (!active.length) { fail('Enable at least one field.'); return; }
    var b = build({
      title: el(SLUG + '-title').value.trim() || 'Contact us',
      btn: el(SLUG + '-btn').value.trim() || 'Send',
      active: active, required: el(SLUG + '-required').checked,
      accent: el(SLUG + '-accent').value, theme: el(SLUG + '-theme').value
    });
    el(SLUG + '-preview').style.background = el(SLUG + '-theme').value === 'dark' ? '#18181b' : '#f4f4f5';
    var pv = el(SLUG + '-preview');
    pv.innerHTML = '<style>' + b.css + '</style>' + b.html;
    var form = pv.querySelector('.cf-card');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Contact</title>\n<style>\n' +
      b.css + '\nbody { margin: 0; background: ' + (el(SLUG + '-theme').value === 'dark' ? '#111' : '#f4f4f5') + '; padding: 40px 16px; }\n</style>\n</head>\n<body>\n' +
      b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-title')) return;
    ['title', 'btn'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-accent', 'input', update);
    TN.on(SLUG + '-theme', 'change', update);
    FIELDS.forEach(function (f) { TN.on(SLUG + '-f-' + f.key, 'change', update); });
    TN.on(SLUG + '-required', 'change', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'contact.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
