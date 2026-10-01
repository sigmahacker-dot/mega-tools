(function () {
  'use strict';
  var ERR = 'workout-plan-generator-error';
  var lastPlan = null;
  var EX = {
    gym: {
      push: ['Barbell Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Dips', 'Cable Fly'],
      pull: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Face Pulls', 'Barbell Curl'],
      legs: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Walking Lunges', 'Standing Calf Raise', 'Leg Curl'],
      core: ['Hanging Leg Raise', 'Cable Crunch', 'Plank'],
      cardio: ['Treadmill Intervals', 'Rowing Machine', 'Assault Bike']
    },
    dumbbell: {
      push: ['Dumbbell Bench Press', 'Standing Dumbbell Press', 'Push-ups', 'Dumbbell Fly'],
      pull: ['One-Arm Dumbbell Row', 'Dumbbell Pullover', 'Reverse Fly', 'Dumbbell Curl', 'Hammer Curl'],
      legs: ['Goblet Squat', 'Dumbbell Romanian Deadlift', 'Dumbbell Lunges', 'Dumbbell Step-ups', 'Dumbbell Calf Raise'],
      core: ['Dumbbell Russian Twist', 'Weighted Sit-ups', 'Plank'],
      cardio: ['Dumbbell Thrusters', 'Burpees', 'Jump Rope']
    },
    body: {
      push: ['Push-ups', 'Pike Push-ups', 'Diamond Push-ups', 'Dips (chair)'],
      pull: ['Pull-ups / Doorway Rows', 'Superman Pulls', 'Towel Rows'],
      legs: ['Bodyweight Squats', 'Walking Lunges', 'Glute Bridges', 'Calf Raises', 'Wall Sit'],
      core: ['Plank', 'Mountain Climbers', 'Bicycle Crunches', 'Leg Raises'],
      cardio: ['Burpees', 'Jumping Jacks', 'High Knees', 'Jump Rope']
    }
  };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var SPLITS = {
    2: ['Full Body A', 'Full Body B'],
    3: ['Full Body A', 'Full Body B', 'Full Body C'],
    4: ['Upper', 'Lower', 'Push', 'Pull'],
    5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
    6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']
  };
  function scheme(goal, level) {
    var base = { strength: { sets: 5, reps: '5', rest: '3 min' }, muscle: { sets: 4, reps: '8–12', rest: '90 sec' }, fat: { sets: 3, reps: '12–15', rest: '45 sec' }, endurance: { sets: 3, reps: '15–20', rest: '30 sec' } }[goal];
    if (level === 'beginner') return { sets: Math.max(2, base.sets - 1), reps: base.reps, rest: base.rest };
    return base;
  }
  function pick(pool, n) {
    var c = pool.slice();
    for (var i = c.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = c[i]; c[i] = c[j]; c[j] = t; }
    return c.slice(0, Math.min(n, c.length));
  }
  function dayExercises(kind, equip, goal, n) {
    var E = EX[equip], out = [];
    if (kind === 'Full Body A' || kind === 'Full Body B' || kind === 'Full Body C') {
      out = out.concat(pick(E.push, 1), pick(E.legs, 2), pick(E.pull, 1), pick(E.core, 1));
    } else if (kind === 'Upper') {
      out = out.concat(pick(E.push, 2), pick(E.pull, 2), pick(E.core, 1));
    } else if (kind === 'Lower') {
      out = out.concat(pick(E.legs, 4), pick(E.core, 1));
    } else if (kind === 'Push') {
      out = out.concat(pick(E.push, 3), pick(E.core, 1));
    } else if (kind === 'Pull') {
      out = out.concat(pick(E.pull, 3), pick(E.core, 1));
    } else if (kind === 'Legs') {
      out = out.concat(pick(E.legs, 4), pick(E.core, 1));
    }
    if (goal === 'fat') out = out.concat(pick(E.cardio, 1).map(function (x) { return x + ' (finisher)'; }));
    return out.slice(0, n || 6);
  }
  function generate() {
    TN.clearErr(ERR);
    var goal = TN.el('wo-goal').value, days = parseInt(TN.el('wo-days').value, 10),
        equip = TN.el('wo-equip').value, level = TN.el('wo-level').value;
    var s = scheme(goal, level);
    var kinds = SPLITS[days];
    var plan = kinds.map(function (kind) {
      return { kind: kind, ex: dayExercises(kind, equip, goal, level === 'beginner' ? 5 : 6) };
    });
    lastPlan = { plan: plan, s: s, goal: goal, days: days, equip: equip, level: level };
    var goalName = TN.el('wo-goal').options[TN.el('wo-goal').selectedIndex].text;
    var html = '<p><strong>' + esc(goalName) + '</strong> <span class="muted">· ' + days + ' days/week · ' +
      esc(TN.el('wo-equip').options[TN.el('wo-equip').selectedIndex].text) + ' · ' + esc(level) + '</span></p>';
    plan.forEach(function (d, i) {
      html += '<h4 style="margin:14px 0 6px">Day ' + (i + 1) + ' — ' + esc(d.kind) + '</h4>';
      html += '<table class="data"><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Rest</th></tr></thead><tbody>';
      d.ex.forEach(function (e) {
        html += '<tr><td>' + esc(e) + '</td><td>' + s.sets + '</td><td>' + s.reps + '</td><td>' + s.rest + '</td></tr>';
      });
      html += '</tbody></table>';
    });
    html += '<p class="note">Warm up 5–10 minutes before each session and progress the weight or reps a little every week.</p>';
    TN.el('wo-plan').innerHTML = html;
  }
  try {
    TN.on('wo-go', 'click', generate);
    TN.on('wo-dl', 'click', function () {
      if (!lastPlan) { TN.setErr(ERR, 'Generate a program first.'); return; }
      TN.clearErr(ERR);
      var lines = ['WORKOUT PROGRAM', 'Goal: ' + lastPlan.goal + ' | ' + lastPlan.days + ' days/week | ' + lastPlan.equip + ' | ' + lastPlan.level, ''];
      lastPlan.plan.forEach(function (d, i) {
        lines.push('DAY ' + (i + 1) + ' — ' + d.kind.toUpperCase());
        d.ex.forEach(function (e) { lines.push('  ' + lastPlan.s.sets + ' x ' + lastPlan.s.reps + '  ' + e + '  (rest ' + lastPlan.s.rest + ')'); });
        lines.push('');
      });
      var b = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'workout-program.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    });
    TN.el('wo-plan').innerHTML = '<p class="muted">Choose your settings and press Generate program.</p>';
  } catch (e) { /* never throw on load */ }
})();