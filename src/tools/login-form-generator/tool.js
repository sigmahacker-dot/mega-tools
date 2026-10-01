/* Login Form Generator — title/options/theme → styled login form HTML+CSS+JS, live preview. */
(function () {
  'use strict';
  var SLUG = 'login-form-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function build(o) {
    var dark = o.theme === 'dark';
    var cardBg = dark ? '#27272a' : '#ffffff';
    var textC = dark ? '#f4f4f5' : '#18181b';
    var mutC = dark ? '#a1a1aa' : '#52525b';
    var html =
      '<div class="lf-page">\n' +
      '  <form class="lf-card" action="#" method="post">\n' +
      '    <h1 class="lf-title">' + TN.esc(o.title) + '</h1>\n' +
      '    <p class="lf-sub">' + TN.esc(o.sub) + '</p>\n' +
      (o.social ? '    <div class="lf-social">\n      <button type="button" class="lf-soc">G Google</button>\n      <button type="button" class="lf-soc">GH GitHub</button>\n    </div>\n    <div class="lf-div"><span>or</span></div>\n' : '') +
      '    <label class="lf-label" for="lf-email">Email</label>\n' +
      '    <input class="lf-input" type="email" id="lf-email" name="email" placeholder="you@example.com" autocomplete="email" required>\n' +
      '    <label class="lf-label" for="lf-pass">Password</label>\n' +
      '    <div class="lf-passwrap">\n' +
      '      <input class="lf-input" type="password" id="lf-pass" name="password" placeholder="••••••••" autocomplete="current-password" required>\n' +
      '      <button type="button" class="lf-show" aria-label="Show password">Show</button>\n' +
      '    </div>\n' +
      '    <div class="lf-row">\n' +
      (o.remember ? '      <label class="lf-check"><input type="checkbox" name="remember"> Remember me</label>\n' : '      <span></span>\n') +
      (o.forgot ? '      <a href="#" class="lf-link">Forgot password?</a>\n' : '') +
      '    </div>\n' +
      '    <button type="submit" class="lf-submit">' + TN.esc(o.btn) + '</button>\n' +
      '    <p class="lf-signup">No account? <a href="#" class="lf-link">Sign up</a></p>\n' +
      '  </form>\n</div>';
    var css =
      '.lf-page { display: flex; justify-content: center; padding: 16px; font-family: system-ui, sans-serif; }\n' +
      '.lf-card { background: ' + cardBg + '; color: ' + textC + '; width: 100%; max-width: 400px; border-radius: 16px; padding: 32px; box-shadow: 0 12px 40px rgba(0,0,0,.16); }\n' +
      '.lf-title { margin: 0 0 6px; font-size: 26px; }\n' +
      '.lf-sub { margin: 0 0 22px; color: ' + mutC + '; font-size: 14px; }\n' +
      '.lf-social { display: flex; gap: 10px; margin-bottom: 18px; }\n' +
      '.lf-soc { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid ' + (dark ? '#3f3f46' : '#d4d4d8') + '; background: transparent; color: ' + textC + '; font-weight: 600; cursor: pointer; }\n' +
      '.lf-div { display: flex; align-items: center; gap: 12px; color: ' + mutC + '; font-size: 13px; margin-bottom: 18px; }\n' +
      '.lf-div::before, .lf-div::after { content: ""; flex: 1; height: 1px; background: ' + (dark ? '#3f3f46' : '#e4e4e7') + '; }\n' +
      '.lf-label { display: block; font-size: 14px; font-weight: 600; margin: 0 0 6px; }\n' +
      '.lf-input { width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 10px; border: 1px solid ' + (dark ? '#3f3f46' : '#d4d4d8') + '; background: ' + (dark ? '#18181b' : '#fafafa') + '; color: ' + textC + '; font-size: 15px; margin-bottom: 14px; }\n' +
      '.lf-input:focus { outline: 2px solid ' + o.accent + '; border-color: ' + o.accent + '; }\n' +
      '.lf-passwrap { position: relative; }\n' +
      '.lf-show { position: absolute; right: 8px; top: 8px; background: none; border: none; color: ' + o.accent + '; font-weight: 700; font-size: 13px; cursor: pointer; }\n' +
      '.lf-row { display: flex; justify-content: space-between; align-items: center; margin: 2px 0 18px; font-size: 14px; }\n' +
      '.lf-check { display: flex; gap: 8px; align-items: center; color: ' + mutC + '; }\n' +
      '.lf-link { color: ' + o.accent + '; text-decoration: none; font-weight: 600; }\n' +
      '.lf-submit { width: 100%; padding: 13px; border: none; border-radius: 10px; background: ' + o.accent + '; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; }\n' +
      '.lf-submit:hover { filter: brightness(1.08); }\n' +
      '.lf-signup { text-align: center; font-size: 14px; color: ' + mutC + '; margin: 18px 0 0; }';
    var js =
      "var lfShow = document.querySelector('.lf-show');\n" +
      "lfShow.addEventListener('click', function () {\n" +
      "  var p = document.getElementById('lf-pass');\n" +
      "  var show = p.type === 'password';\n" +
      "  p.type = show ? 'text' : 'password';\n" +
      "  lfShow.textContent = show ? 'Hide' : 'Show';\n" +
      "});";
    return { html: html, css: css, js: js };
  }

  function wirePreview(pv) {
    var show = pv.querySelector('.lf-show');
    if (show) show.addEventListener('click', function () {
      var p = pv.querySelector('#lf-pass');
      var s = p.type === 'password';
      p.type = s ? 'text' : 'password';
      show.textContent = s ? 'Hide' : 'Show';
    });
    var form = pv.querySelector('.lf-card');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  function update() {
    clear();
    var title = el(SLUG + '-title').value.trim();
    if (!title) { fail('Enter a form title.'); return; }
    var b = build({
      title: title, sub: el(SLUG + '-sub').value.trim(),
      btn: el(SLUG + '-btn').value.trim() || 'Sign in',
      accent: el(SLUG + '-accent').value, theme: el(SLUG + '-theme').value,
      remember: el(SLUG + '-remember').checked, forgot: el(SLUG + '-forgot').checked,
      social: el(SLUG + '-social').checked
    });
    el(SLUG + '-preview').style.background = el(SLUG + '-theme').value === 'dark' ? '#18181b' : '#f4f4f5';
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    wirePreview(el(SLUG + '-preview'));
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Login</title>\n<style>\n' +
      b.css + '\nbody { margin: 0; background: ' + (el(SLUG + '-theme').value === 'dark' ? '#111' : '#f4f4f5') + '; min-height: 100vh; display: flex; align-items: center; justify-content: center; }\n</style>\n</head>\n<body>\n' +
      b.html + '\n<script>\n' + b.js + '\n<\/script>\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-title')) return;
    ['title', 'sub', 'btn'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-accent', 'input', update);
    TN.on(SLUG + '-theme', 'change', update);
    ['remember', 'forgot', 'social'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'login.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
