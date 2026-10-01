(function () {
  'use strict';
  var P = 'blog-title-generator-', ERR = P + 'error';
  var TPL = [
    '10 Proven {K} Strategies That Actually Work', 'The Ultimate Guide to {K} in 2026',
    'How to Master {K}: A Step-by-Step Guide', '7 {K} Mistakes You Need to Stop Making',
    '{K}: Everything You Need to Know', '15 {K} Tips From Industry Experts',
    'Why {K} Matters More Than Ever', 'The Beginner\'s Guide to {K}',
    '{K} vs. The Alternatives: An Honest Comparison', 'How We Grew With {K}: A Case Study',
    '21 {K} Ideas to Try This Year', 'The Truth About {K} Nobody Tells You',
    '5-Minute {K} Wins for Busy People', '{K} Checklist: Don\'t Launch Without This',
    'What Is {K}? A Simple Explanation', 'How Much Does {K} Really Cost?',
    'The Future of {K}: 6 Trends to Watch', '{K} for Beginners: Start Here',
    '9 {K} Tools That Save Hours Every Week', 'Is {K} Worth It? Pros and Cons',
    'The {K} Playbook: From Zero to Results', 'Common {K} Myths, Debunked',
    '{K} Statistics: 25 Numbers That Matter', 'How to Choose the Right {K} for You'
  ];
  var TONE_TWEAK = {
    pro: ['A Professional Framework for {K}', 'Enterprise {K}: Best Practices for 2026'],
    casual: ['{K} Made Simple (Finally)', 'Let\'s Talk About {K}, Honestly'],
    bold: ['{K} Is Broken. Here\'s the Fix', 'Stop Doing {K} Wrong'],
    curious: ['What Happens When You Try {K} for 30 Days?', 'We Tested {K} So You Don\'t Have To']
  };
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function render() {
    try {
      TN.clearErr(ERR);
      var kw = (TN.el(P + 'keyword').value || '').trim();
      var tone = TN.el(P + 'tone').value;
      var body = TN.el(P + 'body');
      if (!kw) {
        body.innerHTML = '<tr><td colspan="3" class="muted">Enter a keyword to generate titles.</td></tr>';
        return;
      }
      var K = cap(kw);
      var list = TPL.concat(TONE_TWEAK[tone] || []).slice(0, 26);
      body.innerHTML = list.map(function (t, i) {
        var title = t.split('{K}').join(K);
        return '<tr><td>' + (i + 1) + '</td><td>' + TN.esc(title) + '</td>' +
          '<td><button type="button" class="btn btn-outline btn-sm" data-i="' + i + '">Copy</button></td></tr>';
      }).join('');
      var titles = list.map(function (t) { return t.split('{K}').join(K); });
      var btns = body.querySelectorAll('button[data-i]');
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          TN.on(b, 'click', function () {
            TN.copy(titles[parseInt(b.getAttribute('data-i'), 10)]).then(function () {
              b.textContent = 'Copied';
              setTimeout(function () { b.textContent = 'Copy'; }, 1000);
            });
          });
        })(btns[i]);
      }
    } catch (e) { TN.setErr(ERR, 'Could not generate titles. Please try again.'); }
  }
  try {
    TN.on(P + 'keyword', 'input', TN.debounce(render, 200));
    TN.on(P + 'tone', 'change', render);
    render();
  } catch (e) { /* never throw on load */ }
})();
