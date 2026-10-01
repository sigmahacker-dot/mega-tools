/* Query String Parser — query string → decoded key/value table + JSON. */
(function () {
  'use strict';
  var SLUG = 'query-string-parser';
  var SAMPLE = 'https://shop.example.com/search?q=wireless%20headphones&tag=audio&tag=bluetooth&price_min=50&in_stock=true&note=free+shipping';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function safeDecode(s) {
    try { return { value: decodeURIComponent(s.replace(/\+/g, ' ')), bad: false }; }
    catch (e) { return { value: s, bad: true }; }
  }

  function parse() {
    clear();
    TN.hide(SLUG + '-result');
    var src = el(SLUG + '-input').value.trim();
    if (!src) { fail('Paste a URL or query string first.'); return; }
    var q = src;
    var hash = q.indexOf('#');
    if (hash >= 0) q = q.slice(0, hash);
    var qi = q.indexOf('?');
    if (qi >= 0) q = q.slice(qi + 1);
    if (!q) { fail('No query string found.'); return; }

    var pairs = q.split('&'), rows = [], merged = {}, bad = 0;
    pairs.forEach(function (p, i) {
      if (p === '') return;
      var eq = p.indexOf('=');
      var rk = eq < 0 ? p : p.slice(0, eq);
      var rv = eq < 0 ? '' : p.slice(eq + 1);
      var k = safeDecode(rk), v = safeDecode(rv);
      if (k.bad || v.bad) bad++;
      rows.push({ n: i + 1, key: k.value, value: v.value, bad: k.bad || v.bad });
      if (merged.hasOwnProperty(k.value)) {
        if (!Array.isArray(merged[k.value])) merged[k.value] = [merged[k.value]];
        merged[k.value].push(v.value);
      } else {
        merged[k.value] = v.value;
      }
    });
    if (!rows.length) { fail('No parameters found.'); return; }

    var tb = el(SLUG + '-table').querySelector('tbody');
    tb.innerHTML = '';
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      var tdN = document.createElement('td'); tdN.textContent = r.n;
      var tdK = document.createElement('td'); tdK.textContent = r.key;
      var tdV = document.createElement('td'); tdV.textContent = r.value;
      if (r.bad) { tr.title = 'Malformed percent-encoding — raw value kept'; tr.style.background = 'rgba(255,0,0,0.06)'; }
      tr.appendChild(tdN); tr.appendChild(tdK); tr.appendChild(tdV);
      tb.appendChild(tr);
    });
    el(SLUG + '-json').textContent = JSON.stringify(merged, null, 2);
    if (bad) fail('Warning: ' + bad + ' parameter(s) had malformed percent-encoding; raw values were kept.');
    TN.show(SLUG + '-result');
  }

  try {
    TN.on(SLUG + '-parse', 'click', parse);
    TN.on(SLUG + '-sample', 'click', function () { el(SLUG + '-input').value = SAMPLE; clear(); parse(); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-json').textContent;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
  } catch (e) { /* never throw on load */ }
})();
