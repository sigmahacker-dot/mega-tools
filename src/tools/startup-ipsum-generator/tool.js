/* Startup Ipsum Generator — buzzword lorem ipsum from templates + banks. */
(function () {
  'use strict';
  var SLUG = 'startup-ipsum-generator';

  var VERB = ['disrupt', 'leverage', 'synergize', 'pivot', 'scale', 'optimize', 'gamify', 'monetize', 'streamline', 'crowdsource', 'bootstrap', 'incentivize', 'productize', 'operationalize', 'democratize', 'revolutionize', 'accelerate', 'harness', 'reimagine', 'supercharge', 'orchestrate', 'actualize', 'ideate', 'iterate on', 'double down on', 'move the needle on', 'unpack', 'circle back on', 'deep-dive into', 'whiteboard', 'growth-hack', 'right-size', 'future-proof', 'sunset', 'dogfood', 'boil the ocean with'];
  var ADJ = ['agile', 'disruptive', 'scalable', 'data-driven', 'cloud-native', 'AI-powered', 'hyperlocal', 'frictionless', 'holistic', 'lean', 'bleeding-edge', 'mobile-first', 'omnichannel', 'paradigm-shifting', 'seamless', 'synergistic', 'viral', 'end-to-end', 'best-in-class', 'next-gen', 'zero-to-one', '10x', 'plug-and-play', 'always-on', 'customer-obsessed', 'decentralized', 'permissionless', 'composable', 'full-stack', 'low-hanging'];
  var NOUN = ['synergy', 'bandwidth', 'leverage', 'paradigm', 'ecosystem', 'flywheel', 'north star', 'low-hanging fruit', 'value prop', 'growth loop', 'moat', 'runway', 'burn rate', 'unicorn', 'pivot', 'MVP', 'OKRs', 'KPIs', 'deck', 'cap table', 'term sheet', 'Series A', 'product-market fit', 'go-to-market', 'secret sauce', 'blue ocean', 'network effect', 'viral coefficient', 'cohort', 'funnel', 'playbook', 'war room', 'moonshot', 'thought leadership', 'deep tech', 'stack'];
  var OPEN = ['We are on a mission to', 'Our platform empowers teams to', 'In today\u2019s fast-moving landscape, we', 'By combining vision with execution, we', 'We believe the future belongs to teams that', 'Our secret sauce is simple: we'];

  var TPL = [
    function (p) { return 'We ' + p(VERB) + ' ' + p(ADJ) + ' ' + p(NOUN) + ' to ' + p(VERB) + ' ' + p(ADJ) + ' ' + p(NOUN) + '.'; },
    function (p) { return 'By ' + p(VERB).replace(/e$/, '') + 'ing ' + p(ADJ) + ' ' + p(NOUN) + ', we unlock ' + p(ADJ) + ' ' + p(NOUN) + ' at scale.'; },
    function (p) { return 'Our ' + p(ADJ) + ' approach to ' + p(NOUN) + ' lets us ' + p(VERB) + ' the ' + p(NOUN) + ' like never before.'; },
    function (p) { return p(OPEN) + ' ' + p(VERB) + ' ' + p(ADJ) + ' ' + p(NOUN) + ' across the entire ' + p(NOUN) + '.'; },
    function (p) { return 'Forget ' + p(NOUN) + ' \u2014 our ' + p(ADJ) + ' ' + p(NOUN) + ' will ' + p(VERB) + ' your ' + p(NOUN) + ' overnight.'; },
    function (p) { return 'With ' + p(ADJ) + ' ' + p(NOUN) + ' baked in, every sprint helps us ' + p(VERB) + ' ' + p(ADJ) + ' outcomes.'; },
    function (p) { return 'Investors love our ' + p(NOUN) + ' because we ' + p(VERB) + ' ' + p(ADJ) + ' ' + p(NOUN) + ' on autopilot.'; },
    function (p) { return 'It\u2019s time to ' + p(VERB) + ' the ' + p(NOUN) + ' and build ' + p(ADJ) + ' ' + p(NOUN) + ' for the next decade.'; }
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function sentence() { return pick(TPL)(pick); }
  function paragraph() {
    var n = 4 + Math.floor(Math.random() * 3), s = [];
    for (var i = 0; i < n; i++) s.push(sentence());
    return s.join(' ');
  }

  var current = '';
  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var n = parseInt(TN.el(SLUG + '-paras').value, 10) || 3;
        var paras = [];
        for (var i = 0; i < n; i++) paras.push(paragraph());
        current = paras.join('\n\n');
        TN.el(SLUG + '-output').textContent = current;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate text. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Generate some ipsum first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy Text';
        setTimeout(function () { btn.textContent = 'Copy Text'; }, 1200);
      });
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
