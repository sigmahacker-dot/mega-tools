/* SQL Formatter — tokenizer preserves strings/comments; keywords uppercased,
   major clauses on new lines, parens indented. */
(function () {
  'use strict';
  var SLUG = 'sql-formatter';
  var SAMPLE = "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = 1 and u.created_at > '2024-01-01' group by u.id, u.name having count(o.id) > 5 order by orders desc limit 20;";

  var CLAUSE = { // keyword -> newline before, extra indent after
    'SELECT': 0, 'FROM': 0, 'WHERE': 0, 'GROUP BY': 0, 'ORDER BY': 0, 'HAVING': 0,
    'LIMIT': 0, 'OFFSET': 0, 'UNION': 0, 'UNION ALL': 0, 'EXCEPT': 0, 'INTERSECT': 0,
    'INSERT INTO': 0, 'VALUES': 0, 'UPDATE': 0, 'SET': 0, 'DELETE FROM': 0,
    'LEFT JOIN': 1, 'RIGHT JOIN': 1, 'INNER JOIN': 1, 'OUTER JOIN': 1, 'FULL JOIN': 1,
    'CROSS JOIN': 1, 'JOIN': 1, 'ON': 2
  };
  var JOINER = { 'AND': 0, 'OR': 0 };
  var KEYWORDS = ('SELECT FROM WHERE GROUP BY ORDER BY HAVING LIMIT OFFSET UNION EXCEPT INTERSECT ' +
    'INSERT INTO VALUES UPDATE SET DELETE LEFT RIGHT INNER OUTER FULL CROSS JOIN ON AND OR AS ' +
    'DISTINCT ALL BY ASC DESC NOT NULL IS IN LIKE BETWEEN EXISTS CASE WHEN THEN ELSE END ' +
    'CREATE TABLE ALTER DROP PRIMARY KEY FOREIGN REFERENCES INDEX VIEW').split(' ');

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function tokenize(src) {
    var tokens = [], i = 0, n = src.length;
    while (i < n) {
      var c = src[i];
      if (c === '-' && src[i + 1] === '-') {
        var j = src.indexOf('\n', i);
        tokens.push({ t: 'comment', v: src.slice(i, j < 0 ? n : j) });
        i = j < 0 ? n : j;
      } else if (c === '/' && src[i + 1] === '*') {
        var k = src.indexOf('*/', i + 2);
        k = k < 0 ? n : k + 2;
        tokens.push({ t: 'comment', v: src.slice(i, k) });
        i = k;
      } else if (c === "'" || c === '"' || c === '`') {
        var q = c, s = c, p = i + 1;
        while (p < n) {
          s += src[p];
          if (src[p] === q) { if (src[p + 1] === q) { s += q; p += 2; continue; } p++; break; }
          p++;
        }
        tokens.push({ t: 'string', v: s });
        i = p;
      } else if (/[\s]/.test(c)) {
        i++;
      } else if (/[(),;.=<>!+\-*/|]/.test(c)) {
        var two = src.substr(i, 2);
        if (['<=', '>=', '<>', '!=', '||'].indexOf(two) >= 0) { tokens.push({ t: 'sym', v: two }); i += 2; }
        else { tokens.push({ t: 'sym', v: c }); i++; }
      } else {
        var w = '', q2 = i;
        while (q2 < n && /[\w$]/.test(src[q2])) { w += src[q2]; q2++; }
        if (w) { tokens.push({ t: 'word', v: w }); i = q2; }
        else { tokens.push({ t: 'sym', v: c }); i++; }
      }
    }
    return tokens;
  }

  function peekWord(tokens, i) {
    var words = [];
    for (var j = i; j < tokens.length && words.length < 2; j++) {
      if (tokens[j].t === 'word') words.push(tokens[j].v.toUpperCase());
      else if (tokens[j].t !== 'comment') break;
    }
    return words;
  }

  function format(src, upper) {
    var tokens = tokenize(src), out = '', indent = 0, i = 0;
    function pad(extra) {
      var s = '\n';
      for (var k = 0; k < indent + (extra || 0); k++) s += '  ';
      return s;
    }
    function needSpace() { return out && !/[\s(]$/.test(out); }
    while (i < tokens.length) {
      var tk = tokens[i];
      if (tk.t === 'comment') { out += pad(0) + tk.v; i++; continue; }
      if (tk.t === 'string') { out += (needSpace() ? ' ' : '') + tk.v; i++; continue; }
      if (tk.t === 'sym') {
        if (tk.v === '(') { out += (needSpace() ? ' ' : '') + '('; indent++; i++; continue; }
        if (tk.v === ')') { indent = Math.max(0, indent - 1); out += pad(0) + ')'; i++; continue; }
        if (tk.v === ',') { out += ',' + pad(0); i++; continue; }
        if (tk.v === ';') { out += ';'; i++; continue; }
        out += (needSpace() ? ' ' : '') + tk.v;
        i++;
        continue;
      }
      // word: check two-word keywords first
      var words = peekWord(tokens, i);
      var two = words.length === 2 ? words[0] + ' ' + words[1] : null;
      var kw = null, consumed = 1;
      if (two && (CLAUSE.hasOwnProperty(two) || KEYWORDS.indexOf(two) >= 0)) { kw = two; consumed = 2; }
      else if (KEYWORDS.indexOf(words[0]) >= 0) { kw = words[0]; }
      if (kw && CLAUSE.hasOwnProperty(kw)) {
        out += pad(CLAUSE[kw] === 2 ? 1 : 0) + (upper ? kw : kw.toLowerCase());
        i += consumed;
        continue;
      }
      if (kw && JOINER.hasOwnProperty(kw)) {
        out += pad(1) + (upper ? kw : kw.toLowerCase());
        i += consumed;
        continue;
      }
      var wv = upper && KEYWORDS.indexOf(words[0]) >= 0 ? words[0] : tk.v;
      out += (needSpace() ? ' ' : '') + wv;
      i++;
    }
    return out.replace(/^\n/, '').replace(/[ \t]+\n/g, '\n').trim();
  }

  function run() {
    clear();
    var src = el(SLUG + '-input').value;
    if (!src.trim()) { fail('Paste some SQL first.'); return; }
    el(SLUG + '-output').value = format(src, el(SLUG + '-upper').checked);
  }

  try {
    TN.on(SLUG + '-format', 'click', run);
    TN.on(SLUG + '-sample', 'click', function () { el(SLUG + '-input').value = SAMPLE; clear(); run(); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
  } catch (e) { /* never throw on load */ }
})();
