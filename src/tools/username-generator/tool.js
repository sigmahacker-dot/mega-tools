(function () {
  'use strict';
  var S = 'username-generator';
  var LEET = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', l: '1', b: '8', g: '9' };
  var GAMER_PRE = ['xX', 'iTz', 'The', 'Real', 'Pro', 'Dark', 'Epic', 'Shadow', 'Nova', 'Pixel'];
  var GAMER_SUF = ['Xx', 'TTV', 'GG', 'Plays', 'OP', 'Prime', 'Zero', 'Nova', 'Byte', 'Rogue'];
  var PRO_SUF = ['.dev', '.hq', '.pro', '.io', 'Official', 'Studio', 'Works', 'Creates', 'Lab', 'Co'];
  var AES_SUF = ['.aesthetic', '_dream', '.ethereal', '_vibes', '.luna', '_aura', '.bloom', '_petal', '.noir', '_mist'];
  var FUNNY_PRE = ['Sir', 'Captain', 'Professor', 'Lord', 'Doctor', 'Agent', 'Major', 'Chief'];
  var FUNNY_SUF = ['Potato', 'Noodle', 'Wizard', 'Banana', 'Penguin', 'Pickle', 'Muffin', 'Biscuit', 'Waffle', 'Panda'];
  function leetify(w) {
    return w.split('').map(function (ch) {
      var l = ch.toLowerCase();
      return (LEET[l] && Math.random() < 0.6) ? LEET[l] : ch;
    }).join('');
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function clean(kw) { return (kw || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function cap(kw) { return kw ? kw.charAt(0).toUpperCase() + kw.slice(1) : ''; }
  function ideasFor(style, kw, base) {
    var ideas = [];
    function add(x) { if (x && x.length >= 3 && ideas.indexOf(x) < 0) ideas.push(x); }
    var kwC = cap(kw);
    if (style === 'gamer') {
      add(pick(GAMER_PRE) + kwC + pick(GAMER_SUF));
      add('xX_' + leetify(base) + '_Xx');
      add(leetify(base) + rnd(99));
      add(pick(GAMER_PRE) + '_' + leetify(base) + rnd(99));
      add(base + 'Gaming');
      add('The' + kwC + 'Slayer');
      add(leetify(base) + '_' + pick(GAMER_SUF));
      add('iAm' + kwC);
      add(base + '_TTV');
      add('Not' + kwC);
      add(kwC + 'OnTop');
      add('sweaty' + kwC);
    } else if (style === 'professional') {
      add(base + pick(PRO_SUF));
      add('the' + base);
      add('its' + kwC);
      add(kwC + 'Creates');
      add(base + '_' + rnd(999));
      add('hello' + kwC);
      add(kwC + '.studio');
      add('workwith' + base);
      add(base + 'official');
      add('meet' + kwC);
      add(kwC + 'byday');
      add('real' + base);
    } else if (style === 'aesthetic') {
      add(base + pick(AES_SUF));
      add(kwC + 'Moon');
      add('soft' + kwC);
      add(base + '.dreams');
      add('vintage' + kwC);
      add(kwC + ' skies'.replace(' ', ''));
      add('golden' + kwC);
      add(base + '_daze');
      add('pastel' + kwC);
      add(kwC + 'clouds');
      add('midnight' + kwC);
      add(base + '.muse');
    } else {
      add(pick(FUNNY_PRE) + kwC);
      add(kwC + pick(FUNNY_SUF));
      add('definitely_not_' + base);
      add(base + '_fan_account');
      add('certified' + kwC);
      add(kwC + 'Enjoyer');
      add('okay' + kwC);
      add(base + 'IsTaken');
      add('probably' + kwC);
      add(kwC + 'Supreme');
      add('just' + kwC);
      add(base + '_irl');
    }
    while (ideas.length < 12) add(base + rnd(9999));
    return ideas.slice(0, 12);
  }
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function gen() {
    try {
      TN.clearErr(S + '-error');
      var kw = clean(TN.el(S + '-keyword').value);
      if (!kw) { TN.setErr(S + '-error', 'Please enter a keyword or name first.'); return; }
      var style = TN.el(S + '-style').value || 'gamer';
      var ideas = ideasFor(style, kw, kw);
      var list = TN.el(S + '-list');
      list.innerHTML = '';
      var frag = document.createDocumentFragment();
      ideas.forEach(function (u) {
        var row = document.createElement('div');
        row.className = 'copy-row';
        var span = document.createElement('span');
        span.textContent = u;
        row.appendChild(span);
        row.style.cursor = 'pointer';
        (function (name) {
          row.addEventListener('click', function () {
            TN.copy(name).catch(function () { TN.setErr(S + '-error', 'Copy failed — please copy manually.'); });
          });
        })(u);
        frag.appendChild(row);
      });
      list.appendChild(frag);
    } catch (e) { TN.setErr(S + '-error', 'Something went wrong. Please try again.'); }
  }
  on(S + '-generate', 'click', gen);
})();
