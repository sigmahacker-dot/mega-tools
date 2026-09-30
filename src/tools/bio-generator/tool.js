/* Bio Generator — template-based bio variants */
(function () {
  'use strict';
  var nameEl = TN.el('bio-generator-name');
  var profEl = TN.el('bio-generator-profession');
  var intEl = TN.el('bio-generator-interests');
  var toneEl = TN.el('bio-generator-tone');
  var list = TN.el('bio-generator-list');
  if (!nameEl || !profEl || !toneEl || !list) return;

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function article(w) {
    if (!w) return 'a';
    return /^[aeiou]/i.test(w.trim()) ? 'an' : 'a';
  }
  function interests() {
    var raw = intEl ? intEl.value : '';
    return raw.split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 0; });
  }
  function pickN(arr, n) {
    var a = arr.slice().sort(function () { return Math.random() - 0.5; });
    return a.slice(0, n);
  }

  var TEMPLATES = {
    professional: [
      function (n, p, ins) { return n + ' | ' + cap(p) + ' turning ideas into results. ' + ins.join(' · ') + ' enthusiast. DM open for collaborations.'; },
      function (n, p, ins) { return cap(article(p)) + ' ' + p + ' passionate about ' + ins.slice(0, 2).join(' and ') + '. Sharing insights on ' + p + (ins[2] ? ' and ' + ins[2] : '') + '. Let\u2019s connect.'; },
      function (n, p, ins) { return 'Hi, I\u2019m ' + n + ' \u2014 ' + article(p) + ' ' + p + ' focused on ' + ins.join(', ') + '. New posts every week.'; },
      function (n, p, ins) { return n + ' | ' + cap(p) + '\n' + ins.join(' · ') + '\nDM for business inquiries.'; }
    ],
    funny: [
      function (n, p, ins) { return n + ' | Professional ' + p + ' by day, ' + ins[0] + ' enthusiast by night. Powered by ' + (ins[1] || 'coffee') + ' and poor decisions.'; },
      function (n, p, ins) { return 'Warning: ' + n + ' talks about ' + ins[0] + ' way too much. ' + cap(p) + ' (allegedly). ' + cap(ins[1] || 'memes') + ' apologist.'; },
      function (n, p, ins) { return n + ' \u2014 I ' + p + ' for a living and ' + ins[0] + ' for fun. Hobbies include ' + (ins[1] || 'napping') + ' and avoiding responsibilities.'; },
      function (n, p, ins) { return 'Part-time ' + p + ', full-time ' + ins[0] + ' lover. ' + n + ' does not share ' + (ins[1] || 'snacks') + '. You\u2019ve been warned.'; }
    ],
    minimalist: [
      function (n, p, ins) { return n + ' \u2014 ' + p + '.'; },
      function (n, p, ins) { return n + ' | ' + ins.slice(0, 2).join(' · '); },
      function (n, p, ins) { return cap(p) + '. ' + cap(ins[0]) + '. ' + cap(ins[1] || 'More soon') + '.'; },
      function (n, p, ins) { return n + ' · ' + p + ' · ' + ins[0]; }
    ],
    inspirational: [
      function (n, p, ins) { return n + ' | ' + cap(p) + ' chasing dreams and ' + ins[0] + '. Every day is a new page \u2014 make yours count.'; },
      function (n, p, ins) { return 'Dream big, start small. I\u2019m ' + n + ', ' + article(p) + ' ' + p + ' on a journey through ' + ins.slice(0, 2).join(' and ') + '.'; },
      function (n, p, ins) { return n + ' \u2014 turning ' + ins[0] + ' into purpose. ' + cap(p) + ' by craft, dreamer by heart.'; },
      function (n, p, ins) { return 'Your story matters. I\u2019m ' + n + ', ' + article(p) + ' ' + p + ' sharing ' + ins.slice(0, 2).join(', ') + ' and lessons along the way.'; }
    ]
  };

  function generate() {
    try {
      TN.clearErr('bio-generator-error');
      var n = nameEl.value.trim();
      var p = profEl.value.trim().toLowerCase();
      if (!n) { TN.setErr('bio-generator-error', 'Please enter your name.'); return; }
      if (!p) { TN.setErr('bio-generator-error', 'Please enter your profession.'); return; }
      var ins = interests();
      if (ins.length < 2) ins = ins.concat(['creativity', 'good vibes']).slice(0, 2);
      if (ins.length < 3) ins.push('new adventures');
      var tone = toneEl.value;
      var tpl = TEMPLATES[tone] || TEMPLATES.professional;
      list.innerHTML = '';
      tpl.forEach(function (fn, i) {
        var bio = fn(n, p, pickN(ins, 3));
        var row = document.createElement('div');
        row.className = 'copy-row mt';
        var res = document.createElement('div');
        res.className = 'result';
        res.style.whiteSpace = 'pre-line';
        var label = document.createElement('div');
        label.className = 'muted';
        label.style.fontSize = '.78rem';
        label.textContent = 'Bio ' + (i + 1);
        var val = document.createElement('div');
        val.textContent = bio;
        res.appendChild(label);
        res.appendChild(val);
        var btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-sm';
        btn.type = 'button';
        btn.textContent = 'Copy';
        btn.addEventListener('click', function () {
          TN.copy(bio).then(function (ok) {
            btn.textContent = ok ? 'Copied ✓' : 'Copy';
            if (!ok) TN.setErr('bio-generator-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
            setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
          });
        });
        res.style.cursor = 'pointer';
        res.addEventListener('click', function () { btn.click(); });
        row.appendChild(res);
        row.appendChild(btn);
        list.appendChild(row);
      });
    } catch (e) {
      TN.setErr('bio-generator-error', 'Could not generate bios. Please try again.');
    }
  }

  TN.on('bio-generator-generate', 'click', generate);
})();
