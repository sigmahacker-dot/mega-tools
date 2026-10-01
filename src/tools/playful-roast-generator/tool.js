/* Playful Roast Generator — friendly, clean roasts from templates. Never cruel. */
(function () {
  'use strict';
  var SLUG = 'playful-roast-generator';

  var TPL = {
    goofy: [
      '{n} has two brain cells and they are both fighting for third place.',
      '{n} is proof that evolution can go in reverse.',
      'Somewhere out there, a village is missing its {n}.',
      '{n}\u2019s Wi-Fi signal is stronger than their decision-making.',
      'If brains were dynamite, {n} would not have enough to blow their nose.',
      '{n} brings a lot of joy to a room — mostly when they leave it.',
      'I would roast {n} harder, but I am afraid of hurting their one feeling.',
      '{n} is like a cloud: when they disappear, it is a beautiful day.',
      'Mirrors everywhere just sighed in relief that {n} walked past.',
      '{n}\u2019s search history is just "how to adult" on repeat.',
      'Even {n}\u2019s GPS says "recalculating" out of pity.',
      '{n} has the attention span of a goldfish with notifications on.'
    ],
    nerdy: [
      '{n} runs on dial-up in a fiber-optic world.',
      'Ctrl+Alt+Del could not fix {n}\u2019s logic errors.',
      '{n} is the human equivalent of a 404 page.',
      'Somewhere, a loading spinner is jealous of how slow {n} is.',
      '{n}\u2019s brain has too many tabs open and one is playing music.',
      'If {n} were a password, they would be "password123".',
      '{n} is still buffering — please wait.',
      'Even autocorrect gave up on {n}.',
      '{n}\u2019s common sense is in airplane mode.',
      '{n} debugs everyone else\u2019s code but cannot debug their own life.',
      'There is a software update pending for {n}\u2019s brain.',
      '{n} is the reason the cloud has trust issues.'
    ],
    lazy: [
      '{n}\u2019s idea of exercise is running out of snacks.',
      '{n} would win gold in competitive napping.',
      'Laziness called — it wants {n} as its spokesperson.',
      '{n} treats deadlines like suggestions.',
      'If procrastination were an Olympic sport, {n} would compete tomorrow.',
      '{n}\u2019s to-do list has one item: "do to-do list later".',
      'Even {n}\u2019s snooze button needs a break.',
      '{n} puts the "pro" in procrastination and the "rest" in "arrest me for resting".',
      'The couch filed a missing-person report when {n} stood up.',
      '{n}\u2019s workout routine is lifting the remote.',
      'Motivation knocked on {n}\u2019s door and left a note.',
      '{n} is so chill, thermometers get jealous.'
    ],
    dramatic: [
      '{n} turns a paper cut into a three-act tragedy.',
      'Somewhere, a soap opera is taking notes on {n}\u2019s life.',
      '{n} does not have mood swings — they have mood theme parks.',
      'If drama were currency, {n} would own a bank.',
      '{n}\u2019s sighs have their own background music.',
      'Shakespeare just called: he wants his dramatics back from {n}.',
      '{n} could make a grocery list sound like a plot twist.',
      'The Oscars called — {n}\u2019s reaction to spilled coffee won Best Drama.',
      '{n} treats every group chat like a season finale.',
      'Even {n}\u2019s plants get dramatic monologues.',
      '{n} does not walk into rooms — they make entrances.',
      'Reality TV producers are speed-dialing {n} right now.'
    ]
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      res.textContent = t;
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      function doCopy() {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      }
      btn.addEventListener('click', doCopy);
      res.addEventListener('click', doCopy);
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var vibe = TN.el(SLUG + '-vibe').value;
        var name = TN.el(SLUG + '-name').value.trim() || 'you';
        var bank = TPL[vibe] || TPL.goofy;
        var seen = {}, out = [], guard = 0;
        while (out.length < 5 && guard < 100) {
          guard++;
          var r = pick(bank).replace(/\{n\}/g, name);
          if (!seen[r]) { seen[r] = true; out.push(r); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not roast. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
