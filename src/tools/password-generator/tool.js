(function () {
  'use strict';
  var S = 'password-generator';
  var AMBIGUOUS = '0OlI1';
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function charset() {
    var c = '';
    if (TN.el(S + '-upper').checked) c += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (TN.el(S + '-lower').checked) c += 'abcdefghijklmnopqrstuvwxyz';
    if (TN.el(S + '-numbers').checked) c += '0123456789';
    if (TN.el(S + '-symbols').checked) c += '!@#$%^&*()-_=+[]{};:,.<>?/~';
    if (TN.el(S + '-ambiguous').checked) {
      c = c.split('').filter(function (ch) { return AMBIGUOUS.indexOf(ch) < 0; }).join('');
    }
    return c;
  }
  function randInt(max) {
    var buf = new Uint32Array(1);
    var limit = Math.floor(0xFFFFFFFF / max) * max;
    var x;
    do { window.crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
    return x % max;
  }
  function makeOne(len) {
    var cs = charset();
    if (!cs) return null;
    var out = '';
    for (var i = 0; i < len; i++) out += cs.charAt(randInt(cs.length));
    return out;
  }
  function currentLen() {
    var n = parseInt(TN.el(S + '-length').value, 10);
    return (n >= 8 && n <= 64) ? n : 16;
  }
  function strength(pw) {
    var cs = charset().length;
    if (!cs || !pw) return null;
    var entropy = pw.length * (Math.log(cs) / Math.log(2));
    var pct = Math.min(100, Math.round(entropy / 128 * 100));
    var label = entropy < 40 ? 'Weak' : entropy < 60 ? 'Fair' : entropy < 80 ? 'Good' : 'Strong';
    return { entropy: Math.round(entropy), pct: pct, label: label };
  }
  function show(pw) {
    TN.clearErr(S + '-error');
    if (pw === null) { TN.setErr(S + '-error', 'Please select at least one character set.'); return; }
    TN.el(S + '-output').textContent = pw;
    TN.show(S + '-result');
    var st = strength(pw);
    if (st) {
      TN.show(S + '-strength-wrap');
      TN.el(S + '-strength-bar').style.width = st.pct + '%';
      TN.el(S + '-strength-label').textContent = st.label;
      TN.el(S + '-entropy').textContent = '≈ ' + st.entropy + ' bits of entropy';
    }
  }
  on(S + '-length', 'input', function () {
    try { TN.el(S + '-length-val').textContent = currentLen(); } catch (e) {}
  });
  on(S + '-generate', 'click', function () { show(makeOne(currentLen())); });
  on(S + '-regen', 'click', function () { show(makeOne(currentLen())); });
  on(S + '-copy', 'click', function () {
    try {
      var pw = TN.el(S + '-output').textContent;
      if (!pw) { TN.setErr(S + '-error', 'Generate a password first.'); return; }
      TN.copy(pw).then(function () { TN.clearErr(S + '-error'); }, function () {
        TN.setErr(S + '-error', 'Copy failed — please copy manually.');
      });
    } catch (e) {}
  });
  on(S + '-bulk', 'click', function () {
    try {
      var list = TN.el(S + '-bulk-list');
      list.innerHTML = '';
      var frag = document.createDocumentFragment();
      for (var i = 0; i < 10; i++) {
        var pw = makeOne(currentLen());
        if (pw === null) { TN.setErr(S + '-error', 'Please select at least one character set.'); return; }
        var row = document.createElement('div');
        row.className = 'copy-row';
        var code = document.createElement('code');
        code.style.wordBreak = 'break-all';
        code.textContent = pw;
        var btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-outline';
        btn.textContent = 'Copy';
        (function (p) {
          btn.addEventListener('click', function () {
            TN.copy(p).catch(function () { TN.setErr(S + '-error', 'Copy failed — please copy manually.'); });
          });
        })(pw);
        row.appendChild(code);
        row.appendChild(btn);
        frag.appendChild(row);
      }
      list.appendChild(frag);
      TN.show(S + '-bulk-list');
    } catch (e) {}
  });
  // Auto-generate one on load for instant value
  try { show(makeOne(currentLen())); } catch (e) {}
})();
