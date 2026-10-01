/* Pricing Table Generator — 2–4 tiers → responsive pricing table HTML+CSS with live preview. */
(function () {
  'use strict';
  var SLUG = 'pricing-table-generator';
  var DEFAULTS = [
    { name: 'Starter', price: '$9', period: '/mo', cta: 'Choose Starter', features: 'Up to 3 projects\n10 GB storage\nEmail support' },
    { name: 'Pro', price: '$29', period: '/mo', cta: 'Choose Pro', features: 'Unlimited projects\n100 GB storage\nPriority support\nCustom domain' },
    { name: 'Team', price: '$79', period: '/mo', cta: 'Contact sales', features: 'Everything in Pro\nSSO & audit logs\nDedicated manager' },
    { name: 'Enterprise', price: 'Custom', period: '', cta: 'Talk to us', features: 'On-premise deploy\nSLA 99.99%\nSecurity review' }
  ];
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function renderTierInputs(n) {
    var host = el(SLUG + '-tierinputs');
    host.innerHTML = '';
    for (var i = 0; i < n; i++) {
      var d = DEFAULTS[i];
      var div = document.createElement('div');
      div.className = 'tool-card';
      div.style.marginBottom = '12px';
      div.innerHTML =
        '<strong>Tier ' + (i + 1) + '</strong>' +
        '<div class="grid2" style="margin-top:8px">' +
        '<div class="field"><label for="' + SLUG + '-name-' + i + '">Name</label><input class="input" id="' + SLUG + '-name-' + i + '" value="' + TN.esc(d.name) + '"></div>' +
        '<div class="field"><label for="' + SLUG + '-price-' + i + '">Price</label><input class="input" id="' + SLUG + '-price-' + i + '" value="' + TN.esc(d.price) + '"></div>' +
        '<div class="field"><label for="' + SLUG + '-period-' + i + '">Period</label><input class="input" id="' + SLUG + '-period-' + i + '" value="' + TN.esc(d.period) + '"></div>' +
        '<div class="field"><label for="' + SLUG + '-cta-' + i + '">Button text</label><input class="input" id="' + SLUG + '-cta-' + i + '" value="' + TN.esc(d.cta) + '"></div>' +
        '</div>' +
        '<div class="field"><label for="' + SLUG + '-features-' + i + '">Features (one per line)</label><textarea class="textarea" id="' + SLUG + '-features-' + i + '" rows="3">' + TN.esc(d.features) + '</textarea></div>';
      host.appendChild(div);
    }
    host.querySelectorAll('input,textarea').forEach(function (inp) {
      inp.addEventListener('input', update);
    });
  }

  function tiers(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push({
        name: el(SLUG + '-name-' + i).value.trim() || ('Tier ' + (i + 1)),
        price: el(SLUG + '-price-' + i).value.trim() || '$0',
        period: el(SLUG + '-period-' + i).value.trim(),
        cta: el(SLUG + '-cta-' + i).value.trim() || 'Choose',
        features: el(SLUG + '-features-' + i).value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean)
      });
    }
    return out;
  }

  function build(ts, highlight, accent, theme) {
    var dark = theme === 'dark';
    var cardBg = dark ? '#27272a' : '#ffffff';
    var textC = dark ? '#f4f4f5' : '#18181b';
    var mutC = dark ? '#a1a1aa' : '#52525b';
    var cards = ts.map(function (t, i) {
      var hot = highlight === i + 1;
      var feats = t.features.map(function (f) {
        return '      <li><span class="pt-check">✓</span>' + TN.esc(f) + '</li>';
      }).join('\n');
      return '  <div class="pt-card' + (hot ? ' pt-hot' : '') + '">\n' +
        (hot ? '    <div class="pt-badge">Most popular</div>\n' : '') +
        '    <div class="pt-name">' + TN.esc(t.name) + '</div>\n' +
        '    <div class="pt-price">' + TN.esc(t.price) + '<span>' + TN.esc(t.period) + '</span></div>\n' +
        '    <ul class="pt-feats">\n' + feats + '\n    </ul>\n' +
        '    <a href="#" class="pt-cta">' + TN.esc(t.cta) + '</a>\n  </div>';
    }).join('\n');
    var html = '<div class="pt-wrap">\n' + cards + '\n</div>';
    var css =
      '.pt-wrap { display: grid; grid-template-columns: repeat(' + ts.length + ', 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }\n' +
      '@media (max-width: 760px) { .pt-wrap { grid-template-columns: 1fr; } }\n' +
      '.pt-card { position: relative; background: ' + cardBg + '; color: ' + textC + '; border-radius: 16px; padding: 28px 24px; border: 1px solid ' + (dark ? '#3f3f46' : '#e4e4e7') + '; display: flex; flex-direction: column; }\n' +
      '.pt-card.pt-hot { border: 2px solid ' + accent + '; transform: scale(1.04); box-shadow: 0 12px 32px rgba(0,0,0,.18); }\n' +
      '.pt-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: ' + accent + '; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 999px; white-space: nowrap; }\n' +
      '.pt-name { font-size: 15px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: ' + mutC + '; }\n' +
      '.pt-price { font-size: 40px; font-weight: 800; margin: 10px 0 18px; }\n' +
      '.pt-price span { font-size: 16px; font-weight: 500; color: ' + mutC + '; }\n' +
      '.pt-feats { list-style: none; margin: 0 0 24px; padding: 0; flex: 1; }\n' +
      '.pt-feats li { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; font-size: 15px; color: ' + textC + '; }\n' +
      '.pt-check { color: ' + accent + '; font-weight: 800; }\n' +
      '.pt-cta { display: block; text-align: center; text-decoration: none; background: ' + accent + '; color: #fff; font-weight: 700; padding: 12px; border-radius: 10px; }\n' +
      '.pt-card:not(.pt-hot) .pt-cta { background: transparent; color: ' + accent + '; border: 2px solid ' + accent + '; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var n = parseInt(el(SLUG + '-tiers').value, 10);
    var accent = el(SLUG + '-accent').value;
    var theme = el(SLUG + '-theme').value;
    var hl = parseInt(el(SLUG + '-highlight').value, 10) || 0;
    var ts = tiers(n);
    var b = build(ts, hl, accent, theme);
    el(SLUG + '-preview').style.background = theme === 'dark' ? '#18181b' : '#f4f4f5';
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Pricing</title>\n<style>\n' +
      b.css + '\nbody { font-family: system-ui, sans-serif; background: ' + (theme === 'dark' ? '#111' : '#fafafa') + '; padding: 40px 16px; }\n</style>\n</head>\n<body>\n' +
      b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-tiers')) return;
    renderTierInputs(3);
    TN.on(SLUG + '-tiers', 'change', function () {
      renderTierInputs(parseInt(el(SLUG + '-tiers').value, 10));
      update();
    });
    ['accent', 'theme', 'highlight'].forEach(function (k) {
      TN.on(SLUG + '-' + k, k === 'accent' ? 'input' : 'change', update);
    });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'pricing.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
