/* Banner Text Generator — wrap text in box-drawing borders. */
(function () {
  'use strict';
  var SLUG = 'banner-text-generator';
  var STYLES = {
    single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
    double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
    rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
    star: { tl: '*', tr: '*', bl: '*', br: '*', h: '*', v: '*' }
  };

  function repeat(ch, n) { var s = ''; for (var i = 0; i < n; i++) s += ch; return s; }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    var style = STYLES[TN.el(SLUG + '-style').value] || STYLES.single;
    var pad = parseInt(TN.el(SLUG + '-pad').value, 10);
    if (isNaN(pad) || pad < 0) pad = 2;
    if (pad > 8) pad = 8;
    var lines = input.split('\n');
    var maxLen = 0;
    lines.forEach(function (l) { if (l.length > maxLen) maxLen = l.length; });
    var inner = maxLen + pad * 2;
    var out = [];
    out.push(style.tl + repeat(style.h, inner) + style.tr);
    for (var p = 0; p < pad; p++) out.push(style.v + repeat(' ', inner) + style.v);
    lines.forEach(function (l) {
      out.push(style.v + repeat(' ', pad) + l + repeat(' ', inner - pad - l.length) + style.v);
    });
    for (var q = 0; q < pad; q++) out.push(style.v + repeat(' ', inner) + style.v);
    out.push(style.bl + repeat(style.h, inner) + style.br);
    TN.el(SLUG + '-output').textContent = out.join('\n');
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
