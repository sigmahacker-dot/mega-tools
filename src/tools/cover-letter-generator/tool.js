/* Cover Letter Generator — tailored letter from role/company/skills/experience. */
(function () {
  'use strict';
  var SLUG = 'cover-letter-generator';

  var current = '';

  function skillList(raw) {
    var parts = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return parts.slice(0, 6);
  }
  function joinSkills(skills) {
    if (!skills.length) return 'a strong and relevant skill set';
    if (skills.length === 1) return skills[0];
    if (skills.length === 2) return skills[0] + ' and ' + skills[1];
    return skills.slice(0, -1).join(', ') + ', and ' + skills[skills.length - 1];
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var name = TN.el(SLUG + '-name').value.trim() || '[Your Name]';
        var role = TN.el(SLUG + '-role').value.trim() || '[Role]';
        var company = TN.el(SLUG + '-company').value.trim() || '[Company]';
        var exp = TN.el(SLUG + '-exp').value;
        var tone = TN.el(SLUG + '-tone').value;
        var opening = TN.el(SLUG + '-opening').value.trim();
        var skills = joinSkills(skillList(TN.el(SLUG + '-skills').value));

        var L = [];
        L.push('Dear Hiring Manager,');
        L.push('');
        if (tone === 'enthusiastic') {
          L.push('I was thrilled to see the opening for ' + role + ' at ' + company + ' — it reads like it was written for me.');
        } else if (tone === 'concise') {
          L.push('I am applying for the ' + role + ' position at ' + company + '.');
        } else {
          L.push('I am writing to apply for the position of ' + role + ' at ' + company + '.');
        }
        if (opening) { L.push(''); L.push(opening); }
        L.push('');
        if (tone === 'concise') {
          L.push('With ' + exp + ' years of experience and strengths in ' + skills + ', I am confident I can contribute from day one.');
        } else {
          L.push('With ' + exp + ' years of experience, I bring ' + skills + ' to the table. In my current role I have consistently delivered results by combining hands-on execution with a focus on outcomes that matter to the business.');
          L.push('');
          if (tone === 'enthusiastic') {
            L.push('What excites me most about ' + company + ' is the chance to do career-defining work with a team that clearly cares about craft. I would love to bring my energy and experience to your mission.');
          } else {
            L.push('I am drawn to ' + company + ' because of its reputation for excellence, and I am confident my background aligns strongly with what this role requires.');
          }
        }
        L.push('');
        L.push('Thank you for your time and consideration. I would welcome the opportunity to discuss how I can contribute to ' + company + '.');
        L.push('');
        L.push('Sincerely,');
        L.push(name);
        current = L.join('\n');
        TN.el(SLUG + '-output').textContent = current;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not write the letter. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your letter first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your letter first.'); return; }
      TN.downloadText(current, 'cover-letter.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
