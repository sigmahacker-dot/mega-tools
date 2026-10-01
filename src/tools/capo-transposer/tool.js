/* Capo Transposer — transpose open chord shapes by capo position. */
(function () {
  'use strict';
  var SLUG = 'capo-transposer';
  var ERR = SLUG + '-error';

  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // shape: display name, root pitch class, quality label
  var SHAPES = [
    { s: 'C', r: 0, q: 'major' }, { s: 'A', r: 9, q: 'major' },
    { s: 'G', r: 7, q: 'major' }, { s: 'E', r: 4, q: 'major' },
    { s: 'D', r: 2, q: 'major' }, { s: 'F', r: 5, q: 'major' },
    { s: 'Am', r: 9, q: 'minor' }, { s: 'Em', r: 4, q: 'minor' },
    { s: 'Dm', r: 2, q: 'minor' },
    { s: 'C7', r: 0, q: '7th' }, { s: 'G7', r: 7, q: '7th' },
    { s: 'D7', r: 2, q: '7th' }, { s: 'A7', r: 9, q: '7th' },
    { s: 'E7', r: 4, q: '7th' }, { s: 'B7', r: 11, q: '7th' }
  ];
  var QSUF = { major: '', minor: 'm', '7th': '7' };

  function transpose(shape, capo) {
    var pc = (shape.r + capo) % 12;
    return NAMES[pc] + QSUF[shape.q];
  }

  function render() {
    var shapeName = document.getElementById(SLUG + '-shape').value;
    var capo = parseInt(document.getElementById(SLUG + '-capo').value, 10) || 0;
    var shape = null;
    SHAPES.forEach(function (s) { if (s.s === shapeName) shape = s; });
    if (!shape) shape = SHAPES[0];
    var out = transpose(shape, capo);
    document.getElementById(SLUG + '-out').textContent = out;
    document.getElementById(SLUG + '-explain').textContent =
      'Play a ' + shape.s + ' shape (' + shape.q + ') with the capo on fret ' + capo +
      ' and it sounds as ' + out + ' ' + shape.q + ' — raised ' + capo +
      ' semitone' + (capo === 1 ? '' : 's') + '.';

    var rows = document.getElementById(SLUG + '-rows');
    rows.innerHTML = '';
    SHAPES.forEach(function (s) {
      var tr = document.createElement('tr');
      var a = document.createElement('td');
      a.innerHTML = '<strong>' + s.s + '</strong> <span class="muted">(' + s.q + ')</span>';
      var b = document.createElement('td');
      b.innerHTML = '<strong>' + transpose(s, capo) + '</strong>';
      if (s.s === shape.s) tr.style.background = 'rgba(22,101,52,0.08)';
      tr.appendChild(a); tr.appendChild(b);
      rows.appendChild(tr);
    });
  }

  try {
    if (!document.getElementById(SLUG + '-shape')) return;
    var sel = document.getElementById(SLUG + '-shape');
    SHAPES.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.s;
      o.textContent = s.s + ' (' + s.q + ')';
      sel.appendChild(o);
    });
    sel.value = 'G';
    render();
    TN.on(SLUG + '-shape', 'change', render);
    TN.on(SLUG + '-capo', 'input', function () {
      var v = document.getElementById(SLUG + '-capo-val');
      if (v) v.textContent = this.value;
      render();
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
