/* Sprint Retro Ideas — retro format picker with guided question prompts. */
(function () {
  'use strict';
  var SLUG = 'sprint-retro-ideas';

  var FORMATS = {
    ssc: {
      name: 'Start / Stop / Continue',
      desc: 'The classic. Three columns, zero prep, works for every team.',
      prompts: [
        'START: What should we start doing that would make the next sprint better?',
        'START: Which good habit from another team should we adopt?',
        'STOP: What slowed us down or wasted our time this sprint?',
        'STOP: Which meeting or process added no value?',
        'CONTINUE: What worked well that we should protect?',
        'CONTINUE: Who deserves a shout-out for great work this sprint?'
      ]
    },
    fourls: {
      name: 'The 4Ls — Liked, Learned, Lacked, Longed for',
      desc: 'Reflective and blameless. Great for teams that like depth.',
      prompts: [
        'LIKED: What did you genuinely enjoy about this sprint?',
        'LEARNED: What did you learn — about the product, the tech, or the team?',
        'LACKED: What was missing? Tools, information, support, clarity?',
        'LONGED FOR: What do you wish we had, or wish had gone differently?',
        'BONUS: Which "lacked" item can we fix before the next retro?'
      ]
    },
    sailboat: {
      name: 'Sailboat',
      desc: 'Visual metaphor: wind pushes you forward, anchors hold you back.',
      prompts: [
        'WIND (in our sails): What pushed us forward this sprint?',
        'ANCHOR (holding us back): What slowed us down or blocked us?',
        'ROCKS (risks ahead): What dangers do we see on the horizon?',
        'ISLAND (our goal): What does success look like next sprint?',
        'BONUS: Which one anchor can we cut loose this week?'
      ]
    },
    msg: {
      name: 'Mad / Sad / Glad',
      desc: 'Emotion-first. Surfaces feelings that process questions miss.',
      prompts: [
        'MAD: What frustrated or angered you this sprint?',
        'MAD: Which recurring annoyance needs to die?',
        'SAD: What disappointed you — about the work or the team dynamic?',
        'GLAD: What made you happy or proud this sprint?',
        'GLAD: Who helped you, and how can we do more of that?',
        'BONUS: Turn one "mad" into a concrete experiment for next sprint.'
      ]
    },
    starfish: {
      name: 'Starfish',
      desc: 'Five arms for finer-grained feedback than Start/Stop/Continue.',
      prompts: [
        'KEEP DOING: What is working and must continue?',
        'LESS OF: What should we do less of (but not stop entirely)?',
        'MORE OF: What is working that we should amplify?',
        'STOP DOING: What should we kill completely?',
        'START DOING: What new thing should we try next sprint?',
        'BONUS: Vote on the top idea in each arm — that is your action list.'
      ]
    }
  };

  var currentText = '';

  function show(key) {
    var f = FORMATS[key];
    if (!f) return;
    currentText = 'RETRO FORMAT: ' + f.name + '\n' + f.desc + '\n\n' + f.prompts.map(function (p, i) { return (i + 1) + '. ' + p; }).join('\n');
    var box = TN.el(SLUG + '-output');
    box.innerHTML = '';
    var h = document.createElement('div');
    h.style.cssText = 'font-weight:700;font-size:1.05rem;margin-bottom:4px';
    h.textContent = f.name;
    var d = document.createElement('div');
    d.className = 'muted';
    d.style.marginBottom = '8px';
    d.textContent = f.desc;
    box.appendChild(h);
    box.appendChild(d);
    var ol = document.createElement('ol');
    ol.style.cssText = 'margin:0;padding-left:20px;line-height:1.7';
    f.prompts.forEach(function (p) {
      var li = document.createElement('li');
      li.textContent = p;
      ol.appendChild(li);
    });
    box.appendChild(ol);
  }

  function init() {
    if (!TN.el(SLUG + '-format')) return;
    var sel = TN.el(SLUG + '-format');
    show(sel.value);
    sel.addEventListener('change', function () { show(sel.value); });
    TN.on(SLUG + '-random', 'click', function () {
      var keys = Object.keys(FORMATS);
      var k = keys[Math.floor(Math.random() * keys.length)];
      sel.value = k;
      show(k);
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!currentText) { TN.setErr(SLUG + '-error', 'Nothing to copy yet.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(currentText).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy Prompts';
        setTimeout(function () { btn.textContent = 'Copy Prompts'; }, 1200);
      });
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
