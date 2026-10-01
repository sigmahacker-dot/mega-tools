/* PDF Text Compare — extract both PDFs via pdf.js, line-based LCS diff. */
(function () {
  'use strict';
  var SLUG = 'pdf-text-compare';
  var ERR = SLUG + '-error';
  var WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  var bufA = null, bufB = null;
  var nameA = '', nameB = '';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function ensureWorker() {
    try {
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
      }
    } catch (e) { /* ignore */ }
  }

  function extractText(buf) {
    return new Promise(function (resolve, reject) {
      ensureWorker();
      if (typeof pdfjsLib === 'undefined') { reject(new Error('engine-missing')); return; }
      pdfjsLib.getDocument({ data: buf }).promise.then(function (pdf) {
        var n = pdf.numPages;
        var parts = [];
        var chain = Promise.resolve();
        for (var i = 1; i <= n; i++) {
          (function (pageNum) {
            chain = chain.then(function () {
              return pdf.getPage(pageNum).then(function (page) {
                return page.getTextContent().then(function (tc) {
                  var lines = [];
                  var cur = '';
                  tc.items.forEach(function (it) {
                    cur += it.str;
                    if (it.hasEOL) { lines.push(cur); cur = ''; }
                    else cur += ' ';
                  });
                  if (cur.trim()) lines.push(cur);
                  parts.push(lines.join('\n'));
                });
              });
            });
          })(i);
        }
        chain.then(function () { resolve(parts.join('\n')); }).catch(reject);
      }).catch(reject);
    });
  }

  /* Line-based LCS diff. Returns ops: {t:' '|'-'|'+', a, b}. */
  function diffLines(a, b) {
    var n = a.length, m = b.length;
    /* cap the DP matrix to avoid blowups on huge docs */
    if (n * m > 4000000) return null;
    var dp = new Array(n + 1);
    for (var i = 0; i <= n; i++) dp[i] = new Array(m + 1).fill(0);
    for (i = n - 1; i >= 0; i--) {
      for (var j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var ops = [];
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { ops.push({ t: ' ', a: a[i], b: b[j] }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ t: '-', a: a[i], b: null }); i++; }
      else { ops.push({ t: '+', a: null, b: b[j] }); j++; }
    }
    while (i < n) { ops.push({ t: '-', a: a[i], b: null }); i++; }
    while (j < m) { ops.push({ t: '+', a: null, b: b[j] }); j++; }
    return ops;
  }

  function onFile(which) {
    return function (ev) {
      TN.clearErr(ERR);
      var f = ev.target.files && ev.target.files[0];
      if (!f) return;
      TN.readAsArrayBuffer(f).then(function (buf) {
        if (which === 'a') { bufA = buf; nameA = f.name; }
        else { bufB = buf; nameB = f.name; }
        updateInfo();
        TN.clearErr(ERR);
      }).catch(function () {
        TN.setErr(ERR, 'Could not read "' + f.name + '".');
      });
    };
  }

  function updateInfo() {
    var t = '';
    if (nameA) t += 'A: ' + nameA;
    if (nameB) t += (t ? ' · ' : '') + 'B: ' + nameB;
    $('info').textContent = t;
  }

  function onClear() {
    bufA = bufB = null; nameA = nameB = '';
    try { $('a').value = ''; $('b').value = ''; } catch (e) {}
    $('info').textContent = '';
    $('left').innerHTML = '';
    $('right').innerHTML = '';
    $('added').textContent = '0';
    $('removed').textContent = '0';
    $('same').textContent = '0';
    TN.hide(SLUG + '-stats');
    TN.clearErr(ERR);
  }

  function onGo() {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-stats');
    if (!bufA || !bufB) { TN.setErr(ERR, 'Upload both PDFs before comparing.'); return; }
    if (typeof pdfjsLib === 'undefined') {
      TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    var btn = $('go');
    btn.disabled = true;
    $('info').textContent = 'Extracting text from both PDFs…';
    Promise.all([extractText(bufA), extractText(bufB)]).then(function (texts) {
      var linesA = texts[0].split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length; });
      var linesB = texts[1].split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length; });
      if (!linesA.length && !linesB.length) {
        TN.setErr(ERR, 'No text found in either PDF — they may be scanned images.');
        updateInfo();
        btn.disabled = false;
        return;
      }
      var ops = diffLines(linesA, linesB);
      if (!ops) {
        TN.setErr(ERR, 'Documents are too large to diff line-by-line.');
        updateInfo();
        btn.disabled = false;
        return;
      }
      var left = [], right = [];
      var added = 0, removed = 0, same = 0;
      ops.forEach(function (op) {
        if (op.t === ' ') {
          same++;
          left.push('<span>' + esc(trunc(op.a)) + '</span>');
          right.push('<span>' + esc(trunc(op.b)) + '</span>');
        } else if (op.t === '-') {
          removed++;
          left.push('<span style="background:#fee2e2;color:#991b1b">' + esc(trunc(op.a)) + '</span>');
        } else {
          added++;
          right.push('<span style="background:#dcfce7;color:#166534">' + esc(trunc(op.b)) + '</span>');
        }
      });
      $('left').innerHTML = left.join('\n') || '<span class="muted">(empty)</span>';
      $('right').innerHTML = right.join('\n') || '<span class="muted">(empty)</span>';
      $('added').textContent = added;
      $('removed').textContent = removed;
      $('same').textContent = same;
      TN.show(SLUG + '-stats');
      updateInfo();
      TN.clearErr(ERR);
      btn.disabled = false;
    }).catch(function (e) {
      updateInfo();
      btn.disabled = false;
      TN.setErr(ERR, e && e.message === 'engine-missing'
        ? 'PDF engine failed to load. Check your connection and reload the page.'
        : 'Could not extract text. The PDF may be encrypted or corrupted.');
    });
  }

  function trunc(s) {
    return s.length > 300 ? s.slice(0, 300) + '…' : s;
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      TN.on(SLUG + '-a', 'change', onFile('a'));
      TN.on(SLUG + '-b', 'change', onFile('b'));
      TN.on(SLUG + '-go', 'click', onGo);
      TN.on(SLUG + '-clear', 'click', onClear);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
