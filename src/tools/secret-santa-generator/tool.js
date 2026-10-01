(function () {
  'use strict';
  var ERR = 'secret-santa-generator-error';
  var pairs = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function derange(names) {
    // Fisher-Yates with rejection until no fixed points (derangement)
    for (var attempt = 0; attempt < 5000; attempt++) {
      var s = shuffle(names.slice());
      var ok = true;
      for (var i = 0; i < names.length; i++) {
        if (s[i] === names[i]) { ok = false; break; }
      }
      if (ok) return s;
    }
    // Fallback: cyclic rotation by 1 is always a derangement for n>=2
    return names.slice(1).concat(names.slice(0, 1));
  }
  function draw() {
    TN.clearErr(ERR);
    var ns = TN.el('santa-names').value.split(/\r?\n/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length; });
    if (ns.length < 3) { TN.setErr(ERR, 'Enter at least 3 participant names.'); return; }
    var seen = {};
    for (var i = 0; i < ns.length; i++) {
      var k = ns[i].toLowerCase();
      if (seen[k]) { TN.setErr(ERR, 'Duplicate name: "' + ns[i] + '". Names must be unique.'); return; }
      seen[k] = 1;
    }
    var receivers = derange(ns);
    pairs = ns.map(function (giver, i) { return { giver: giver, receiver: receivers[i] }; });
    var html = '';
    pairs.forEach(function (p, i) {
      html += '<tr><td>' + (i + 1) + '</td><td>' + esc(p.giver) + '</td><td>→</td><td>' + esc(p.receiver) + '</td></tr>';
    });
    TN.el('santa-body').innerHTML = html;
  }
  try {
    TN.on('santa-go', 'click', draw);
    TN.on('santa-dl', 'click', function () {
      if (!pairs.length) { TN.setErr(ERR, 'Draw names first.'); return; }
      TN.clearErr(ERR);
      var txt = 'SECRET SANTA PAIRINGS\n\n' + pairs.map(function (p, i) {
        return (i + 1) + '. ' + p.giver + '  →  ' + p.receiver;
      }).join('\n');
      var b = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'secret-santa.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
  } catch (e) { /* never throw on load */ }
})();