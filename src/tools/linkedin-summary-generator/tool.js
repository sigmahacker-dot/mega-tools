/* LinkedIn Summary Generator — about-section builder from role/skills. */
(function () {
  'use strict';

  var SLUG = 'linkedin-summary-generator';
  var lastSummary = '';

  var HOOKS = {
    professional: 'I help organizations in {industry} achieve measurable results as a {role}.',
    friendly: 'Hi there! I\'m a {role} who genuinely loves working in {industry}. 👋',
    bold: 'I don\'t just work in {industry} — I move it forward as a {role}. 🚀'
  };
  var STORIES = {
    professional: 'With {years} of experience, I specialize in {skills}. My approach is data-driven and outcome-focused.',
    friendly: 'Over the past {years}, I\'ve had the joy of working with {skills} — and I\'m just getting started!',
    bold: '{years} in the game. My weapons: {skills}. My record speaks for itself.'
  };
  var CTAS = {
    professional: 'I\'m always open to connecting with fellow {industry} professionals. Let\'s talk.',
    friendly: 'Want to chat about {industry}, or just say hi? My inbox is open! ☕',
    bold: 'If you want results, not excuses — let\'s connect. 📩'
  };

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function fill(s, map) {
    return s.replace(/\{role\}/g, map.role).replace(/\{industry\}/g, map.industry)
      .replace(/\{years\}/g, map.years).replace(/\{skills\}/g, map.skills);
  }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var role = v('role'), industry = v('industry') || 'my industry';
    var years = v('years'), skills = v('skills'), wins = v('wins'), passion = v('passion');
    var tone = TN.el(SLUG + '-tone').value;
    if (!role) { TN.setErr(SLUG + '-error', 'Enter your current role.'); return; }
    if (!skills) { TN.setErr(SLUG + '-error', 'Enter at least one skill.'); return; }

    var map = { role: role, industry: industry, years: years || 'several years', skills: skills };
    var out = fill(HOOKS[tone], map) + '\n\n' + fill(STORIES[tone], map);
    if (passion) out += ' What drives me: ' + passion + '.';
    if (wins) {
      var list = wins.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      if (list.length) {
        out += '\n\n🏆 Highlights:\n' + list.map(function (w) { return '• ' + w; }).join('\n');
      }
    }
    out += '\n\n' + fill(CTAS[tone], map);
    if (out.length > 2600) out = out.slice(0, 2597) + '…';

    lastSummary = out;
    TN.el(SLUG + '-out').textContent = out;
    TN.el(SLUG + '-count').textContent = out.length + ' / 2600 characters.';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastSummary) { TN.setErr(SLUG + '-error', 'Generate the summary first.'); return; }
        TN.copy(lastSummary).then(function () { TN.clearErr(SLUG + '-error'); })
          .catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();