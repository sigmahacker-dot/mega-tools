/* HTML → Markdown. DOM-based conversion: headings, bold/italic, links, lists,
   code, blockquotes, images, hr. Scripts/styles are dropped. */
(function () {
  'use strict';
  var SLUG = 'html-to-markdown-converter';
  var SAMPLE = '<h1>Getting Started</h1>\n<p>Welcome to <strong>ToolNest</strong> — read the <a href="https://example.com/docs">docs</a> first.</p>\n<h2>Steps</h2>\n<ol>\n  <li>Install the <code>cli</code> tool</li>\n  <li>Run <em>init</em>\n    <ul><li>with <code>--fast</code> flag</li></ul>\n  </li>\n</ol>\n<blockquote>Tip: keep it simple.</blockquote>\n<pre><code>npm install\nnpm start</code></pre>';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function inlineOf(node) {
    var s = '';
    for (var i = 0; i < node.childNodes.length; i++) s += inlineNode(node.childNodes[i]);
    return s;
  }

  function inlineNode(n) {
    if (n.nodeType === 3) return n.nodeValue.replace(/\s+/g, ' ');
    if (n.nodeType !== 1) return '';
    var t = n.tagName.toLowerCase();
    switch (t) {
      case 'br': return '\n';
      case 'strong': case 'b': return '**' + inlineOf(n).trim() + '**';
      case 'em': case 'i': return '*' + inlineOf(n).trim() + '*';
      case 'del': case 's': case 'strike': return '~~' + inlineOf(n).trim() + '~~';
      case 'code': return '`' + n.textContent.replace(/`/g, "'") + '`';
      case 'a': {
        var href = n.getAttribute('href') || '';
        var txt = inlineOf(n).trim();
        return txt ? '[' + txt + '](' + href + ')' : '';
      }
      case 'img':
        return '![' + (n.getAttribute('alt') || '') + '](' + (n.getAttribute('src') || '') + ')';
      case 'script': case 'style': case 'noscript': return '';
      default: return inlineOf(n);
    }
  }

  function blocksOf(node, depth) {
    var s = '';
    for (var i = 0; i < node.childNodes.length; i++) s += blockNode(node.childNodes[i], depth);
    return s;
  }

  function liText(li, depth) {
    var parts = [];
    for (var i = 0; i < li.childNodes.length; i++) {
      var ch = li.childNodes[i];
      if (ch.nodeType === 1 && (ch.tagName === 'UL' || ch.tagName === 'OL')) {
        parts.push('\n' + blockNode(ch, depth + 1).replace(/\n+$/, ''));
      } else {
        parts.push(inlineNode(ch));
      }
    }
    return parts.join('').trim();
  }

  function blockNode(n, depth) {
    if (n.nodeType === 3) return n.nodeValue.trim() ? n.nodeValue.replace(/\s+/g, ' ') : '';
    if (n.nodeType !== 1) return '';
    var t = n.tagName.toLowerCase();
    var pad = '';
    for (var d = 0; d < depth; d++) pad += '  ';
    if (/^h[1-6]$/.test(t)) {
      var lvl = parseInt(t[1], 10), hashes = '';
      for (var h = 0; h < lvl; h++) hashes += '#';
      return hashes + ' ' + inlineOf(n).trim() + '\n\n';
    }
    switch (t) {
      case 'p': case 'div': case 'section': case 'article':
        return inlineOf(n).trim() + '\n\n';
      case 'blockquote': {
        var inner = blocksOf(n, 0).trim().split('\n');
        return inner.map(function (l) { return '> ' + l; }).join('\n') + '\n\n';
      }
      case 'ul': case 'ol': {
        var items = [], idx = 0;
        for (var i = 0; i < n.childNodes.length; i++) {
          var ch = n.childNodes[i];
          if (ch.nodeType === 1 && ch.tagName === 'LI') {
            idx++;
            var marker = t === 'ol' ? idx + '. ' : '- ';
            items.push(pad + marker + liText(ch, depth).replace(/\n/g, '\n' + pad + '  '));
          }
        }
        return items.join('\n') + '\n\n';
      }
      case 'pre': {
        var code = n.textContent.replace(/^\n+|\n+$/g, '');
        return '```\n' + code + '\n```\n\n';
      }
      case 'hr': return '---\n\n';
      case 'br': return '\n';
      case 'script': case 'style': case 'noscript': case 'head': return '';
      case 'table': return blocksOf(n, depth); // flatten tables to text
      case 'tr': return blocksOf(n, depth) + '\n';
      case 'td': case 'th': return inlineOf(n).trim() + ' ';
      default: return blocksOf(n, depth);
    }
  }

  function convert() {
    clear();
    var src = el(SLUG + '-input').value;
    if (!src.trim()) { fail('Paste some HTML first.'); return; }
    try {
      var doc = new DOMParser().parseFromString(src, 'text/html');
      var md = blocksOf(doc.body, 0).replace(/\n{3,}/g, '\n\n').trim() + '\n';
      el(SLUG + '-output').value = md;
    } catch (e) {
      fail('Conversion failed: ' + e.message);
    }
  }

  try {
    TN.on(SLUG + '-convert', 'click', convert);
    TN.on(SLUG + '-sample', 'click', function () { el(SLUG + '-input').value = SAMPLE; clear(); convert(); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'converted.md', 'text/markdown');
    });
  } catch (e) { /* never throw on load */ }
})();
