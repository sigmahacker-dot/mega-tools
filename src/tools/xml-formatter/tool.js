/* XML Formatter — real tokenizer + tree builder; pretty-print or minify.
   Handles comments, CDATA, processing instructions, DOCTYPE and self-closing tags. */
(function () {
  'use strict';
  var SLUG = 'xml-formatter';
  var SAMPLE = '<?xml version="1.0" encoding="UTF-8"?>\n<!-- sample catalog -->\n<catalog><book id="b1"><title>Deep Work</title><author>Cal Newport</author><price currency="USD">18.99</price><tags><tag>focus</tag><tag>productivity</tag></tags></book><book id="b2"><title><![CDATA[The Pragmatic <Programmer>]]></title><author>Hunt &amp; Thomas</author><price currency="USD">24.50</price><tags/></book></catalog>';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }
  function rep(s, n) { var o = ''; for (var i = 0; i < n; i++) o += s; return o; }

  function tokenize(src) {
    var tokens = [];
    var re = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<![^<>]*>|<[^<>]+>)/g;
    var last = 0, m;
    while ((m = re.exec(src))) {
      if (m.index > last) tokens.push({ type: 'text', raw: src.slice(last, m.index) });
      tokens.push({ type: 'tag', raw: m[1] });
      last = m.index + m[1].length;
    }
    if (last < src.length) tokens.push({ type: 'text', raw: src.slice(last) });
    return tokens;
  }

  function parse(src) {
    var tokens = tokenize(src);
    var root = { type: 'root', children: [] };
    var stack = [root];
    tokens.forEach(function (t) {
      var top = stack[stack.length - 1];
      if (t.type === 'text') {
        if (t.raw.trim() !== '') top.children.push({ type: 'text', raw: t.raw });
        return;
      }
      var raw = t.raw;
      if (/^<!--/.test(raw) || /^<!\[CDATA\[/.test(raw) || /^<\?/.test(raw) || /^<![A-Z]/i.test(raw)) {
        top.children.push({ type: 'raw', raw: raw });
        return;
      }
      var close = /^<\/\s*([A-Za-z_][\w:.-]*)/.exec(raw);
      if (close) {
        if (stack.length <= 1 || top.name !== close[1]) {
          throw new Error('Mismatched closing tag </' + close[1] + '>' +
            (top.name ? ' (expected </' + top.name + '>)' : ''));
        }
        stack.pop();
        return;
      }
      var open = /^<\s*([A-Za-z_][\w:.-]*)/.exec(raw);
      if (!open) throw new Error('Invalid tag: ' + raw.slice(0, 40));
      var self = /\/\s*>$/.test(raw);
      var node = { type: 'element', name: open[1], raw: raw, children: [], self: self };
      top.children.push(node);
      if (!self) stack.push(node);
    });
    if (stack.length > 1) throw new Error('Unclosed tag <' + stack[stack.length - 1].name + '>');
    return root;
  }

  function kidsOf(node) {
    return node.children.filter(function (c) { return !(c.type === 'text' && c.raw.trim() === ''); });
  }

  function renderPretty(node, depth, unit) {
    if (node.type === 'root') {
      return node.children.map(function (c) { return renderPretty(c, 0, unit); }).join('\n');
    }
    if (node.type === 'raw') return rep(unit, depth) + node.raw;
    if (node.type === 'text') return rep(unit, depth) + node.raw.trim();
    var openTag = node.raw.replace(/\s+/g, ' ');
    if (node.self) return rep(unit, depth) + openTag;
    var kids = kidsOf(node);
    if (kids.length === 1 && kids[0].type === 'text') {
      return rep(unit, depth) + openTag + kids[0].raw.trim() + '</' + node.name + '>';
    }
    var inner = kids.map(function (c) { return renderPretty(c, depth + 1, unit); }).join('\n');
    return rep(unit, depth) + openTag + (inner ? '\n' + inner + '\n' + rep(unit, depth) : '') + '</' + node.name + '>';
  }

  function renderMin(node, strip) {
    if (node.type === 'root') {
      return node.children.map(function (c) { return renderMin(c, strip); }).join('');
    }
    if (node.type === 'raw') {
      if (strip && /^<!--/.test(node.raw)) return '';
      return node.raw;
    }
    if (node.type === 'text') return node.raw.replace(/\s+/g, ' ');
    var openTag = node.raw.replace(/\s+/g, ' ');
    if (node.self) return openTag;
    return openTag + node.children.map(function (c) { return renderMin(c, strip); }).join('') + '</' + node.name + '>';
  }

  function format() {
    clear();
    var src = el(SLUG + '-input').value;
    if (!src.trim()) { fail('Paste some XML first.'); return; }
    try {
      var tree = parse(src);
      var mode = el(SLUG + '-mode').value;
      var out;
      if (mode === 'pretty') {
        var ind = el(SLUG + '-indent').value;
        var unit = ind === 'tab' ? '\t' : rep(' ', parseInt(ind, 10));
        out = renderPretty(tree, 0, unit);
      } else {
        out = renderMin(tree, el(SLUG + '-strip').checked);
      }
      el(SLUG + '-output').value = out;
    } catch (e) {
      fail('Invalid XML: ' + e.message);
    }
  }

  try {
    TN.on(SLUG + '-format', 'click', format);
    TN.on(SLUG + '-sample', 'click', function () { el(SLUG + '-input').value = SAMPLE; clear(); format(); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'formatted.xml', 'application/xml');
    });
  } catch (e) { /* never throw on load */ }
})();
