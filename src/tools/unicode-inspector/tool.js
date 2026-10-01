(function () {
  'use strict';
  var ERR = 'unicode-inspector-error';
  var BLOCKS = [
    [0x0000, 0x007F, 'Basic Latin'], [0x0080, 0x00FF, 'Latin-1 Supplement'],
    [0x0100, 0x017F, 'Latin Extended-A'], [0x0180, 0x024F, 'Latin Extended-B'],
    [0x0250, 0x02AF, 'IPA Extensions'], [0x02B0, 0x02FF, 'Spacing Modifier Letters'],
    [0x0300, 0x036F, 'Combining Diacritical Marks'], [0x0370, 0x03FF, 'Greek and Coptic'],
    [0x0400, 0x04FF, 'Cyrillic'], [0x0500, 0x052F, 'Cyrillic Supplement'],
    [0x0530, 0x058F, 'Armenian'], [0x0590, 0x05FF, 'Hebrew'],
    [0x0600, 0x06FF, 'Arabic'], [0x0700, 0x074F, 'Syriac'],
    [0x0750, 0x077F, 'Arabic Supplement'], [0x0780, 0x07BF, 'Thaana'],
    [0x0900, 0x097F, 'Devanagari'], [0x0980, 0x09FF, 'Bengali'],
    [0x0A00, 0x0A7F, 'Gurmukhi'], [0x0A80, 0x0AFF, 'Gujarati'],
    [0x0E00, 0x0E7F, 'Thai'], [0x0E80, 0x0EFF, 'Lao'],
    [0x1E00, 0x1EFF, 'Latin Extended Additional'], [0x2000, 0x206F, 'General Punctuation'],
    [0x2070, 0x209F, 'Superscripts and Subscripts'], [0x20A0, 0x20CF, 'Currency Symbols'],
    [0x20D0, 0x20FF, 'Combining Diacritical Marks for Symbols'],
    [0x2100, 0x214F, 'Letterlike Symbols'], [0x2150, 0x218F, 'Number Forms'],
    [0x2190, 0x21FF, 'Arrows'], [0x2200, 0x22FF, 'Mathematical Operators'],
    [0x2300, 0x23FF, 'Miscellaneous Technical'], [0x2400, 0x243F, 'Control Pictures'],
    [0x2440, 0x245F, 'Optical Character Recognition'], [0x2460, 0x24FF, 'Enclosed Alphanumerics'],
    [0x2500, 0x257F, 'Box Drawing'], [0x2580, 0x259F, 'Block Elements'],
    [0x25A0, 0x25FF, 'Geometric Shapes'], [0x2600, 0x26FF, 'Miscellaneous Symbols'],
    [0x2700, 0x27BF, 'Dingbats'], [0x27C0, 0x27EF, 'Miscellaneous Mathematical Symbols-A'],
    [0x27F0, 0x27FF, 'Supplemental Arrows-A'], [0x2800, 0x28FF, 'Braille Patterns'],
    [0x2C00, 0x2C5F, 'Glagolitic'], [0x2E80, 0x2EFF, 'CJK Radicals Supplement'],
    [0x2F00, 0x2FDF, 'Kangxi Radicals'], [0x2FF0, 0x2FFF, 'Ideographic Description Characters'],
    [0x3000, 0x303F, 'CJK Symbols and Punctuation'], [0x3040, 0x309F, 'Hiragana'],
    [0x30A0, 0x30FF, 'Katakana'], [0x3100, 0x312F, 'Bopomofo'],
    [0x3130, 0x318F, 'Hangul Compatibility Jamo'], [0x3190, 0x319F, 'Kanbun'],
    [0x31A0, 0x31BF, 'Bopomofo Extended'], [0x31C0, 0x31EF, 'CJK Strokes'],
    [0x31F0, 0x31FF, 'Katakana Phonetic Extensions'], [0x3200, 0x32FF, 'Enclosed CJK Letters and Months'],
    [0x3300, 0x33FF, 'CJK Compatibility'], [0x3400, 0x4DBF, 'CJK Unified Ideographs Extension A'],
    [0x4E00, 0x9FFF, 'CJK Unified Ideographs'], [0xA000, 0xA48F, 'Yi Syllables'],
    [0xAC00, 0xD7AF, 'Hangul Syllables'], [0xD800, 0xDFFF, 'Surrogates (not characters)'],
    [0xE000, 0xF8FF, 'Private Use Area'], [0xF900, 0xFAFF, 'CJK Compatibility Ideographs'],
    [0xFB00, 0xFB4F, 'Alphabetic Presentation Forms'], [0xFB50, 0xFDFF, 'Arabic Presentation Forms-A'],
    [0xFE00, 0xFE0F, 'Variation Selectors'], [0xFE20, 0xFE2F, 'Combining Half Marks'],
    [0xFE30, 0xFE4F, 'CJK Compatibility Forms'], [0xFE50, 0xFE6F, 'Small Form Variants'],
    [0xFE70, 0xFEFF, 'Arabic Presentation Forms-B'], [0xFF00, 0xFFEF, 'Halfwidth and Fullwidth Forms'],
    [0xFFF0, 0xFFFF, 'Specials'], [0x10000, 0x1007F, 'Linear B Syllabary'],
    [0x1D400, 0x1D7FF, 'Mathematical Alphanumeric Symbols'],
    [0x1F000, 0x1F0FF, 'Mahjong Tiles'], [0x1F100, 0x1F1FF, 'Enclosed Alphanumeric Supplement'],
    [0x1F200, 0x1F2FF, 'Enclosed Ideographic Supplement'],
    [0x1F300, 0x1F5FF, 'Miscellaneous Symbols and Pictographs'],
    [0x1F600, 0x1F64F, 'Emoticons'], [0x1F650, 0x1F67F, 'Ornamental Dingbats'],
    [0x1F680, 0x1F6FF, 'Transport and Map Symbols'],
    [0x1F700, 0x1F77F, 'Alchemical Symbols'], [0x1F900, 0x1F9FF, 'Supplemental Symbols and Pictographs'],
    [0x20000, 0x2A6DF, 'CJK Unified Ideographs Extension B'],
    [0xE0000, 0xE0FFF, 'Tags'], [0xE0100, 0xE01EF, 'Variation Selectors Supplement'],
    [0xF0000, 0xFFFFF, 'Supplementary Private Use Area-A'],
    [0x100000, 0x10FFFF, 'Supplementary Private Use Area-B']
  ];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hex(n, w) { return n.toString(16).toUpperCase().padStart(w, '0'); }
  function utf8bytes(cp) {
    if (cp < 0x80) return [cp];
    if (cp < 0x800) return [0xC0 | (cp >> 6), 0x80 | (cp & 0x3F)];
    if (cp < 0x10000) return [0xE0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)];
    return [0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)];
  }
  function blockOf(cp) {
    for (var i = 0; i < BLOCKS.length; i++) {
      if (cp >= BLOCKS[i][0] && cp <= BLOCKS[i][1]) return BLOCKS[i][2];
    }
    return 'Unknown';
  }
  var propTests = null;
  function categoryOf(ch) {
    try {
      if (!propTests) {
        propTests = [
          ['Letter', 'L'], ['Mark', 'M'], ['Number', 'N'], ['Punctuation', 'P'],
          ['Symbol', 'S'], ['Separator', 'Z'], ['Control / Other', 'C']
        ].map(function (p) { return [p[0], new RegExp('^\\p{' + p[1] + '}$', 'u')]; });
      }
      for (var i = 0; i < propTests.length; i++) {
        if (propTests[i][1].test(ch)) return propTests[i][0];
      }
    } catch (e) { /* property escapes unsupported */ }
    return '—';
  }
  function update() {
    if (!TN.el('uni-body')) return;
    TN.clearErr(ERR);
    var text = TN.el('uni-text').value;
    var cps = Array.from(text);
    TN.el('uni-cps').textContent = cps.length;
    TN.el('uni-units').textContent = text.length;
    var totalBytes = 0, html = '';
    cps.forEach(function (ch) {
      var cp = ch.codePointAt(0);
      var bytes = utf8bytes(cp);
      totalBytes += bytes.length;
      var units = [];
      for (var i = 0; i < ch.length; i++) units.push('0x' + hex(ch.charCodeAt(i), 4));
      html += '<tr><td style="font-size:1.4rem">' + esc(ch) + '</td>' +
        '<td><strong>U+' + hex(cp, cp > 0xFFFF ? 5 : 4) + '</strong></td>' +
        '<td style="font-family:ui-monospace,monospace">' + units.join(' ') + '</td>' +
        '<td style="font-family:ui-monospace,monospace">' + bytes.map(function (b) { return hex(b, 2); }).join(' ') + '</td>' +
        '<td>' + esc(blockOf(cp)) + '</td><td>' + esc(categoryOf(ch)) + '</td></tr>';
    });
    TN.el('uni-bytes').textContent = totalBytes;
    TN.el('uni-body').innerHTML = html || '<tr><td colspan="6" class="muted">Type something to inspect it.</td></tr>';
  }
  try {
    TN.on('uni-text', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();