/* Fortune Cookie Generator — 40 fortunes + lucky numbers. */
(function () {
  'use strict';
  var SLUG = 'fortune-cookie-generator';

  var FORTUNES = [
    "A pleasant surprise is heading your way.",
    "Your kindness will return to you threefold.",
    "Good things come to those who start.",
    "An unexpected opportunity will knock soon — answer it.",
    "Your hard work is about to pay off.",
    "Someone admires you more than you know.",
    "A new friendship will change your perspective.",
    "Trust your instincts; they are sharper than you think.",
    "Wealth follows the bold this season.",
    "A journey you have been postponing will reward you.",
    "Your creativity will open a door you didn't see.",
    "Patience now brings abundance later.",
    "A small risk today leads to a big reward tomorrow.",
    "Love is closer than you think.",
    "Your next idea could be your best one yet.",
    "Fortune favors the one who keeps going.",
    "A message you receive soon carries good news.",
    "Your generosity will come back in surprising ways.",
    "The answer you seek is already within you.",
    "New beginnings are on the horizon.",
    "A stranger will bring you valuable advice.",
    "Your persistence will inspire someone silently watching.",
    "Good luck follows those who share their smile.",
    "An old dream is ready to be revived.",
    "You will find what you stopped searching for.",
    "A financial surprise is in your near future.",
    "Your calm energy attracts good fortune.",
    "Take the leap — the net will appear.",
    "Someone is about to say exactly what you needed to hear.",
    "Your efforts will be recognized by the right people.",
    "A door closes so a better one can open.",
    "Adventure awaits just outside your comfort zone.",
    "Your lucky break is closer than it appears.",
    "What you give freely returns multiplied.",
    "A bold decision this month will shape your year.",
    "Happiness finds those who stop chasing it.",
    "Your story is about to get very interesting.",
    "The stars align for a fresh start.",
    "A wish you made quietly is on its way.",
    "Your next chapter begins with a single brave step."
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function luckyNumbers() {
    var seen = {}, out = [];
    while (out.length < 6) {
      var n = 1 + Math.floor(Math.random() * 99);
      if (!seen[n]) { seen[n] = true; out.push(n); }
    }
    return out.sort(function (a, b) { return a - b; });
  }

  function render(fortune, nums) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    var text = '\uD83E\uDD60 ' + fortune + '  Lucky numbers: ' + nums.join(', ');
    var row = document.createElement('div');
    row.className = 'copy-row mt';
    var res = document.createElement('div');
    res.className = 'result';
    res.style.cursor = 'pointer';
    var val = document.createElement('div');
    val.style.fontSize = '1.05rem';
    val.textContent = fortune;
    var lab = document.createElement('div');
    lab.className = 'muted';
    lab.style.marginTop = '8px';
    lab.textContent = 'Lucky numbers: ' + nums.join(' · ');
    res.appendChild(val);
    res.appendChild(lab);
    var btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-sm';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      TN.copy(text).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        if (!ok) TN.setErr(SLUG + '-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
        setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
      });
    });
    res.addEventListener('click', function () { btn.click(); });
    row.appendChild(res);
    row.appendChild(btn);
    list.appendChild(row);
  }

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      render(pick(FORTUNES), luckyNumbers());
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not crack a cookie. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
