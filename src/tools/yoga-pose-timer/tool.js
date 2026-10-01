/* Yoga pose timer: preset sequences with per-pose countdown + next-pose display. */
(function () {
  'use strict';
  var SLUG = 'yoga-pose-timer';
  function $(id) { return document.getElementById(id); }
  var SEQS = {
    sun: [
      ['Tadasana (Mountain)', 20, 'Stand tall, feet together, arms relaxed. Breathe.'],
      ['Urdhva Hastasana', 20, 'Inhale, sweep arms overhead, lengthen the spine.'],
      ['Uttanasana (Forward fold)', 25, 'Exhale, fold forward, soft knees, head heavy.'],
      ['Ardha Uttanasana', 15, 'Halfway lift, flat back, fingertips to shins.'],
      ['Plank', 25, 'Step back, body in one straight line, core braced.'],
      ['Chaturanga / Knees-down', 15, 'Lower halfway with control, elbows hugging ribs.'],
      ['Cobra', 20, 'Press chest forward and up, shoulders away from ears.'],
      ['Downward Dog', 40, 'Hips high, heels reaching down, breathe deeply.'],
      ['Ardha Uttanasana', 15, 'Step forward, halfway lift, flat back.'],
      ['Uttanasana (Forward fold)', 20, 'Fold, release the neck.'],
      ['Urdhva Hastasana', 15, 'Rise with a flat back, arms sweep overhead.'],
      ['Tadasana (Mountain)', 15, 'Hands to heart. One round complete.']
    ],
    moon: [
      ['Tadasana (Mountain)', 20, 'Stand tall, ground through your feet.'],
      ['Urdhva Hastasana side bend (R)', 25, 'Arms up, lean gently right.'],
      ['Urdhva Hastasana side bend (L)', 25, 'Lean gently left.'],
      ['Goddess pose', 30, 'Wide stance, knees bent, arms cactus.'],
      ['Star pose', 15, 'Straighten legs, arms wide.'],
      ['Triangle (R)', 30, 'Hinge right, right hand to shin, left arm up.'],
      ['Pyramid (R)', 25, 'Fold over the straight right leg.'],
      ['Low lunge (R)', 25, 'Right knee bent, back knee down, arms up.'],
      ['Low lunge (L)', 25, 'Switch sides.'],
      ['Pyramid (L)', 25, 'Fold over the straight left leg.'],
      ['Triangle (L)', 30, 'Hinge left, left hand to shin.'],
      ['Star pose', 15, 'Arms wide, breathe.'],
      ['Goddess pose', 25, 'Sink low once more.'],
      ['Tadasana (Mountain)', 20, 'Hands to heart. Sequence complete.']
    ]
  };
  var timer = null, idx = 0, left = 0, running = false;
  function show(i) {
    var seq = SEQS[$(SLUG + '-seq').value];
    var p = seq[i];
    $(SLUG + '-pose').textContent = (i + 1) + '/' + seq.length + ' — ' + p[0];
    $(SLUG + '-tip').textContent = p[2];
    var nx = seq[i + 1];
    $(SLUG + '-next').textContent = nx ? 'Next: ' + nx[0] + ' (' + nx[1] + 's)' : 'Next: finish 🎉';
    $(SLUG + '-count').textContent = left;
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } running = false; }
  function step() {
    var seq = SEQS[$(SLUG + '-seq').value];
    left--;
    if (left <= 0) {
      idx++;
      if (idx >= seq.length) {
        stopTimer();
        $(SLUG + '-count').textContent = '✓';
        $(SLUG + '-next').textContent = 'Sequence complete — well done!';
        return;
      }
      left = seq[idx][1];
    }
    show(idx);
  }
  function start() {
    stopTimer();
    var seq = SEQS[$(SLUG + '-seq').value];
    idx = 0; left = seq[0][1]; running = true;
    show(0);
    timer = setInterval(step, 1000);
  }
  function stop() {
    stopTimer();
    $(SLUG + '-next').textContent = 'Stopped. Press Start to begin again.';
  }
  try {
    $(SLUG + '-start').addEventListener('click', start);
    $(SLUG + '-stop').addEventListener('click', stop);
    $(SLUG + '-seq').addEventListener('change', function () {
      stopTimer();
      $(SLUG + '-count').textContent = '–';
      $(SLUG + '-pose').textContent = 'Ready';
      $(SLUG + '-next').textContent = 'Next: –';
      $(SLUG + '-tip').textContent = '';
    });
  } catch (e) { /* never throw on load */ }
})();
