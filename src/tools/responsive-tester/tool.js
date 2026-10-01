/* Responsive Tester — URL (https:// normalized) → iframe with width presets + custom size. */
(function () {
  'use strict';
  var SLUG = 'responsive-tester';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function normalize(url) {
    url = url.trim();
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) url = 'https://' + url;
    return url;
  }

  function setSize(w, h) {
    var f = el(SLUG + '-frame');
    f.style.width = w + 'px';
    f.style.height = h + 'px';
    el(SLUG + '-dims').textContent = w + ' × ' + h;
  }

  function load() {
    clear();
    var raw = el(SLUG + '-url').value;
    if (!raw.trim()) { fail('Enter a URL to preview.'); return; }
    var url = normalize(raw);
    try { new URL(url); } catch (e) { fail('That URL does not look valid.'); return; }
    el(SLUG + '-frame').src = url;
    el(SLUG + '-site').textContent = url;
    var w = parseInt(el(SLUG + '-w').value, 10) || 390;
    var h = parseInt(el(SLUG + '-h').value, 10) || 844;
    setSize(w, h);
    TN.show(SLUG + '-result');
  }

  try {
    TN.on(SLUG + '-load', 'click', load);
    TN.on(SLUG + '-apply', 'click', function () {
      var w = parseInt(el(SLUG + '-w').value, 10) || 390;
      var h = parseInt(el(SLUG + '-h').value, 10) || 844;
      setSize(w, h);
    });
    var presets = document.querySelectorAll('[data-w]');
    for (var i = 0; i < presets.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          el(SLUG + '-w').value = b.getAttribute('data-w');
          el(SLUG + '-h').value = b.getAttribute('data-h');
          setSize(parseInt(b.getAttribute('data-w'), 10), parseInt(b.getAttribute('data-h'), 10));
        });
      })(presets[i]);
    }
  } catch (e) { /* never throw on load */ }
})();
