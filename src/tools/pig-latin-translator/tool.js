/* Pig Latin Translator — proper vowel/cluster/qu rules, case + punctuation preserved. */
(function () {
  'use strict';
  var SLUG = 'pig-latin-translator';
  var VOWELS = 'aeiouAEIOU';

  function isVowel(ch) { return VOWELS.indexOf(ch) !== -1; }

  function applyCase(original, pig) {
    if (original === original.toUpperCase() && /[A-Z]/.test(original)) return pig.toUpperCase();
    if (original[0] === original[0].toUpperCase()) return pig[0].toUpperCase() + pig.slice(1).toLowerCase();
    return pig.toLowerCase();
  }

  function encodeWord(word) {
    var m = word.match(/^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/);
    if (!m) return word;
    var core = m[2], low = core.toLowerCase(), pig;
    if (isVowel(low[0])) {
      pig = low + 'way';
    } else {
      var i = 0;
      while (i < low.length && !isVowel(low[i])) {
        if (low[i] === 'q' && low[i + 1] === 'u') { i += 2; break; }
        i++;
      }
      pig = low.slice(i) + low.slice(0, i) + 'ay';
    }
    return m[1] + applyCase(core, pig) + m[3];
  }

  // Small common-word dictionary so decode can pick the right pre-image when
  // Pig Latin is ambiguous (e.g. "ingstray" could be "string" or "ngstri").
  var DICT = {};
  ('the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she ' +
   'or an will my one all would there their what so up out if about who get which go me when make can like time no ' +
   'just him know take people into year your good some could them see other than then now look only come its over ' +
   'think also back after use two how our work first well way even new want because any these give day most us ' +
   'hello world string queen apple pig latin cat sat mat dog fox brown quick lazy jumps over under apple orange ' +
   'happy day play night light love house mouse green great small large big red blue black white man woman child ' +
   'water fire earth wind sun moon star fish bird tree flower grass road town city country music song dance smile ' +
   'laugh cry run walk talk speak hear see look feel think dream sleep wake eat drink sweet fresh bright dark cold ' +
   'warm hot cool soft hard long short high low fast slow early late young old new').split(' ')
    .forEach(function (w) { DICT[w] = true; });

  function encodeLower(word) {
    var low = word.toLowerCase(), pig;
    if (isVowel(low[0])) {
      pig = low + 'way';
    } else {
      var i = 0;
      while (i < low.length && !isVowel(low[i])) {
        if (low[i] === 'q' && low[i + 1] === 'u') { i += 2; break; }
        i++;
      }
      pig = low.slice(i) + low.slice(0, i) + 'ay';
    }
    return pig;
  }

  // All plausible English pre-images of a Pig Latin word.
  function candidates(low) {
    var cands = [];
    function add(c) { if (c && cands.indexOf(c) === -1) cands.push(c); }
    if (/way$/.test(low) && low.length > 3) {
      var stem = low.slice(0, -3);
      if (isVowel(stem[0])) add(stem); // vowel-start hypothesis
    }
    if (/ay$/.test(low) && low.length > 2) {
      var s = low.replace(/ay$/, '');
      if (/qu$/.test(s)) {
        add('qu' + s.slice(0, -2));
      } else {
        for (var k = 1; k < s.length; k++) {
          var rest = s.slice(0, k), cluster = s.slice(k);
          if (isVowel(rest[0]) && /^[bcdfghjklmnpqrstvwxz]+$/.test(cluster)) add(cluster + rest);
        }
      }
    }
    return cands;
  }

  function decodeWord(word) {
    var m = word.match(/^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/);
    if (!m) return word;
    var core = m[2], low = core.toLowerCase(), eng = low;
    var cands = candidates(low), best = null, fallback = null;
    for (var i = 0; i < cands.length; i++) {
      if (encodeLower(cands[i]) === low) { // must re-encode to the input
        if (DICT[cands[i]]) { best = cands[i]; break; }
        if (!fallback) fallback = cands[i];
      }
    }
    if (best) eng = best;
    else if (fallback) eng = fallback;
    return m[1] + applyCase(core, eng) + m[3];
  }

  function convert(text, fn) {
    return text.split(/(\s+)/).map(function (tok) {
      return /^\s+$/.test(tok) ? tok : fn(tok);
    }).join('');
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var mode = TN.el(SLUG + '-mode').value;
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    TN.el(SLUG + '-output').textContent = convert(input, mode === 'encode' ? encodeWord : decodeWord);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
