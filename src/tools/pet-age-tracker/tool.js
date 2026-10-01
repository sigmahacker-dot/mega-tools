/* Pet Age Tracker — exact pet age + human-equivalent years (dog 15/9/5, cat 15/9/4). */
(function () {
  'use strict';
  var SLUG = 'pet-age-tracker';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function humanYears(ageY, species) {
    var y1 = 15, y2 = 9, rest = species === 'cat' ? 4 : 5;
    var h = Math.min(ageY, 1) * y1 +
      Math.min(Math.max(ageY - 1, 0), 1) * y2 +
      Math.max(ageY - 2, 0) * rest;
    return h;
  }

  function calc() {
    TN.clearErr(SLUG + '-error');
    var birth = parseDate($('birth').value);
    var name = ($('name').value || '').trim() || 'Your pet';
    if (!birth) { TN.setErr(SLUG + '-error', 'Please enter a valid birthdate.'); return; }
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (birth > today) { TN.setErr(SLUG + '-error', 'Birthdate cannot be in the future.'); return; }

    var y = today.getFullYear() - birth.getFullYear();
    var m = today.getMonth() - birth.getMonth();
    var d = today.getDate() - birth.getDate();
    if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }

    var ageY = (today.getTime() - birth.getTime()) / 86400000 / 365.25;
    var species = $('species').value;
    var hy = humanYears(ageY, species);

    $('years').textContent = y;
    var parts = [];
    if (y) parts.push(y + 'y');
    if (m) parts.push(m + 'm');
    if (d || !parts.length) parts.push(d + 'd');
    $('exact').textContent = parts.join(' ');
    $('human').textContent = hy.toFixed(1) + ' yrs';

    var emoji = species === 'cat' ? '🐱' : '🐶';
    var rule = species === 'cat'
      ? 'Cat rule: 15 human years for year 1, 9 for year 2, 4 per year after.'
      : 'Dog rule: 15 human years for year 1, 9 for year 2, 5 per year after.';
    $('out').innerHTML = '<p>' + emoji + ' <strong>' + esc(name) + '</strong> is <strong>' + parts.join(', ') +
      '</strong> old — about <strong>' + hy.toFixed(1) + ' human years</strong>.</p>' +
      '<p class="muted">' + rule + ' (partial years prorated). A rough guide — size and breed shift real aging.</p>';
  }

  try {
    TN.on(SLUG + '-calc', 'click', calc);
    TN.on(SLUG + '-birth', 'change', calc);
    TN.on(SLUG + '-species', 'change', calc);
  } catch (e) { /* never throw on load */ }
})();
