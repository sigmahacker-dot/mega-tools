/* .env.example Generator — strips values, keeps keys, comments, and structure. */
(function () {
  'use strict';
  var SLUG = 'env-example-generator';
  var SAMPLE = '# App config\nAPP_NAME=MyApp\nAPP_ENV=production\n# Database\nDB_HOST=db.internal\nDB_PORT=5432\nDB_PASSWORD="s3cr3t p@ss"\nexport API_KEY=sk-live-abc123 # keep me secret\nEMPTY=\nDEBUG=false';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  // Split a line into [valuePart, commentPart], respecting quotes.
  function splitInlineComment(s) {
    var sq = false, dq = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "'" && !dq) sq = !sq;
      else if (c === '"' && !sq) dq = !dq;
      else if (c === '#' && !sq && !dq && (i === 0 || /\s/.test(s[i - 1]))) {
        return [s.slice(0, i).replace(/\s+$/, ''), s.slice(i)];
      }
    }
    return [s, ''];
  }

  function generate() {
    clear();
    var src = el(SLUG + '-input').value;
    if (!src.trim()) { fail('Paste your .env contents first.'); return; }
    var lines = src.split(/\r?\n/), out = [], inMultiline = false, quote = null;
    lines.forEach(function (raw) {
      if (inMultiline) {
        // consume until closing quote, then strip the whole value
        var idx = raw.indexOf(quote);
        if (idx >= 0) {
          var rest = raw.slice(idx + 1);
          var parts = splitInlineComment(rest);
          out[out.length - 1] += (parts[1] ? ' ' + parts[1] : '');
          inMultiline = false;
        }
        return;
      }
      var trimmed = raw.trim();
      if (trimmed === '' || trimmed[0] === '#') { out.push(raw); return; }
      var body = raw, prefix = '';
      var m = /^(\s*(?:export\s+)?)([\w.]+)\s*=\s*(.*)$/.exec(raw);
      if (!m) { out.push(raw); return; } // not a KEY=value line — keep as-is
      prefix = m[1];
      var key = m[2], val = m[3];
      var parts = splitInlineComment(val);
      var v = parts[0].trim(), comment = parts[1];
      // detect unterminated multiline quote
      var dqCount = (v.match(/(^|[^\\])"/g) || []).length;
      var sqCount = (v.match(/(^|[^\\])'/g) || []).length;
      if ((v[0] === '"' && dqCount % 2 === 1) || (v[0] === "'" && sqCount % 2 === 1)) {
        inMultiline = true;
        quote = v[0];
        out.push(prefix + key + '=');
        return;
      }
      out.push(prefix + key + '=' + (comment ? ' ' + comment : ''));
    });
    el(SLUG + '-output').value = out.join('\n');
  }

  try {
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-sample', 'click', function () { el(SLUG + '-input').value = SAMPLE; clear(); generate(); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the example file first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the example file first.'); return; }
      TN.downloadText(v, '.env.example', 'text/plain');
    });
  } catch (e) { /* never throw on load */ }
})();
