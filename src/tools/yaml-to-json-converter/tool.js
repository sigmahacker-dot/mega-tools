/* YAML → JSON. Practical subset parser: indentation maps/lists, nested blocks,
   scalars (string/number/bool/null), quoted strings, # comments, simple inline flows. */
(function () {
  'use strict';
  var SLUG = 'yaml-to-json-converter';
  var SAMPLE = '# sample config\nserver:\n  host: localhost\n  port: 8080\n  ssl: true\n  welcome: "Hello, YAML!"\ndatabase:\n  urls:\n    - postgres://db1:5432/app\n    - postgres://db2:5432/app\n  pool: 10\nfeatures: [auth, billing, "dark mode"]\nempty_value:\n';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function stripComment(line) {
    var out = '', sq = false, dq = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === "'" && !dq) {
        if (line[i + 1] === "'") { out += "''"; i++; continue; }
        sq = !sq; out += c; continue;
      }
      if (c === '"' && !sq) { if (i === 0 || line[i - 1] !== '\\') dq = !dq; out += c; continue; }
      if (c === '#' && !sq && !dq && (i === 0 || /\s/.test(line[i - 1]))) break;
      out += c;
    }
    return out;
  }

  function splitFlow(s) { // split on commas outside quotes/brackets
    var parts = [], cur = '', sq = false, dq = false, depth = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "'" && !dq) sq = !sq;
      else if (c === '"' && !sq) dq = !dq;
      else if (!sq && !dq) {
        if (c === '[' || c === '{') depth++;
        else if (c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
      }
      cur += c;
    }
    parts.push(cur);
    return parts;
  }

  function splitKV(text) { // split on first ':' outside quotes/brackets, followed by space/EOL
    var sq = false, dq = false, depth = 0;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (c === "'" && !dq) sq = !sq;
      else if (c === '"' && !sq) dq = !dq;
      else if (!sq && !dq) {
        if (c === '[' || c === '{') depth++;
        else if (c === ']' || c === '}') depth--;
        else if (c === ':' && depth === 0 && (i + 1 >= text.length || /\s/.test(text[i + 1]))) {
          return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
        }
      }
    }
    return null;
  }

  function parseScalar(s) {
    s = s.trim();
    if (s === '') return '';
    if (s.length >= 2 && ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'"))) {
      var inner = s.slice(1, -1);
      if (s[0] === '"') return inner.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      return inner.replace(/''/g, "'");
    }
    var low = s.toLowerCase();
    if (low === 'true' || low === 'yes') return true;
    if (low === 'false' || low === 'no') return false;
    if (low === 'null' || s === '~') return null;
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return parseFloat(s);
    if (s[0] === '[' && s[s.length - 1] === ']') return splitFlow(s.slice(1, -1)).map(parseScalar);
    if (s[0] === '{' && s[s.length - 1] === '}') {
      var o = {};
      splitFlow(s.slice(1, -1)).forEach(function (p) {
        var kv = splitKV(p);
        if (kv) o[parseScalar(kv[0])] = parseScalar(kv[1]);
      });
      return o;
    }
    return s;
  }

  function parseYAML(src) {
    var raw = src.split(/\r?\n/), items = [], i, stripped, indent;
    for (i = 0; i < raw.length; i++) {
      stripped = stripComment(raw[i]);
      if (!stripped.trim()) continue;
      indent = stripped.match(/^ */)[0].length;
      if (/^\t* /.test(stripped) || stripped.slice(0, indent).indexOf('\t') >= 0) {
        throw new Error('Line ' + (i + 1) + ': tabs are not allowed for indentation');
      }
      items.push({ indent: indent, text: stripped.trim(), line: i + 1 });
    }
    if (!items.length) throw new Error('Empty input');
    var pos = 0;
    function peek() { return items[pos]; }
    function isListItem(t) { return t === '-' || /^-(\s|$)/.test(t); }
    function block(minIndent) {
      var it = peek();
      if (!it) return null;
      return isListItem(it.text) ? parseList(minIndent) : parseMap(minIndent);
    }
    function valueFor(val, it) {
      if (val !== '') return parseScalar(val);
      var nxt = peek();
      if (nxt && nxt.indent > it.indent) return block(nxt.indent);
      return null;
    }
    function parseList(minIndent) {
      var arr = [], it;
      while ((it = peek()) && it.indent === minIndent && isListItem(it.text)) {
        var rest = it.text === '-' ? '' : it.text.replace(/^-\s+/, '');
        pos++;
        if (rest === '') {
          var nxt = peek();
          arr.push(nxt && nxt.indent > minIndent ? block(nxt.indent) : null);
        } else {
          var kv = splitKV(rest);
          if (kv) {
            var obj = {};
            obj[kv[0]] = valueFor(kv[1], it);
            var more;
            while ((more = peek()) && more.indent === minIndent && !isListItem(more.text)) {
              var kv2 = splitKV(more.text);
              if (!kv2) throw new Error('Line ' + more.line + ': expected "key: value"');
              pos++;
              obj[kv2[0]] = valueFor(kv2[1], more);
            }
            arr.push(obj);
          } else {
            arr.push(parseScalar(rest));
          }
        }
      }
      return arr;
    }
    function parseMap(minIndent) {
      var obj = {}, it;
      while ((it = peek()) && it.indent === minIndent && !isListItem(it.text)) {
        var kv = splitKV(it.text);
        if (!kv) throw new Error('Line ' + it.line + ': expected "key: value"');
        pos++;
        obj[kv[0]] = valueFor(kv[1], it);
      }
      return obj;
    }
    var result = block(items[0].indent);
    if (pos < items.length) throw new Error('Line ' + items[pos].line + ': unexpected content (bad indentation?)');
    return result;
  }

  function convert() {
    clear();
    var src = el(SLUG + '-input').value;
    if (!src.trim()) { fail('Paste some YAML first.'); return; }
    try {
      var obj = parseYAML(src);
      el(SLUG + '-output').value = JSON.stringify(obj, null, 2);
    } catch (e) {
      fail(e.message);
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
      TN.downloadText(v, 'data.json', 'application/json');
    });
  } catch (e) { /* never throw on load */ }
})();
