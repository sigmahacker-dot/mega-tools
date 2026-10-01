/* Timeline CSS Generator — event list → vertical timeline HTML+CSS with live preview. */
(function () {
  'use strict';
  var SLUG = 'timeline-css-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseEvents(text) {
    return text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var m = l.match(/^(.+?)\s*[–—-]\s*(.+)$/);
      if (m) return { date: m[1].trim(), text: m[2].trim() };
      return { date: '', text: l };
    });
  }

  function build(events, accent, theme, radius) {
    var dark = theme === 'dark';
    var cardBg = dark ? '#27272a' : '#ffffff';
    var textC = dark ? '#f4f4f5' : '#18181b';
    var dateC = dark ? '#a1a1aa' : '#52525b';
    var items = events.map(function (e) {
      return '  <div class="tl-item">\n' +
        '    <div class="tl-dot"></div>\n' +
        '    <div class="tl-card">\n' +
        (e.date ? '      <div class="tl-date">' + TN.esc(e.date) + '</div>\n' : '') +
        '      <div class="tl-text">' + TN.esc(e.text) + '</div>\n' +
        '    </div>\n  </div>';
    }).join('\n');
    var html = '<div class="tl-timeline">\n' + items + '\n</div>';
    var css =
      '.tl-timeline { position: relative; max-width: 560px; margin: 0 auto; padding: 8px 0; }\n' +
      '.tl-timeline::before { content: ""; position: absolute; left: 11px; top: 0; bottom: 0; width: 2px; background: ' + accent + '; opacity: .45; }\n' +
      '.tl-item { position: relative; padding: 0 0 20px 44px; }\n' +
      '.tl-item:last-child { padding-bottom: 4px; }\n' +
      '.tl-dot { position: absolute; left: 4px; top: 4px; width: 16px; height: 16px; border-radius: 50%; background: ' + accent + '; border: 3px solid ' + cardBg + '; box-shadow: 0 0 0 2px ' + accent + '; }\n' +
      '.tl-card { background: ' + cardBg + '; color: ' + textC + '; border-radius: ' + radius + 'px; padding: 12px 16px; box-shadow: 0 2px 10px rgba(0,0,0,.12); }\n' +
      '.tl-date { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ' + accent + '; margin-bottom: 4px; }\n' +
      '.tl-text { font-size: 15px; line-height: 1.5; color: ' + dateC + '; }\n' +
      '.tl-text { color: ' + textC + '; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var events = parseEvents(el(SLUG + '-events').value);
    if (!events.length) { fail('Add at least one event.'); return; }
    var accent = el(SLUG + '-accent').value;
    var theme = el(SLUG + '-theme').value;
    var radius = Math.max(0, Math.min(30, parseInt(el(SLUG + '-radius').value, 10) || 0));
    var b = build(events, accent, theme, radius);
    el(SLUG + '-preview').style.background = theme === 'dark' ? '#18181b' : '#f4f4f5';
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    var doc = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Timeline</title>\n<style>\n' +
      b.css + '\nbody { font-family: system-ui, sans-serif; background: ' + (theme === 'dark' ? '#111' : '#fafafa') + '; padding: 32px 16px; }\n</style>\n</head>\n<body>\n' +
      b.html + '\n</body>\n</html>\n';
    el(SLUG + '-output').value = doc;
    el(SLUG + '-doc').value = doc;
  }

  try {
    if (!el(SLUG + '-events')) return;
    var holder = document.createElement('input');
    holder.type = 'hidden'; holder.id = SLUG + '-doc';
    el(SLUG + '-output').parentNode.appendChild(holder);
    TN.on(SLUG + '-events', 'input', update);
    TN.on(SLUG + '-accent', 'input', update);
    TN.on(SLUG + '-theme', 'change', update);
    TN.on(SLUG + '-radius', 'input', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-doc').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-doc').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'timeline.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
