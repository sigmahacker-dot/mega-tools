/* LinkedIn Text Formatter — Mathematical Alphanumeric Symbols mapping. */
(function () {
  'use strict';

  var SLUG = 'linkedin-text-formatter';

  // [upperBase, lowerBase, digitBase] code points; digitBase null => keep plain digits.
  var STYLES = [
    { name: '𝐁𝐨𝐥𝐝', map: [0x1D400, 0x1D41A, 0x1D7CE] },
    { name: '𝐼𝑡𝑎𝑙𝑖𝑐', map: [0x1D434, 0x1D44E, null] },
    { name: '𝐁𝐨𝐥𝐝 𝐼𝑡𝑎𝑙𝑖𝑐', map: [0x1D468, 0x1D482, 0x1D7CE] },
    { name: '𝗕𝗼𝗹𝗱 𝘀𝗮𝗻𝘀', map: [0x1D5D4, 0x1D5EE, 0x1D7EC] },
    { name: '𝘐𝘵𝘢𝘭𝘪𝘤 𝘴𝘢𝘯𝘴', map: [0x1D608, 0x1D622, null] }
  ];

  function errId() { return SLUG + '-error'; }

  function convert(text, map) {
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      var cp = null;
      if (c >= 65 && c <= 90) cp = map[0] + (c - 65);
      else if (c >= 97 && c <= 122) cp = map[1] + (c - 97);
      else if (c >= 48 && c <= 57 && map[2] !== null) cp = map[2] + (c - 48);
      out += cp === null ? text.charAt(i) : String.fromCodePoint(cp);
    }
    return out;
  }

  function update() {
    TN.clearErr(errId());
    var inEl = TN.el(SLUG + '-input');
    var text = inEl ? inEl.value : '';
    var wrap = TN.el(SLUG + '-outputs');
    if (!wrap) return;
    if (!text) { wrap.innerHTML = '<p class="muted">Type something above to see styled versions.</p>'; return; }
    var html = '';
    STYLES.forEach(function (st, i) {
      var styled = convert(text, st.map);
      html += '<div class="field" style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;">'
        + '<label>' + TN.esc(st.name) + '</label>'
        + '<p style="font-size:18px;white-space:pre-wrap;word-break:break-word;margin:0 0 8px;" id="' + SLUG + '-o' + i + '">' + TN.esc(styled) + '</p>'
        + '<button type="button" class="btn btn-sm btn-outline" data-i="' + i + '">Copy</button>'
        + '</div>';
    });
    wrap.innerHTML = html;
    var btns = wrap.querySelectorAll('button[data-i]');
    Array.prototype.forEach.call(btns, function (btn) {
      TN.on(btn, 'click', function () {
        var i = parseInt(btn.getAttribute('data-i'), 10);
        var el = TN.el(SLUG + '-o' + i);
        var val = el ? el.textContent : '';
        if (!val) return;
        TN.clearErr(errId());
        TN.copy(val).then(function (ok) {
          if (ok) { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy'; }, 1200); }
          else TN.setErr(errId(), 'Copy failed — select the text manually and press Ctrl+C.');
        });
      });
    });
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var deb = TN.debounce(update, 150);
      var inEl = TN.el(SLUG + '-input');
      if (inEl) TN.on(inEl, 'input', deb);
      update();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();