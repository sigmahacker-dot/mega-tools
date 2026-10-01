/* Punycode Converter — RFC 3492 encode/decode implemented locally, self-tested. */
(function () {
  'use strict';
  var SLUG = 'punycode-converter';
  var maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700;
  var initialBias = 72, initialN = 128, delimiter = '-';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function ucs2decode(s) {
    var out = [], i = 0;
    while (i < s.length) {
      var c = s.charCodeAt(i++);
      if (c >= 0xD800 && c <= 0xDBFF && i < s.length) {
        var d = s.charCodeAt(i);
        if (d >= 0xDC00 && d <= 0xDFFF) { out.push(((c - 0xD800) * 0x400) + (d - 0xDC00) + 0x10000); i++; continue; }
      }
      out.push(c);
    }
    return out;
  }
  function ucs2encode(arr) {
    var s = '';
    for (var i = 0; i < arr.length; i++) {
      var v = arr[i];
      if (v > 0xFFFF) { v -= 0x10000; s += String.fromCharCode((v >> 10) + 0xD800, (v % 0x400) + 0xDC00); }
      else s += String.fromCharCode(v);
    }
    return s;
  }
  function digitToBasic(d, flag) {
    return d + 22 + 75 * (d < 26 ? 1 : 0) - ((flag !== 0 ? 1 : 0) << 5);
  }
  function basicToDigit(cp) {
    if (cp - 48 < 10) return cp - 22;
    if (cp - 65 < 26) return cp - 65;
    if (cp - 97 < 26) return cp - 97;
    return base;
  }
  function adapt(delta, numPoints, firstTime) {
    var k = 0;
    delta = firstTime ? Math.floor(delta / damp) : (delta >> 1);
    delta += Math.floor(delta / numPoints);
    for (; delta > (((base - tMin) * tMax) >> 1); k += base) delta = Math.floor(delta / (base - tMin));
    return Math.floor(k + ((base - tMin + 1) * delta) / (delta + skew));
  }
  function encodeLabel(input) {
    var output = [], n = initialN, delta = 0, bias = initialBias, h, b, j, m, q, k, t;
    var cps = ucs2decode(input);
    for (j = 0; j < cps.length; j++) if (cps[j] < 0x80) output.push(String.fromCharCode(cps[j]));
    h = b = output.length;
    if (b > 0) output.push(delimiter);
    while (h < cps.length) {
      m = maxInt;
      for (j = 0; j < cps.length; j++) { var c = cps[j]; if (c >= n && c < m) m = c; }
      if (m - n > Math.floor((maxInt - delta) / (h + 1))) throw new Error('Overflow.');
      delta += (m - n) * (h + 1);
      n = m;
      for (j = 0; j < cps.length; j++) {
        c = cps[j];
        if (c < n) { if (++delta > maxInt) throw new Error('Overflow.'); }
        if (c === n) {
          q = delta;
          for (k = base; ; k += base) {
            t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
            if (q < t) break;
            output.push(String.fromCharCode(digitToBasic(t + ((q - t) % (base - t)), 0)));
            q = Math.floor((q - t) / (base - t));
          }
          output.push(String.fromCharCode(digitToBasic(q, 0)));
          bias = adapt(delta, h + 1, h === b);
          delta = 0;
          h++;
        }
      }
      delta++; n++;
    }
    return output.join('');
  }
  function decodeLabel(input) {
    var output = [], n = initialN, i = 0, bias = initialBias, j, index, oldi, w, k, digit, t;
    var basic = input.lastIndexOf(delimiter);
    if (basic < 0) basic = 0;
    for (j = 0; j < basic; j++) {
      if (input.charCodeAt(j) >= 0x80) throw new Error('Non-basic code point.');
      output.push(input.charCodeAt(j));
    }
    index = basic > 0 ? basic + 1 : 0;
    while (index < input.length) {
      oldi = i; w = 1;
      for (k = base; ; k += base) {
        if (index >= input.length) throw new Error('Invalid input.');
        digit = basicToDigit(input.charCodeAt(index++));
        if (digit >= base || digit > Math.floor((maxInt - i) / w)) throw new Error('Overflow.');
        i += digit * w;
        t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
        if (digit < t) break;
        if (w > Math.floor(maxInt / (base - t))) throw new Error('Overflow.');
        w *= base - t;
      }
      var out = output.length + 1;
      bias = adapt(i - oldi, out, oldi === 0);
      if (Math.floor(i / out) > maxInt - n) throw new Error('Overflow.');
      n += Math.floor(i / out);
      i %= out;
      output.splice(i++, 0, n);
    }
    return ucs2encode(output);
  }
  function toASCII(domain) {
    return domain.split('.').map(function (label) {
      return /[^\x00-\x7F]/.test(label) ? 'xn--' + encodeLabel(label) : label;
    }).join('.');
  }
  function toUnicode(domain) {
    return domain.split('.').map(function (label) {
      return /^xn--/i.test(label) ? decodeLabel(label.slice(4).toLowerCase()) : label;
    }).join('.');
  }

  function convert(dir) {
    clear();
    var v = el(SLUG + '-input').value.trim();
    if (!v) { fail('Enter a domain or label.'); return; }
    try {
      el(SLUG + '-output').value = dir === 'encode' ? toASCII(v.toLowerCase()) : toUnicode(v);
    } catch (e) {
      fail('Conversion failed: ' + e.message);
    }
  }

  try {
    if (!el(SLUG + '-encode')) return;
    var st = el(SLUG + '-selftest');
    try {
      var ok = encodeLabel('münchen') === 'xn--mnchen-3ya'.slice(4) &&
               decodeLabel('mnchen-3ya') === 'münchen' &&
               toASCII('münchen.de') === 'xn--mnchen-3ya.de' &&
               toUnicode('xn--mnchen-3ya.de') === 'münchen.de';
      st.textContent = 'Self-test: ' + (ok ? 'PASS' : 'FAIL') + ' — verified "münchen" ↔ "xn--mnchen-3ya".';
      st.style.color = ok ? '#4ade80' : '#f87171';
    } catch (e) {
      st.textContent = 'Self-test: FAIL — ' + e.message;
      st.style.color = '#f87171';
    }
    TN.on(SLUG + '-encode', 'click', function () { convert('encode'); });
    TN.on(SLUG + '-decode', 'click', function () { convert('decode'); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Convert something first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Convert something first.'); return; }
      TN.downloadText(v + '\n', 'punycode.txt', 'text/plain');
    });
    convert('encode');
  } catch (e) { /* never throw on load */ }
})();
