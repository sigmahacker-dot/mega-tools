/* Business Jargon Generator — grammatical corporate phrases from word banks + templates. */
(function () {
  'use strict';
  var SLUG = 'business-jargon-generator';

  var VERB = ['leverage', 'synergize', 'operationalize', 'incentivize', 'streamline', 'optimize', 'monetize', 'disrupt', 'pivot', 'scale', 'unpack', 'socialize', 'pressure-test', 'double-click on', 'drill down on', 'circle back on', 'touch base on', 'move the needle on', 'take offline', 'put a pin in', 'peel the onion on', 'boil down', 'tee up', 'run up the flagpole', 'get our ducks in a row on', 'herd cats around', 'drink the Kool-Aid on', 'eat our own dogfood on', 'move from ideation to execution on', 'operationalize at scale'];
  var ADJ = ['synergistic', 'holistic', 'robust', 'scalable', 'agile', 'data-driven', 'customer-centric', 'best-in-class', 'bleeding-edge', 'frictionless', 'forward-looking', 'game-changing', 'high-level', 'impactful', 'innovative', 'mission-critical', 'next-generation', 'out-of-the-box', 'paradigm-shifting', 'proactive', 'results-driven', 'seamless', 'strategic', 'sustainable', 'transformative', 'value-added', 'win-win', 'world-class', '360-degree', 'end-to-end'];
  var NOUN = ['synergy', 'bandwidth', 'learnings', 'deliverables', 'ecosystem', 'paradigm', 'wheelhouse', 'sandbox', 'swimlane', 'north star', 'low-hanging fruit', 'quick win', 'deep dive', 'tiger team', 'war room', 'action item', 'value add', 'secret sauce', 'core competency', 'thought leadership', 'brain dump', 'parking lot', 'stakeholder alignment', 'change management', 'digital transformation', 'growth mindset', 'key takeaway', 'pain point', 'touchpoint', 'value proposition'];
  var ADV = ['going forward', 'at the end of the day', 'moving forward', 'in this space', 'on a go-forward basis', 'from 30,000 feet', 'in real time', 'around the clock', 'behind the scenes', 'across the organization', 'from soup to nuts', 'day in and day out', 'quarter over quarter'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var TPL = [
    function () { return 'Let\u2019s ' + pick(VERB) + ' our ' + pick(ADJ) + ' ' + pick(NOUN) + ' ' + pick(ADV) + '.'; },
    function () { return 'We need to ' + pick(VERB) + ' the ' + pick(ADJ) + ' ' + pick(NOUN) + ' before we ' + pick(VERB) + ' the ' + pick(NOUN) + '.'; },
    function () { return 'Our ' + pick(ADJ) + ' ' + pick(NOUN) + ' will ' + pick(VERB) + ' real ' + pick(NOUN) + ' ' + pick(ADV) + '.'; },
    function () { return 'At the end of the day, it\u2019s all about ' + pick(VERB).replace(/^(.)/, function (m, c) { return c; }) + 'ing ' + pick(ADJ) + ' ' + pick(NOUN) + '.'; },
    function () { return 'Can we ' + pick(VERB) + ' a ' + pick(ADJ) + ' ' + pick(NOUN) + ' to address this ' + pick(NOUN) + '?'; },
    function () { return 'This ' + pick(ADJ) + ' ' + pick(NOUN) + ' is a real ' + pick(NOUN) + ' ' + pick(ADV) + '.'; },
    function () { return 'I\u2019ll ' + pick(VERB) + ' the ' + pick(NOUN) + ' and ' + pick(VERB) + ' back with ' + pick(ADJ) + ' ' + pick(NOUN) + '.'; },
    function () { return 'We\u2019re laser-focused on ' + pick(VERB) + 'ing our ' + pick(ADJ) + ' ' + pick(NOUN) + ' ' + pick(ADV) + '.'; }
  ];

  function phrase() {
    return cap(pick(TPL)());
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
        var seen = {}, out = [], guard = 0;
        while (out.length < 5 && guard < 100) {
          guard++;
          var p = phrase();
          if (!seen[p]) { seen[p] = true; out.push(p); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate jargon. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
