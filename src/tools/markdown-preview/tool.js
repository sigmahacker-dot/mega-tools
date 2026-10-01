(function () {
  'use strict';
  var ERR = 'markdown-preview-error';
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mdParse(src) {
    var blocks = [], inlines = [];
    src = src.replace(/```(\w*)\n([\s\S]*?)(?:```|$)/g, function (m, lang, code) {
      blocks.push('<pre style="background:#08080c;padding:12px;border-radius:8px;overflow-x:auto"><code>' + escHtml(code.replace(/\n$/, '')) + '</code></pre>');
      return '\n@@TNBLOCK' + (blocks.length - 1) + '@@\n';
    });
    src = src.replace(/`([^`\n]+)`/g, function (m, code) {
      inlines.push('<code style="background:rgba(255,255,255,.08);padding:2px 6px;border-radius:6px">' + escHtml(code) + '</code>');
      return '@@TNINLINE' + (inlines.length - 1) + '@@';
    });
    function inline(t) {
      t = escHtml(t);
      t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px">');
      t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');
      t = t.replace(/(^|[^\w*])\*([^*\n]+)\*(?![\w*])/g, '$1<em>$2</em>');
      t = t.replace(/(^|[^\w])_([^_\n]+)_(?![\w])/g, '$1<em>$2</em>');
      t = t.replace(/~~([^~]+)~~/g, '<del>$1</del>');
      t = t.replace(/@@TNINLINE(\d+)@@/g, function (m, i) { return inlines[+i]; });
      return t;
    }
    var lines = src.split('\n'), html = '', i = 0, para = [];
    function flushPara() { if (para.length) { html += '<p>' + inline(para.join('\n')).replace(/\n/g, '<br>') + '</p>'; para = []; } }
    while (i < lines.length) {
      var line = lines[i], trim = line.trim();
      var bph = /^@@TNBLOCK(\d+)@@$/.exec(trim);
      if (bph && blocks[+bph[1]] !== undefined) {
        flushPara(); html += blocks[+bph[1]]; i++; continue;
      }
      var hm = /^(#{1,6})\s+(.*)$/.exec(line);
      if (hm) { flushPara(); var lv = hm[1].length; html += '<h' + lv + '>' + inline(hm[2]) + '</h' + lv + '>'; i++; continue; }
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flushPara(); html += '<hr>'; i++; continue; }
      if (/^\s*>/.test(line)) {
        flushPara(); var bq = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { bq.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        html += '<blockquote style="border-left:3px solid rgba(255,90,90,.6);padding-left:12px;color:#d7d7de">' + inline(bq.join('\n')).replace(/\n/g, '<br>') + '</blockquote>';
        continue;
      }
      if (/^\s*([-*+])\s+/.test(line)) {
        flushPara(); var ul = [];
        while (i < lines.length && /^\s*([-*+])\s+/.test(lines[i])) { ul.push('<li>' + inline(lines[i].replace(/^\s*[-*+]\s+/, '')) + '</li>'); i++; }
        html += '<ul>' + ul.join('') + '</ul>'; continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        flushPara(); var ol = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { ol.push('<li>' + inline(lines[i].replace(/^\s*\d+\.\s+/, '')) + '</li>'); i++; }
        html += '<ol>' + ol.join('') + '</ol>'; continue;
      }
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|\-]+\|\s*$/.test(lines[i + 1])) {
        flushPara();
        var heads = line.trim().replace(/^\||\|$/g, '').split('|').map(function (s) { return s.trim(); });
        var aligns = lines[i + 1].trim().replace(/^\||\|$/g, '').split('|').map(function (s) {
          s = s.trim();
          return /^:-+:$/.test(s) ? 'center' : /^-+:$/.test(s) ? 'right' : /^:-+$/.test(s) ? 'left' : '';
        });
        i += 2;
        var t = '<table class="data"><thead><tr>' + heads.map(function (h, hi) {
          return '<th' + (aligns[hi] ? ' style="text-align:' + aligns[hi] + '"' : '') + '>' + inline(h) + '</th>';
        }).join('') + '</tr></thead><tbody>';
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          var cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map(function (s) { return s.trim(); });
          t += '<tr>' + cells.map(function (c, ci) {
            return '<td' + (aligns[ci] ? ' style="text-align:' + aligns[ci] + '"' : '') + '>' + inline(c) + '</td>';
          }).join('') + '</tr>';
          i++;
        }
        html += t + '</tbody></table>';
        continue;
      }
      if (/^\s*$/.test(line)) { flushPara(); i++; continue; }
      para.push(line); i++;
    }
    flushPara();
    return html;
  }
  function update() {
    try {
      if (!TN.el('md-out')) return;
      TN.clearErr(ERR);
      var html = mdParse(TN.el('md-src').value);
      TN.el('md-out').innerHTML = html || '<span class="muted">Nothing to preview yet.</span>';
    } catch (e) { TN.setErr(ERR, 'Could not render the Markdown.'); }
  }
  try {
    TN.on('md-src', 'input', update);
    TN.on('md-copy-html', 'click', function () {
      if (TN.copy) TN.copy(TN.el('md-out').innerHTML);
    });
    TN.on('md-clear', 'click', function () { TN.el('md-src').value = ''; update(); });
    TN.el('md-src').value = '# Markdown Preview\n\nType **bold**, *italic*, `code` and more on the left.\n\n- Lists work\n- So do [links](https://example.com)\n\n> Blockquotes too\n\n| A | B |\n|---|---|\n| 1 | 2 |';
    update();
  } catch (e) { /* never throw on load */ }
})();