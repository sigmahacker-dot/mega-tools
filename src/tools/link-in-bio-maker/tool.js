/* Link in Bio Maker — build a personal links page → download standalone HTML. */
(function () {
  'use strict';

  var SLUG = 'link-in-bio-maker';
  var links = [];

  var THEMES = {
    midnight: { bg: 'linear-gradient(160deg,#0f172a,#1e1b4b)', fg: '#f8fafc', btn: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.2)' },
    sunset: { bg: 'linear-gradient(160deg,#7c2d12,#be123c)', fg: '#fff7ed', btn: 'rgba(255,255,255,0.16)', border: 'rgba(255,255,255,0.25)' },
    forest: { bg: 'linear-gradient(160deg,#052e16,#14532d)', fg: '#ecfdf5', btn: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.2)' },
    paper: { bg: '#faf6ef', fg: '#1f2937', btn: '#ffffff', border: '#e5e0d5' }
  };

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildPage(themeKey) {
    var t = THEMES[themeKey] || THEMES.midnight;
    var name = escHtml(v('name') || 'Your Name');
    var tag = escHtml(v('tag'));
    var bio = escHtml(v('bio'));
    var linkHtml = links.map(function (l) {
      return '<a href="' + escHtml(l.url) + '" target="_blank" rel="noopener" style="display:block;text-decoration:none;color:' + t.fg + ';background:' + t.btn + ';border:1px solid ' + t.border + ';border-radius:14px;padding:14px;margin:10px 0;font-weight:600;text-align:center">' + escHtml(l.label) + '</a>';
    }).join('\n');
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + name + ' — Links</title>\n</head>\n' +
      '<body style="margin:0;min-height:100vh;background:' + t.bg + ';color:' + t.fg + ';font-family:-apple-system,Segoe UI,Roboto,sans-serif;display:flex;justify-content:center">\n' +
      '<div style="width:100%;max-width:420px;padding:48px 20px;text-align:center">\n' +
      '<div style="width:88px;height:88px;border-radius:50%;margin:0 auto 16px;background:' + t.btn + ';border:2px solid ' + t.border + ';display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold">' + escHtml(name.charAt(0).toUpperCase()) + '</div>\n' +
      '<h1 style="margin:0 0 4px;font-size:24px">' + name + '</h1>\n' +
      (tag ? '<p style="margin:0 0 8px;opacity:.85">' + tag + '</p>\n' : '') +
      (bio ? '<p style="margin:0 0 16px;opacity:.75;font-size:14px">' + bio + '</p>\n' : '') +
      linkHtml + '\n</div>\n</body>\n</html>';
  }

  function render() {
    var themeKey = TN.el(SLUG + '-theme').value;
    var t = THEMES[themeKey];
    var name = v('name') || 'Your Name';
    var tag = v('tag');
    var pv = TN.el(SLUG + '-preview');
    pv.style.cssText = 'background:' + t.bg + ';color:' + t.fg + ';border-radius:20px;padding:32px 20px;text-align:center';
    pv.innerHTML =
      '<div style="width:72px;height:72px;border-radius:50%;margin:0 auto 12px;background:' + t.btn + ';border:2px solid ' + t.border + ';display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold">' + TN.esc(name.charAt(0).toUpperCase()) + '</div>' +
      '<h3 style="margin:0 0 4px">' + TN.esc(name) + '</h3>' +
      (tag ? '<p style="margin:0 0 12px;opacity:.85;font-size:14px">' + TN.esc(tag) + '</p>' : '') +
      links.map(function (l) {
        return '<div style="background:' + t.btn + ';border:1px solid ' + t.border + ';border-radius:14px;padding:12px;margin:8px 0;font-weight:600">' + TN.esc(l.label) + '</div>';
      }).join('');

    var box = TN.el(SLUG + '-links');
    if (!links.length) { box.innerHTML = '<p class="muted">No links yet.</p>'; return; }
    box.innerHTML = links.map(function (l, i) {
      return '<div style="margin:4px 0"><strong>' + TN.esc(l.label) + '</strong> <span class="muted">' + TN.esc(l.url) + '</span> ' +
        '<button class="btn btn-sm btn-outline" data-del="' + i + '">×</button></div>';
    }).join('');
    var dels = box.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          links.splice(parseInt(b.getAttribute('data-del'), 10), 1);
          render();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var label = v('label'), url = v('url');
    if (!label) { TN.setErr(SLUG + '-error', 'Enter a link label.'); return; }
    if (!url) { TN.setErr(SLUG + '-error', 'Enter the link URL.'); return; }
    try { new URL(url); } catch (e) { TN.setErr(SLUG + '-error', 'That URL looks invalid.'); return; }
    links.push({ label: label, url: url });
    TN.el(SLUG + '-label').value = '';
    TN.el(SLUG + '-url').value = '';
    render();
  }

  function download() {
    TN.clearErr(SLUG + '-error');
    if (!links.length) { TN.setErr(SLUG + '-error', 'Add at least one link first.'); return; }
    var html = buildPage(TN.el(SLUG + '-theme').value);
    TN.downloadText(html, 'links.html', 'text/html');
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-dl', 'click', download);
      TN.on(SLUG + '-clear', 'click', function () { links = []; render(); });
      TN.el(SLUG + '-theme').addEventListener('change', render);
      ['name', 'tag', 'bio'].forEach(function (k) {
        TN.el(SLUG + '-' + k).addEventListener('input', render);
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();