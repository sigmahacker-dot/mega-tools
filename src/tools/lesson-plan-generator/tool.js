/* Lesson Plan Generator — objectives/materials/activities/timing → formatted plan. */
(function () {
  'use strict';

  var SLUG = 'lesson-plan-generator';
  var lastPlan = '';

  function lines(s) {
    return s.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  }

  function buildPlan() {
    TN.clearErr(SLUG + '-error');
    var subject = TN.el(SLUG + '-subject').value.trim() || 'General';
    var grade = TN.el(SLUG + '-grade').value.trim();
    var dur = parseInt(TN.el(SLUG + '-dur').value, 10);
    var topic = TN.el(SLUG + '-topic').value.trim() || 'Untitled lesson';
    var objs = lines(TN.el(SLUG + '-obj').value);
    var mats = lines(TN.el(SLUG + '-mat').value);
    var acts = lines(TN.el(SLUG + '-act').value);
    if (isNaN(dur) || dur < 1) { TN.setErr(SLUG + '-error', 'Enter a valid duration in minutes.'); return; }
    if (!acts.length) { TN.setErr(SLUG + '-error', 'Add at least one activity.'); return; }

    var parsed = acts.map(function (a) {
      var parts = a.split('|');
      var mins = parseInt(parts[parts.length - 1], 10);
      if (parts.length > 1 && !isNaN(mins)) {
        return { name: parts.slice(0, -1).join('|').trim(), mins: mins };
      }
      return { name: a, mins: 0 };
    });
    var planned = parsed.reduce(function (a, x) { return a + x.mins; }, 0);

    var out = 'LESSON PLAN\n' + topic + '\n' +
      'Subject: ' + subject + (grade ? ' | Grade: ' + grade : '') + '\n' +
      'Duration: ' + dur + ' minutes\n\n' +
      'LEARNING OBJECTIVES\n' +
      (objs.length ? objs.map(function (o, i) { return (i + 1) + '. ' + o; }).join('\n') : '(none)') + '\n\n' +
      'MATERIALS\n' +
      (mats.length ? mats.map(function (m) { return '- ' + m; }).join('\n') : '(none)') + '\n\n' +
      'SCHEDULE\n';
    var t = 0;
    parsed.forEach(function (a) {
      if (a.mins > 0) {
        var mm = String(t).padStart(2, '0'), mm2 = String(t + a.mins).padStart(2, '0');
        out += '[' + mm + '-' + mm2 + ' min] ' + a.name + ' (' + a.mins + ' min)\n';
        t += a.mins;
      } else {
        out += '[--] ' + a.name + '\n';
      }
    });
    out += '\nPlanned activity time: ' + planned + ' min of ' + dur + ' min lesson';
    if (planned > dur) out += ' — OVER by ' + (planned - dur) + ' min, trim activities.';
    else if (planned < dur) out += ' — ' + (dur - planned) + ' min unplanned buffer.';
    out += '\n\nASSESSMENT\n- Observe participation during activities\n- Review completed work for objective mastery\n\nHOMEWORK / EXTENSION\n- (add as needed)';

    lastPlan = out;
    TN.el(SLUG + '-out').textContent = out;
  }

  function copyPlan() {
    if (!lastPlan) { TN.setErr(SLUG + '-error', 'Generate a plan first.'); return; }
    TN.copy(lastPlan).then(function () {
      TN.clearErr(SLUG + '-error');
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.');
    });
  }

  function downloadPlan() {
    if (!lastPlan) { TN.setErr(SLUG + '-error', 'Generate a plan first.'); return; }
    TN.downloadText(lastPlan, 'lesson-plan.txt', 'text/plain');
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.on(SLUG + '-gen', 'click', buildPlan);
      TN.on(SLUG + '-copy', 'click', copyPlan);
      TN.on(SLUG + '-dl', 'click', downloadPlan);
    } catch (e) { /* never throw on load */ }
  }

  init();
})();