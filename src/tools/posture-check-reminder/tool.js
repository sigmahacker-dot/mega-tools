/* Posture check reminder: interval banner + optional Notification API, rotating tips. */
(function () {
  'use strict';
  var SLUG = 'posture-check-reminder';
  function $(id) { return document.getElementById(id); }
  var TIPS = [
    '🪑 Sit back fully — let the chair backrest support your lower back.',
    '👀 Screen check: top of the monitor at eye level, an arm\u2019s length away.',
    '💪 Drop your shoulders away from your ears and unclench your jaw.',
    '🦶 Feet flat on the floor, knees roughly at 90\u00B0.',
    '⌨️ Wrists straight and floating — not bent up on the desk edge.',
    '🧍 Stand up! Walk, stretch, or do 10 shoulder rolls right now.',
    '🫁 Take 3 slow deep breaths and relax your stomach muscles.',
    '📱 Chin check: tuck it slightly — stop craning toward the screen.',
    '🦵 Uncross your legs and shift your weight evenly.',
    '💧 Drink a glass of water while you reset your posture.'
  ];
  var timer = null, ti = 0, notify = false;
  function showTip() {
    var tip = TIPS[ti % TIPS.length];
    ti++;
    var b = $(SLUG + '-banner');
    b.innerHTML = '<strong>⏰ Posture check!</strong><br>' + tip;
    b.classList.remove('hidden');
    if (notify && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('Posture check!', { body: tip.replace(/^[^\s]+\s/, '') }); } catch (e) {}
    }
  }
  function stop(silent) {
    if (timer) { clearInterval(timer); timer = null; }
    if (!silent) $(SLUG + '-status').textContent = 'Reminders are off.';
  }
  function start() {
    $(SLUG + '-error').textContent = '';
    var mins = parseFloat($(SLUG + '-mins').value);
    if (isNaN(mins) || mins < 1 || mins > 240) { $(SLUG + '-error').textContent = 'Enter an interval of 1–240 minutes.'; return; }
    stop(true);
    ti = 0;
    showTip(); // immediate first check
    timer = setInterval(showTip, mins * 60000);
    $(SLUG + '-status').textContent = '✅ Reminders on — every ' + mins + ' minute' + (mins === 1 ? '' : 's') + '. Keep this tab open.';
  }
  function enableNotify() {
    if (!('Notification' in window)) { $(SLUG + '-error').textContent = 'This browser does not support notifications.'; return; }
    var done = function (perm) {
      notify = (perm === 'granted');
      $(SLUG + '-error').textContent = notify ? '' : 'Notification permission was not granted — the on-page banner still works.';
    };
    try {
      var p = Notification.requestPermission();
      if (p && p.then) p.then(done);
      else done(Notification.permission);
    } catch (e) { $(SLUG + '-error').textContent = 'Could not request notification permission.'; }
  }
  try {
    $(SLUG + '-start').addEventListener('click', start);
    $(SLUG + '-stop').addEventListener('click', function () { stop(false); });
    $(SLUG + '-notify').addEventListener('click', enableNotify);
  } catch (e) { /* never throw on load */ }
})();
