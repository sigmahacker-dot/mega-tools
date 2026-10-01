/* Changelog Generator — version + categorized entries → Keep-a-Changelog markdown. */
(function () {
  'use strict';
  var SLUG = 'changelog-generator';
  var CATS = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function addRow(cat, text) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:8px;margin-bottom:8px';
    var sel = document.createElement('select');
    sel.className = 'input';
    sel.style.maxWidth = '150px';
    sel.setAttribute('aria-label', 'Change category');
    CATS.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c; o.textContent = c;
      if (c === (cat || 'Added')) o.selected = true;
      sel.appendChild(o);
    });
    var inp = document.createElement('input');
    inp.className = 'input';
    inp.placeholder = 'Describe the change…';
    inp.value = text || '';
    inp.setAttribute('aria-label', 'Change description');
    var rm = document.createElement('button');
    rm.className = 'btn btn-outline'; rm.textContent = '✕';
    rm.setAttribute('aria-label', 'Remove entry');
    rm.addEventListener('click', function () { wrap.remove(); });
    wrap.appendChild(sel); wrap.appendChild(inp); wrap.appendChild(rm);
    el(SLUG + '-rows').appendChild(wrap);
  }

  function generate() {
    clear();
    var version = el(SLUG + '-version').value.trim();
    if (!version) { fail('Enter a version number.'); return; }
    var date = el(SLUG + '-date').value || new Date().toISOString().slice(0, 10);
    var rows = el(SLUG + '-rows').children;
    var byCat = {};
    for (var i = 0; i < rows.length; i++) {
      var sel = rows[i].querySelector('select');
      var inp = rows[i].querySelector('input');
      var t = inp.value.trim();
      if (!t) continue;
      (byCat[sel.value] = byCat[sel.value] || []).push(t);
    }
    var used = CATS.filter(function (c) { return byCat[c] && byCat[c].length; });
    if (!used.length) { fail('Add at least one change entry.'); return; }
    var md = '# Changelog\n\n' +
      'All notable changes to this project will be documented in this file.\n\n' +
      'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),\n' +
      'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n' +
      '## [Unreleased]\n\n' +
      '## [' + version + '] - ' + date + '\n';
    used.forEach(function (c) {
      md += '\n### ' + c + '\n\n';
      byCat[c].forEach(function (t) { md += '- ' + t + '\n'; });
    });
    el(SLUG + '-output').value = md;
  }

  try {
    el(SLUG + '-date').value = new Date().toISOString().slice(0, 10);
    TN.on(SLUG + '-add', 'click', function () { addRow('Added', ''); });
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a changelog first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a changelog first.'); return; }
      TN.downloadText(v, 'CHANGELOG.md', 'text/markdown');
    });
    addRow('Added', 'Dark mode toggle');
    addRow('Fixed', 'Login redirect loop on expired sessions');
  } catch (e) { /* never throw on load */ }
})();
