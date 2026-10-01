/* Robot Name Generator — model numbers, designations, friendly names. */
(function () {
  'use strict';
  var SLUG = 'robot-name-generator';

  var PRE = ['RX','MK','AX','ZX','VX','QX','NX','TX'];
  var LABEL = ['Unit','Series','Model','Class','Batch','Line','Mark','Gen'];
  var NAMES = ['Bolt','Circuit','Cog','Diode','Flux','Gear','Hex','Ion','Jolt','Mech','Nano','Pixel','Servo','Spark','Volt','Widget','Axel','Byte','Chip','Dash','Echo','Fuse','Gizmo','Halo','Kilo','Lex','Micro','Node','Ohm','Proto','Quark','Relay','Socket','Torque'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function digits(n) {
    var s = '';
    for (var i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
    return s;
  }

  function genOne(style) {
    if (style === 'model') return pick(PRE) + '-' + digits(4);
    if (style === 'designation') return pick(LABEL) + ' ' + pick(PRE) + '-' + digits(2) + ' \u201c' + pick(NAMES) + '\u201d';
    return pick(NAMES) + (Math.random() < 0.4 ? '-' + digits(2) : '');
  }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var val = document.createElement('div');
      val.textContent = t;
      res.appendChild(val);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          if (!ok) TN.setErr(SLUG + '-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      });
      res.addEventListener('click', function () { btn.click(); });
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      var style = TN.el(SLUG + '-style').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genOne(style);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
