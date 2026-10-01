/* Passphrase Generator — 120-word list, separators, casing, entropy. */
(function () {
  'use strict';
  var SLUG = 'passphrase-generator';
  var ERR = SLUG + '-error';
  var WORDS = ('apple river stone cloud mountain ocean forest desert valley thunder lightning breeze meadow ' +
    'garden bridge tower castle dragon phoenix tiger lion wolf bear eagle hawk shark whale dolphin ' +
    'piano guitar drum violin trumpet flute song melody rhythm dance paint brush canvas color ' +
    'coffee tea honey bread cheese fruit mango lemon pepper salt sugar spice rocket planet star moon ' +
    'comet orbit gravity laser robot cyber pixel data code chip circuit battery solar wind rain snow ' +
    'storm frost ember flame smoke ash leaf petal root seed bloom spring summer autumn winter ' +
    'happy brave clever swift silent quick bold calm wild free noble bright sharp cool warm ' +
    'amber coral ivory jade onyx pearl ruby topaz clock lamp chair table door window mirror ' +
    'paper book pen map key lock chain wheel anchor sail kite balloon train plane ship car').split(' ');
  var current = '';

  function $(id) { return document.getElementById(id); }

  function applyCase(w, mode) {
    if (mode === 'upper') return w.toUpperCase();
    if (mode === 'title') return w.charAt(0).toUpperCase() + w.slice(1);
    if (mode === 'random') {
      var out = '';
      for (var i = 0; i < w.length; i++) out += Math.random() < 0.5 ? w[i].toUpperCase() : w[i];
      return out;
    }
    return w;
  }

  function generate() {
    var n = parseInt($('passphrase-generator-words').value, 10);
    if (!(n >= 3 && n <= 8)) { TN.setErr(ERR, 'Choose between 3 and 8 words.'); return; }
    TN.clearErr(ERR);
    var sepOpt = $('passphrase-generator-sep').value;
    var caseMode = $('passphrase-generator-case').value;
    // pick n unique words
    var pool = WORDS.slice();
    var picked = [];
    for (var i = 0; i < n; i++) {
      var j = Math.floor(Math.random() * pool.length);
      picked.push(applyCase(pool.splice(j, 1)[0], caseMode));
    }
    var sep = sepOpt;
    if (sepOpt === 'random') sep = String(Math.floor(Math.random() * 10));
    current = picked.join(sep);
    $('passphrase-generator-out').textContent = current;
    var entropy = Math.round(n * Math.log(WORDS.length) / Math.log(2));
    $('passphrase-generator-entropy').textContent = '~' + entropy + ' bits';
    $('passphrase-generator-len').textContent = current.length;
    $('passphrase-generator-result').hidden = false;
    $('passphrase-generator-copy').disabled = false;
  }

  try {
    TN.on('passphrase-generator-go', 'click', generate);
    TN.on('passphrase-generator-copy', 'click', function () {
      if (!current) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(current).then(function () { TN.clearErr(ERR); }, function () { TN.setErr(ERR, 'Copy failed.'); });
      } else { TN.setErr(ERR, 'Clipboard not available.'); }
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
