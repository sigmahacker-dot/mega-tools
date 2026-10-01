/* CTA Button Text Generator — action x tone -> 12 variants. */
(function () {
  'use strict';
  var SLUG = 'cta-button-text-generator';

  var VERBS = {
    bold: ['Claim', 'Grab', 'Unlock', 'Dominate', 'Seize', 'Conquer', 'Own', 'Master', 'Command', 'Secure'],
    friendly: ['Join', 'Start', 'Try', 'Discover', 'Explore', 'Get', 'Begin', 'Meet', 'Welcome to', 'Say hello to'],
    urgent: ['Get', 'Claim', 'Grab', 'Start', 'Reserve', 'Lock in', 'Snag', 'Don\u2019t miss', 'Hurry — get', 'Act now — get'],
    playful: ['Hop on', 'Dive into', 'Snag', 'Treat yourself to', 'Say yes to', 'Jump into', 'Unleash', 'Taste', 'Peek at', 'High-five']
  };
  var ACTION_WORDS = {
    'sign up': ['your free account', 'in seconds', 'today', 'now — it\u2019s free'],
    'buy': ['now', 'yours today', 'it before it\u2019s gone', 'with one click'],
    'download': ['the free guide', 'now', 'instantly', 'your copy'],
    'subscribe': ['to the newsletter', 'for weekly wins', 'now', 'and never miss out'],
    'learn more': ['about us', 'how it works', 'the details', 'what\u2019s inside'],
    'book now': ['your spot', 'a free call', 'today', 'before it fills up'],
    'start trial': ['free for 14 days', 'with no card required', 'today', 'risk-free'],
    'contact us': ['the team', 'us today', 'for a quote', '— we reply fast']
  };
  var SUFFIX = {
    bold: ['', ' \u2192', '!', ' — you\u2019ve earned it', ''],
    friendly: ['', ' \u263a', ' — we\u2019d love to have you', '!', ''],
    urgent: [' — today only', ' before it\u2019s gone', ' now!', ' — ends soon', ''],
    playful: [' \uD83C\uDF89', ' — let\u2019s go!', '!', ' \u2728', '']
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

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
      val.style.fontWeight = '600';
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
      var action = TN.el(SLUG + '-action').value;
      var tone = TN.el(SLUG + '-tone').value;
      var verbs = VERBS[tone] || VERBS.bold;
      var words = ACTION_WORDS[action] || ACTION_WORDS['sign up'];
      var suffixes = SUFFIX[tone] || SUFFIX.bold;
      var seen = {}, out = [], guard = 0;
      while (out.length < 12 && guard < 400) {
        guard++;
        var c = cap(pick(verbs) + ' ' + pick(words) + pick(suffixes));
        if (!seen[c]) { seen[c] = true; out.push(c); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate CTAs. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
