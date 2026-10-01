/* HTTP Client Snippet Generator — method/URL/headers/body → fetch, axios, cURL, Python snippets. */
(function () {
  'use strict';
  var SLUG = 'http-client-snippet-generator';
  var tab = 'fetch';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseHeaders(text) {
    var out = [];
    text.split('\n').forEach(function (l) {
      var i = l.indexOf(':');
      if (i > 0) out.push([l.slice(0, i).trim(), l.slice(i + 1).trim()]);
    });
    return out;
  }
  function jsStr(s) { return JSON.stringify(s); }
  function shStr(s) { return "'" + s.replace(/'/g, "'\\''") + "'"; }
  function pyStr(s) {
    return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  }
  function pyRepr(v, ind) {
    ind = ind || 0;
    function padN(n) { var s = ''; for (var i = 0; i < n; i++) s += '    '; return s; }
    if (v === null) return 'None';
    if (v === true) return 'True';
    if (v === false) return 'False';
    if (typeof v === 'string') return pyStr(v);
    if (typeof v === 'number') return String(v);
    if (Array.isArray(v)) {
      if (!v.length) return '[]';
      return '[\n' + v.map(function (x) { return padN(ind + 1) + pyRepr(x, ind + 1); }).join(',\n') +
        '\n' + padN(ind) + ']';
    }
    if (typeof v === 'object') {
      var ks = Object.keys(v);
      if (!ks.length) return '{}';
      return '{\n' + ks.map(function (k) { return padN(ind + 1) + pyStr(k) + ': ' + pyRepr(v[k], ind + 1); }).join(',\n') +
        '\n' + padN(ind) + '}';
    }
    return 'None';
  }

  function snippets() {
    var method = el(SLUG + '-method').value;
    var url = el(SLUG + '-url').value.trim();
    var headers = parseHeaders(el(SLUG + '-headers').value);
    var body = el(SLUG + '-body').value;
    var hasBody = body.trim().length > 0 && method !== 'GET' && method !== 'HEAD';
    var bodyJson = null;
    if (hasBody) { try { bodyJson = JSON.parse(body); } catch (e) { bodyJson = null; } }

    var hdrObj = headers.map(function (h) { return '  ' + jsStr(h[0]) + ': ' + jsStr(h[1]); }).join(',\n');
    var fetchBody = hasBody ? ',\n  body: ' + jsStr(bodyJson !== null ? JSON.stringify(bodyJson) : body) : '';
    var fetch =
      'fetch(' + jsStr(url) + ', {\n  method: ' + jsStr(method) +
      (headers.length ? ',\n  headers: {\n' + hdrObj + '\n  }' : '') + fetchBody + '\n})\n' +
      '  .then(async (res) => {\n    console.log(res.status);\n    console.log(await res.text());\n  })\n  .catch(console.error);';

    var axiosCfg = '{\n  method: ' + jsStr(method.toLowerCase()) + ',\n  url: ' + jsStr(url) +
      (headers.length ? ',\n  headers: {\n' + hdrObj + '\n  }' : '') +
      (hasBody ? (bodyJson !== null ? ',\n  data: ' + JSON.stringify(bodyJson, null, 2).split('\n').join('\n  ') : ',\n  data: ' + jsStr(body)) : '') +
      '\n}';
    var axios = 'axios(' + axiosCfg + ')\n  .then((res) => {\n    console.log(res.status);\n    console.log(res.data);\n  })\n  .catch(console.error);';

    var curl = 'curl -X ' + method + ' ' + shStr(url) +
      headers.map(function (h) { return ' \\\n  -H ' + shStr(h[0] + ': ' + h[1]); }).join('') +
      (hasBody ? ' \\\n  -d ' + shStr(bodyJson !== null ? JSON.stringify(bodyJson) : body) : '');

    var pyHdr = headers.map(function (h) { return '    ' + pyStr(h[0]) + ': ' + pyStr(h[1]); }).join(',\n');
    var python = 'import requests\n\n' +
      (headers.length ? 'headers = {\n' + pyHdr + '\n}\n\n' : '') +
      (hasBody && bodyJson !== null ? 'payload = ' + pyRepr(bodyJson, 0) + '\n\n' : '') +
      'response = requests.' + method.toLowerCase() + '(\n    ' + pyStr(url) +
      (headers.length ? ',\n    headers=headers' : '') +
      (hasBody ? (bodyJson !== null ? ',\n    json=payload' : ',\n    data=' + pyStr(body)) : '') +
      '\n)\nprint(response.status_code)\nprint(response.text)';

    return { fetch: fetch, axios: axios, curl: curl, python: python, url: url };
  }

  function update() {
    clear();
    var s = snippets();
    if (!s.url) { fail('Enter a URL.'); el(SLUG + '-output').value = ''; return; }
    el(SLUG + '-output').value = s[tab];
    var btns = TN.qsa('#' + SLUG + '-tabs button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.getAttribute('data-tab') === tab) b.classList.remove('btn-outline');
      else b.classList.add('btn-outline');
    }
  }

  try {
    if (!el(SLUG + '-method')) return;
    ['method', 'url', 'headers', 'body'].forEach(function (k) {
      TN.on(SLUG + '-' + k, k === 'method' ? 'change' : 'input', update);
    });
    var btns = TN.qsa('#' + SLUG + '-tabs button');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); update(); });
      })(btns[i]);
    }
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var s = snippets();
      if (!s.url) { fail('Enter a URL first.'); return; }
      var all = '// fetch\n' + s.fetch + '\n\n// axios\n' + s.axios + '\n\n# cURL\n' + s.curl + '\n\n# Python requests\n' + s.python + '\n';
      TN.downloadText(all, 'http-snippets.txt', 'text/plain');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
