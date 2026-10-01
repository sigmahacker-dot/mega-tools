/* Desk ergonomics checker: 8 yes/no questions -> score + tailored fixes. */
(function () {
  'use strict';
  var SLUG = 'desk-ergonomics-checker';
  function $(id) { return document.getElementById(id); }
  var QS = [
    ['Is the top of your monitor at or just below eye level?', 'Raise the monitor (books or a stand) so the top edge sits at eye level, about an arm\u2019s length away.'],
    ['Are your feet flat on the floor (or a footrest) with thighs roughly parallel to the floor?', 'Adjust chair height so feet rest flat and knees sit near 90\u00B0; add a footrest if your feet dangle.'],
    ['Does your lower back touch the chair backrest with lumbar support?', 'Add a lumbar roll or rolled towel behind your lower back; sit back fully in the chair.'],
    ['Are your elbows near 90\u00B0 with shoulders relaxed (not hunched)?', 'Lower or raise the chair/keyboard so elbows rest near 90\u00B0 and shoulders stay dropped.'],
    ['Are your wrists straight and floating while typing (not bent up or on a hard edge)?', 'Keep wrists neutral and floating; lower the keyboard or remove wrist pressure on desk edges.'],
    ['Is your mouse at the same height as the keyboard, close to your body?', 'Move the mouse beside the keyboard at elbow height — stop reaching forward for it.'],
    ['Do you take a short movement break at least every 60 minutes?', 'Set an hourly reminder to stand, walk, and stretch for 2–3 minutes.'],
    ['Is your screen free of glare with text large enough to read without leaning in?', 'Reposition the screen away from windows, reduce glare, and increase font size instead of leaning forward.']
  ];
  function build() {
    var box = $(SLUG + '-qs');
    var html = '';
    QS.forEach(function (q, i) {
      html += '<div class="field"><label>' + (i + 1) + '. ' + q[0] + '</label>' +
        '<div class="checkbox-row">' +
        '<label><input type="radio" name="' + SLUG + '-q' + i + '" value="yes"> Yes</label>' +
        '<label style="margin-left:18px"><input type="radio" name="' + SLUG + '-q' + i + '" value="no"> No</label>' +
        '</div></div>';
    });
    box.innerHTML = html;
  }
  function check() {
    $(SLUG + '-error').textContent = '';
    var score = 0, fixes = [], unanswered = 0;
    QS.forEach(function (q, i) {
      var sel = document.querySelector('input[name="' + SLUG + '-q' + i + '"]:checked');
      if (!sel) { unanswered++; return; }
      if (sel.value === 'yes') score++;
      else fixes.push(q[1]);
    });
    if (unanswered) { $(SLUG + '-error').textContent = 'Please answer all 8 questions.'; return; }
    $(SLUG + '-score').textContent = score + '/8';
    var grade = score >= 7 ? 'Excellent' : score >= 5 ? 'Good' : score >= 3 ? 'Needs work' : 'Poor';
    $(SLUG + '-grade').textContent = grade;
    $(SLUG + '-out').classList.remove('hidden');
    var fb = $(SLUG + '-fixes');
    if (fixes.length) {
      var html = '<p><strong>Recommended fixes:</strong></p><ul>';
      fixes.forEach(function (f) { html += '<li>' + f + '</li>'; });
      html += '</ul>';
      fb.innerHTML = html;
    } else {
      fb.innerHTML = '<p><strong>🎉 Perfect setup!</strong> Keep taking those hourly movement breaks.</p>';
    }
    fb.classList.remove('hidden');
  }
  try {
    build();
    $(SLUG + '-check').addEventListener('click', check);
  } catch (e) { /* never throw on load */ }
})();
