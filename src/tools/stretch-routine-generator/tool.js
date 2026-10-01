/* Stretch routine generator: focus + duration -> ordered timed steps. */
(function () {
  'use strict';
  var SLUG = 'stretch-routine-generator';
  function $(id) { return document.getElementById(id); }
  var ROUTINES = {
    neck: [
      ['Neck tilts', 30, 'Slowly tilt your right ear toward your right shoulder. Hold, then switch sides.'],
      ['Neck rotations', 30, 'Gently roll your chin across your chest from shoulder to shoulder.'],
      ['Shoulder shrugs', 30, 'Lift shoulders to ears, squeeze 5 seconds, then drop and relax. Repeat.'],
      ['Cross-body shoulder stretch', 40, 'Pull your right arm across your chest with the left hand. Hold, then switch.'],
      ['Chest doorway stretch', 40, 'Place forearms on a doorframe, step through gently until you feel a chest stretch.'],
      ['Upper trap stretch', 40, 'Sit tall, gently pull your head sideways with your hand. Switch sides.']
    ],
    back: [
      ['Cat-cow', 45, 'On all fours, alternate arching and rounding your back with slow breaths.'],
      ['Child\u2019s pose', 45, 'Knees wide, arms extended forward, sink your chest toward the floor.'],
      ['Seated spinal twist', 40, 'Sit tall, twist right with left hand on right knee. Hold, then switch.'],
      ['Figure-4 hip stretch', 45, 'Lie on your back, cross right ankle over left knee, pull the left thigh in. Switch.'],
      ['Knee-to-chest', 40, 'Hug one knee to your chest while lying down. Switch legs.'],
      ['Cobra stretch', 30, 'Lie face down, press your chest up with your hands, hips stay grounded.']
    ],
    legs: [
      ['Standing quad stretch', 40, 'Hold a wall, pull your right foot to your glute. Switch legs.'],
      ['Hamstring fold', 45, 'Hinge at the hips, reach toward your toes with a soft knee bend.'],
      ['Calf stretch', 40, 'Step one foot back, press the heel down against a wall. Switch.'],
      ['Hip flexor lunge', 45, 'Kneel in a lunge, tuck your pelvis and push hips forward. Switch.'],
      ['Seated hamstring stretch', 40, 'Sit with one leg extended, hinge forward over it. Switch.'],
      ['Ankle circles', 30, 'Lift one foot and slowly circle the ankle both directions. Switch.']
    ],
    full: [
      ['Neck tilts', 25, 'Ear to shoulder, slow and gentle, both sides.'],
      ['Shoulder rolls', 25, 'Big slow circles forward, then backward.'],
      ['Cat-cow', 35, 'On all fours, flow between arch and round with your breath.'],
      ['Standing side bend', 30, 'Reach one arm overhead and lean gently sideways. Switch.'],
      ['Hip flexor lunge', 35, 'Half-kneeling lunge, push hips forward. Switch.'],
      ['Hamstring fold', 35, 'Hinge forward, soft knees, let your head hang.'],
      ['Figure-4 hip stretch', 35, 'Seated or lying, open one hip at a time.'],
      ['Child\u2019s pose', 40, 'Finish resting: knees wide, arms long, breathe deeply.']
    ]
  };
  function gen() {
    $(SLUG + '-error').textContent = '';
    var focus = $(SLUG + '-focus').value;
    var mins = parseInt($(SLUG + '-dur').value, 10);
    var steps = ROUTINES[focus] || ROUTINES.full;
    var totalSec = mins * 60;
    var per = Math.max(20, Math.round(totalSec / steps.length / 5) * 5);
    var html = '<p><strong>' + mins + '-minute ' + $(SLUG + '-focus').selectedOptions[0].textContent +
      ' routine</strong> — about ' + per + 's per step</p><ol>';
    steps.forEach(function (s) {
      html += '<li><strong>' + s[0] + '</strong> <span class="muted">(' + per + 's)</span><br><span class="muted">' + s[2] + '</span></li>';
    });
    html += '</ol><p class="hint">Breathe slowly through each stretch; never bounce or force range.</p>';
    var box = $(SLUG + '-out');
    box.innerHTML = html;
    box.classList.remove('hidden');
  }
  try {
    $(SLUG + '-gen').addEventListener('click', gen);
    gen();
  } catch (e) { /* never throw on load */ }
})();
