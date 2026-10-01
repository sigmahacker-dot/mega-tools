/* Scale Finder — match note sets against 216 real scales. */
(function () {
  'use strict';
  var SLUG = 'scale-finder';
  var ERR = SLUG + '-error';

  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var SCALES = [
    ['Major (Ionian)', [0, 2, 4, 5, 7, 9, 11]],
    ['Natural minor (Aeolian)', [0, 2, 3, 5, 7, 8, 10]],
    ['Harmonic minor', [0, 2, 3, 5, 7, 8, 11]],
    ['Melodic minor', [0, 2, 3, 5, 7, 9, 11]],
    ['Dorian', [0, 2, 3, 5, 7, 9, 10]],
    ['Phrygian', [0, 1, 3, 5, 7, 8, 10]],
    ['Lydian', [0, 2, 4, 6, 7, 9, 11]],
    ['Mixolydian', [0, 2, 4, 5, 7, 9, 10]],
    ['Locrian', [0, 1, 3, 5, 6, 8, 10]],
    ['Major pentatonic', [0, 2, 4, 7, 9]],
    ['Minor pentatonic', [0, 3, 5, 7, 10]],
    ['Blues', [0, 3, 5, 6, 7, 10]],
    ['Major blues', [0, 2, 3, 4, 7, 9]],
    ['Whole tone', [0, 2, 4, 6, 8, 10]],
    ['Diminished (whole-half)', [0, 2, 3, 5, 6, 8, 9, 11]],
    ['Phrygian dominant', [0, 1, 4, 5, 7, 8, 10]],
    ['Hungarian minor', [0, 2, 3, 6, 7, 8, 11]],
    ['Chromatic', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]]
  ];

  var BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function parseNote(tok) {
    tok = tok.trim().replace(/♯/g, '#').replace(/♭/g, 'b');
    if (!tok) return -1;
    var m = tok.match(/^([A-Ga-g])([#bx]*)$/);
    if (!m) return -1;
    var pc = BASE[m[1].toUpperCase()];
    var acc = m[2];
    for (var i = 0; i < acc.length; i++) {
      if (acc[i] === '#') pc += 1;
      else if (acc[i] === 'b') pc -= 1;
      else if (acc[i] === 'x') pc += 2;
    }
    return ((pc % 12) + 12) % 12;
  }

  function find() {
    TN.clearErr(ERR);
    var raw = document.getElementById(SLUG + '-notes').value || '';
    var pcs = [];
    var bad = [];
    raw.split(/[\s,]+/).forEach(function (t) {
      if (!t) return;
      var pc = parseNote(t);
      if (pc < 0) bad.push(t);
      else if (pcs.indexOf(pc) < 0) pcs.push(pc);
    });
    if (bad.length) { TN.setErr(ERR, 'Could not read these as notes: ' + bad.join(', ') + '. Use names like C, F#, Bb.'); return; }
    if (!pcs.length) { TN.setErr(ERR, 'Type at least one note first.'); return; }
    if (pcs.length > 12) { TN.setErr(ERR, 'Too many distinct notes (max 12).'); return; }

    var matches = [];
    for (var root = 0; root < 12; root++) {
      SCALES.forEach(function (sc) {
        var name = sc[0], iv = sc[1];
        var scalePcs = iv.map(function (x) { return (root + x) % 12; });
        var ok = pcs.every(function (p) { return scalePcs.indexOf(p) >= 0; });
        if (ok) {
          var exact = pcs.length === scalePcs.length;
          var coverage = Math.round(pcs.length / scalePcs.length * 100);
          matches.push({
            root: root, name: name, notes: scalePcs.map(function (p) { return NAMES[p]; }),
            exact: exact, coverage: coverage, extra: scalePcs.length - pcs.length
          });
        }
      });
    }
    matches.sort(function (a, b) {
      if (a.exact !== b.exact) return a.exact ? -1 : 1;
      if (a.coverage !== b.coverage) return b.coverage - a.coverage;
      return a.extra - b.extra;
    });

    var res = document.getElementById(SLUG + '-result');
    var list = document.getElementById(SLUG + '-list');
    var sum = document.getElementById(SLUG + '-summary');
    list.innerHTML = '';
    if (!matches.length) {
      sum.textContent = 'No scale contains exactly these notes.';
    } else {
      sum.textContent = matches.length + ' matching scale' + (matches.length === 1 ? '' : 's') +
        ' for [' + pcs.map(function (p) { return NAMES[p]; }).join(' ') + ']';
      matches.slice(0, 60).forEach(function (m) {
        var d = document.createElement('div');
        d.className = 'field';
        d.style.cssText = 'border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;margin-bottom:8px;';
        var badge = m.exact
          ? '<span style="background:#166534;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;">EXACT</span> '
          : '<span style="background:#eef2f6;color:#334155;border-radius:6px;padding:2px 8px;font-size:12px;">' + m.coverage + '%</span> ';
        d.innerHTML = '<strong>' + badge + NAMES[m.root] + ' ' + m.name + '</strong>' +
          '<div class="muted">' + m.notes.join(' – ') + '</div>';
        list.appendChild(d);
      });
      if (matches.length > 60) {
        var more = document.createElement('p');
        more.className = 'muted';
        more.textContent = '…and ' + (matches.length - 60) + ' more partial matches.';
        list.appendChild(more);
      }
    }
    res.classList.remove('hidden');
  }

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', find);
    TN.on(SLUG + '-notes', 'keydown', function (e) {
      if (e.key === 'Enter') find();
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
