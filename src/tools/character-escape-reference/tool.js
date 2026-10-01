/* Character Escape Reference — searchable char table + live HTML/URL/JS encoder. */
(function () {
  'use strict';
  var SLUG = 'character-escape-reference';
  // [char, html entity, description]
  var CHARS = [
    ['<', '&lt;', 'Less-than'], ['>', '&gt;', 'Greater-than'],
    ['&', '&amp;', 'Ampersand'], ['"', '&quot;', 'Double quote'],
    ["'", '&apos;', 'Apostrophe'], [' ', '&nbsp;', 'Non-breaking space'],
    ['©', '&copy;', 'Copyright'], ['®', '&reg;', 'Registered'],
    ['™', '&trade;', 'Trademark'], ['€', '&euro;', 'Euro'],
    ['£', '&pound;', 'Pound'], ['¥', '&yen;', 'Yen'],
    ['¢', '&cent;', 'Cent'], ['§', '&sect;', 'Section'],
    ['¶', '&para;', 'Pilcrow'], ['°', '&deg;', 'Degree'],
    ['±', '&plusmn;', 'Plus-minus'], ['×', '&times;', 'Multiplication'],
    ['÷', '&divide;', 'Division'], ['µ', '&micro;', 'Micro'],
    ['·', '&middot;', 'Middle dot'], ['…', '&hellip;', 'Ellipsis'],
    ['–', '&ndash;', 'En dash'], ['—', '&mdash;', 'Em dash'],
    ['‘', '&lsquo;', 'Left single quote'], ['’', '&rsquo;', 'Right single quote'],
    ['“', '&ldquo;', 'Left double quote'], ['”', '&rdquo;', 'Right double quote'],
    ['‹', '&lsaquo;', 'Single left angle quote'], ['›', '&rsaquo;', 'Single right angle quote'],
    ['«', '&laquo;', 'Left guillemet'], ['»', '&raquo;', 'Right guillemet'],
    ['¡', '&iexcl;', 'Inverted exclamation'], ['¿', '&iquest;', 'Inverted question'],
    ['À', '&Agrave;', 'A grave'], ['Á', '&Aacute;', 'A acute'],
    ['Â', '&Acirc;', 'A circumflex'], ['Ã', '&Atilde;', 'A tilde'],
    ['Ä', '&Auml;', 'A umlaut'], ['Å', '&Aring;', 'A ring'],
    ['Æ', '&AElig;', 'AE ligature'], ['Ç', '&Ccedil;', 'C cedilla'],
    ['È', '&Egrave;', 'E grave'], ['É', '&Eacute;', 'E acute'],
    ['Ê', '&Ecirc;', 'E circumflex'], ['Ë', '&Euml;', 'E umlaut'],
    ['Ì', '&Igrave;', 'I grave'], ['Í', '&Iacute;', 'I acute'],
    ['Î', '&Icirc;', 'I circumflex'], ['Ï', '&Iuml;', 'I umlaut'],
    ['Ñ', '&Ntilde;', 'N tilde'], ['Ò', '&Ograve;', 'O grave'],
    ['Ó', '&Oacute;', 'O acute'], ['Ô', '&Ocirc;', 'O circumflex'],
    ['Õ', '&Otilde;', 'O tilde'], ['Ö', '&Ouml;', 'O umlaut'],
    ['Ø', '&Oslash;', 'O slash'], ['Ù', '&Ugrave;', 'U grave'],
    ['Ú', '&Uacute;', 'U acute'], ['Û', '&Ucirc;', 'U circumflex'],
    ['Ü', '&Uuml;', 'U umlaut'], ['Ý', '&Yacute;', 'Y acute'],
    ['à', '&agrave;', 'a grave'], ['á', '&aacute;', 'a acute'],
    ['â', '&acirc;', 'a circumflex'], ['ã', '&atilde;', 'a tilde'],
    ['ä', '&auml;', 'a umlaut'], ['å', '&aring;', 'a ring'],
    ['æ', '&aelig;', 'ae ligature'], ['ç', '&ccedil;', 'c cedilla'],
    ['è', '&egrave;', 'e grave'], ['é', '&eacute;', 'e acute'],
    ['ê', '&ecirc;', 'e circumflex'], ['ë', '&euml;', 'e umlaut'],
    ['ì', '&igrave;', 'i grave'], ['í', '&iacute;', 'i acute'],
    ['î', '&icirc;', 'i circumflex'], ['ï', '&iuml;', 'i umlaut'],
    ['ñ', '&ntilde;', 'n tilde'], ['ò', '&ograve;', 'o grave'],
    ['ó', '&oacute;', 'o acute'], ['ô', '&ocirc;', 'o circumflex'],
    ['õ', '&otilde;', 'o tilde'], ['ö', '&ouml;', 'o umlaut'],
    ['ø', '&oslash;', 'o slash'], ['ù', '&ugrave;', 'u grave'],
    ['ú', '&uacute;', 'u acute'], ['û', '&ucirc;', 'u circumflex'],
    ['ü', '&uuml;', 'u umlaut'], ['ý', '&yacute;', 'y acute'],
    ['ÿ', '&yuml;', 'y umlaut'], ['ß', '&szlig;', 'Sharp s'],
    ['ƒ', '&fnof;', 'Function sign'], ['α', '&alpha;', 'Alpha'],
    ['β', '&beta;', 'Beta'], ['γ', '&gamma;', 'Gamma'],
    ['δ', '&delta;', 'Delta'], ['π', '&pi;', 'Pi'],
    ['σ', '&sigma;', 'Sigma'], ['ω', '&omega;', 'Omega'],
    ['←', '&larr;', 'Left arrow'], ['→', '&rarr;', 'Right arrow'],
    ['↑', '&uarr;', 'Up arrow'], ['↓', '&darr;', 'Down arrow'],
    ['♥', '&hearts;', 'Heart'], ['♦', '&diams;', 'Diamond'],
    ['♣', '&clubs;', 'Club'], ['♠', '&spades;', 'Spade'],
    ['✓', '&#10003;', 'Check mark'], ['✗', '&#10007;', 'Ballot X']
  ];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }

  function pad4(n) {
    var s = n.toString(16).toUpperCase();
    while (s.length < 4) s = '0' + s;
    return s;
  }

  function rowData(ch, entity, desc) {
    var cp = ch.codePointAt(0);
    var numeric = '&#' + cp + ';';
    var url = encodeURIComponent(ch);
    var js = cp > 0xFFFF
      ? '\\u' + pad4(Math.floor((cp - 0x10000) / 0x400) + 0xD800) + '\\u' + pad4((cp - 0x10000) % 0x400 + 0xDC00)
      : '\\u' + pad4(cp);
    return { ch: ch, entity: entity, numeric: numeric, url: url, js: js, desc: desc, cp: cp };
  }

  function render(filter) {
    var tb = el(SLUG + '-rows');
    tb.innerHTML = '';
    var q = (filter || '').toLowerCase().trim();
    var shown = 0;
    CHARS.forEach(function (c) {
      var d = rowData(c[0], c[1], c[2]);
      var hay = (d.ch + ' ' + d.entity + ' ' + d.numeric + ' ' + d.desc + ' ' +
                 d.cp + ' ' + pad4(d.cp)).toLowerCase();
      if (q && hay.indexOf(q) < 0) return;
      shown++;
      var tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.title = 'Click to copy the character';
      [d.ch, d.entity, d.numeric, d.url, d.js, d.desc].forEach(function (v, i) {
        var td = document.createElement('td');
        if (i === 0) td.style.fontSize = '18px';
        else td.innerHTML = '<code class="code">' + v.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</code>';
        if (i === 0) td.textContent = v;
        tr.appendChild(td);
      });
      tr.addEventListener('click', function () {
        TN.copy(d.ch).then(function (ok) {
          if (!ok) fail('Copy failed — select the text manually.');
        });
      });
      tb.appendChild(tr);
    });
    el(SLUG + '-none').classList.toggle('hidden', shown > 0);
  }

  function encodeLive() {
    var text = el(SLUG + '-input').value;
    var mode = el(SLUG + '-mode').value;
    var out;
    if (mode === 'url') {
      out = encodeURIComponent(text);
    } else if (mode === 'js') {
      out = '';
      for (var i = 0; i < text.length; i++) {
        var cp = text.codePointAt(i);
        if (cp > 0xFFFF) {
          out += '\\u' + pad4(Math.floor((cp - 0x10000) / 0x400) + 0xD800) +
                 '\\u' + pad4((cp - 0x10000) % 0x400 + 0xDC00);
          i++;
        } else if (cp < 128 && /[A-Za-z0-9]/.test(text[i])) {
          out += text[i];
        } else {
          out += '\\u' + pad4(cp);
        }
      }
    } else {
      out = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    el(SLUG + '-output').value = out;
  }

  try {
    TN.on(SLUG + '-search', 'input', TN.debounce(function () {
      render(el(SLUG + '-search').value);
    }, 150));
    TN.on(SLUG + '-input', 'input', TN.debounce(encodeLive, 200));
    TN.on(SLUG + '-mode', 'change', encodeLive);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Encode some text first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    render('');
  } catch (e) { /* never throw on load */ }
})();
