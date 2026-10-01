/* Markdown → HTML. Hand-written, dependency-free parser. Raw HTML is escaped,
   javascript:/data: URLs are blocked — output is safe to inject. */
(function () {
  'use strict';
  var SLUG = 'markdown-to-html-converter';
  var SAMPLE = '# Hello Markdown\n\nThis is **bold**, *italic*, and `inline code`.\n\n## Lists\n\n- Apples\n- Oranges\n  - Blood orange\n1. First\n2. Second\n\n> A wise quote.\n\n```js\nconsole.log("fenced code");\n```\n\n[ToolNest](https://example.com) and ![alt](https://example.com/img.png)\n\n---\n\nDone!';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function safeUrl(u) {
    if (/^(javascript|data|vbscript|file):/i.test(u.trim())) return '#';
    return u;
  }

  function inline(s, spans) {
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, function (m, alt, url) {
      return '<img src="' + safeUrl(url) + '" alt="' + alt + '">';
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, function (m, txt, url) {
      return '<a href="' + safeUrl(url) + '">' + txt + '</a>';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    s = s.replace(/\u0000SPAN(\d+)\u0000/g, function (m, i) {
      return '<code>' + spans[parseInt(i, 10)] + '</code>';
    });
    return s;
  }

  function mdToHtml(src) {
    var codes = [], spans = [];
    var t = escHtml(src);
    t = t.replace(/```(\w*)\n([\s\S]*?)(?:\n```|```)/g, function (m, lang, code) {
      codes.push(code.replace(/^\n+|\n+$/g, ''));
      return '\n\u0000CODE' + (codes.length - 1) + '\u0000\n';
    });
    t = t.replace(/`([^`\n]+)`/g, function (m, c) {
      spans.push(c);
      return '\u0000SPAN' + (spans.length - 1) + '\u0000';
    });

    var lines = t.split('\n'), html = '', i, m;
    var para = [], quote = [], inQuote = false;
    var listStack = [], openLi = false;

    function flushPara() {
      if (para.length) { html += '<p>' + inline(para.join('\n'), spans) + '</p>\n'; para = []; }
    }
    function closeLi() { if (openLi) { html += '</li>\n'; openLi = false; } }
    function closeLists(toIndent) {
      toIndent = toIndent || 0;
      closeLi();
      while (listStack.length && listStack[listStack.length - 1].indent >= toIndent) {
        html += '</' + listStack[listStack.length - 1].type + '>\n';
        listStack.pop();
      }
    }
    function closeQuote() {
      if (inQuote) {
        html += '<blockquote><p>' + quote.map(function (l) { return inline(l, spans); }).join('<br>') + '</p></blockquote>\n';
        inQuote = false; quote = [];
      }
    }
    function handleList(indent, ordered, text) {
      var type = ordered ? 'ol' : 'ul';
      while (listStack.length && listStack[listStack.length - 1].indent > indent) {
        closeLi();
        html += '</' + listStack[listStack.length - 1].type + '>\n';
        listStack.pop();
      }
      var top = listStack[listStack.length - 1];
      if (!top || top.indent < indent) {
        html += '<' + type + '>\n';
        listStack.push({ type: type, indent: indent });
      } else {
        closeLi();
        if (top.type !== type) {
          html += '</' + top.type + '>\n';
          listStack.pop();
          html += '<' + type + '>\n';
          listStack.push({ type: type, indent: indent });
        }
      }
      html += '<li>' + inline(text, spans);
      openLi = true;
    }

    for (i = 0; i < lines.length; i++) {
      var line = lines[i];
      if ((m = /^(#{1,6})\s+(.*)$/.exec(line))) {
        flushPara(); closeLists(0); closeQuote();
        html += '<h' + m[1].length + '>' + inline(m[2], spans) + '</h' + m[1].length + '>\n';
      } else if (/^(\*\*\*|---|___)\s*$/.test(line)) {
        flushPara(); closeLists(0); closeQuote();
        html += '<hr>\n';
      } else if ((m = /^>\s?(.*)$/.exec(line))) {
        flushPara(); closeLists(0);
        if (!inQuote) inQuote = true;
        quote.push(m[1]);
      } else if ((m = /^\u0000CODE(\d+)\u0000$/.exec(line.trim()))) {
        flushPara(); closeLists(0); closeQuote();
        html += '<pre><code>' + codes[parseInt(m[1], 10)] + '</code></pre>\n';
      } else if ((m = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line))) {
        flushPara(); closeQuote();
        handleList(m[1].replace(/\t/g, '    ').length, /^\d/.test(m[2]), m[3]);
      } else if (/^\s*$/.test(line)) {
        flushPara(); closeLists(0); closeQuote();
      } else {
        closeQuote();
        para.push(line);
      }
    }
    flushPara(); closeLists(0); closeQuote();
    return html;
  }

  function render() {
    clear();
    var src = el(SLUG + '-input').value;
    if (!src.trim()) { fail('Type some Markdown first.'); return; }
    var html = mdToHtml(src);
    el(SLUG + '-preview').innerHTML = html;
    el(SLUG + '-html').value = html;
  }

  try {
    TN.on(SLUG + '-render', 'click', render);
    TN.on(SLUG + '-sample', 'click', function () { el(SLUG + '-input').value = SAMPLE; clear(); render(); });
    TN.on(SLUG + '-source', 'change', function () {
      var show = el(SLUG + '-source').checked;
      el(SLUG + '-html').classList.toggle('hidden', !show);
      el(SLUG + '-preview').classList.toggle('hidden', show);
    });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-html').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
  } catch (e) { /* never throw on load */ }
})();
