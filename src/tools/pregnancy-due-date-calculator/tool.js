/* Pregnancy due date calculator: LMP + 280 days (Naegele), week, trimester. */
(function () {
  'use strict';
  var SLUG = 'pregnancy-due-date-calculator';
  function $(id) { return document.getElementById(id); }
  function fdate(d) {
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var v = $(SLUG + '-lmp').value;
    if (!v) { $(SLUG + '-error').textContent = 'Enter the first day of your last period.'; return; }
    var lmp = new Date(v + 'T00:00:00');
    var now = new Date();
    if (lmp > now) { $(SLUG + '-error').textContent = 'That date is in the future.'; return; }
    var due = new Date(lmp.getTime());
    due.setDate(due.getDate() + 280);
    var daysGone = Math.floor((now - lmp) / 86400000);
    var week = Math.floor(daysGone / 7);
    var tri = week < 14 ? 'First' : week < 28 ? 'Second' : 'Third';
    $(SLUG + '-due').textContent = fdate(due);
    $(SLUG + '-out').classList.remove('hidden');
    if (week > 44) {
      $(SLUG + '-week').textContent = '–';
      $(SLUG + '-tri').textContent = '–';
      $(SLUG + '-note').textContent = 'This date is more than 44 weeks ago — likely a past pregnancy or a typo.';
      return;
    }
    var days = daysGone % 7;
    $(SLUG + '-week').textContent = 'Week ' + week + ', day ' + days;
    $(SLUG + '-tri').textContent = tri + ' trimester';
    var left = Math.ceil((due - now) / 86400000);
    $(SLUG + '-note').textContent = left >= 0
      ? 'About ' + left + ' days to go. Estimated conception: ' + fdate(new Date(lmp.getTime() + 14 * 86400000)) + '.'
      : 'Due date has passed — babies often arrive within 2 weeks either side.';
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
