/* Password Strength Meter — charset×length entropy, crack-time estimate, concrete feedback. */
(function () {
  'use strict';
  var SLUG = 'password-strength-meter';
  var COMMON = ['password', '123456', '123456789', 'qwerty', 'abc123', 'letmein', 'welcome',
    'admin', 'monkey', 'dragon', 'football', 'master', 'login', 'princess', 'solo',
    'iloveyou', 'starwars', 'trustno1', 'superman', 'qwerty123', '1q2w3e4r', '000000',
    'passw0rd', 'password1', '123123', '654321', 'charlie', 'aa123456', 'donald'];

  function el(id) { return document.getElementById(id); }

  function humanTime(seconds) {
    if (!isFinite(seconds)) return 'heat death of the universe';
    var units = [[31557600000, 'billion years'], [31557600, 'years'], [86400, 'days'],
      [3600, 'hours'], [60, 'minutes'], [1, 'seconds']];
    for (var i = 0; i < units.length; i++) {
      if (seconds >= units[i][0]) {
        var v = seconds / units[i][0];
        return (v >= 100 ? Math.round(v) : v.toFixed(1)) + ' ' + units[i][1];
      }
    }
    return 'instantly';
  }

  function analyze(pw) {
    var feedback = [];
    var hasLower = /[a-z]/.test(pw), hasUpper = /[A-Z]/.test(pw),
        hasDigit = /\d/.test(pw), hasSym = /[^A-Za-z0-9]/.test(pw),
        hasUnicode = /[^\x00-\x7F]/.test(pw);
    var charset = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasDigit ? 10 : 0) +
                  (hasSym ? 33 : 0) + (hasUnicode ? 1000 : 0);
    var bits = pw.length ? pw.length * Math.log2(charset || 1) : 0;
    // penalties / feedback
    if (!pw.length) feedback.push('Type a password to analyze it.');
    if (pw.length && pw.length < 12) feedback.push('Too short — use at least 12 characters (16+ is better).');
    if (pw.length >= 16) feedback.push('Good length (' + pw.length + ' characters).');
    if (!hasLower) feedback.push('Add lowercase letters.');
    if (!hasUpper) feedback.push('Add UPPERCASE letters.');
    if (!hasDigit) feedback.push('Add digits.');
    if (!hasSym) feedback.push('Add symbols like !@#$%.');
    var low = pw.toLowerCase();
    if (COMMON.some(function (c) { return low.indexOf(c) >= 0; }))
      feedback.push('Contains a very common password fragment — attackers try these first.');
    if (/(.)\1\1/.test(pw)) feedback.push('Avoid repeated characters like "aaa".');
    if (/(012|123|234|345|456|567|678|789|abc|bcd|cde|def)/.test(low))
      feedback.push('Avoid sequences like "123" or "abc".');
    if (/^(.)\1+$/.test(pw) && pw.length) feedback.push('A single repeated character has almost no entropy.');
    var crack = Math.pow(2, Math.max(0, bits - 1)) / 1e10; // 10B guesses/sec
    var score, label, color;
    if (!pw.length) { score = '—'; label = ''; color = '#c62828'; }
    else if (bits < 40) { score = 'Weak'; color = '#c62828'; }
    else if (bits < 60) { score = 'Fair'; color = '#ef6c00'; }
    else if (bits < 80) { score = 'Strong'; color = '#2e7d32'; }
    else { score = 'Excellent'; color = '#1b5e20'; }
    return { bits: bits, crack: crack, score: score, color: color, feedback: feedback,
             charset: charset, len: pw.length };
  }

  function render() {
    var pw = el(SLUG + '-input').value;
    var r = analyze(pw);
    el(SLUG + '-bits').textContent = r.bits.toFixed(1);
    el(SLUG + '-time').textContent = pw.length ? humanTime(r.crack) : '—';
    el(SLUG + '-score').textContent = r.score;
    var bar = el(SLUG + '-bar');
    bar.style.width = Math.min(100, r.bits / 128 * 100) + '%';
    bar.style.background = r.color;
    var ul = el(SLUG + '-feedback');
    ul.innerHTML = '';
    r.feedback.forEach(function (f) {
      var li = document.createElement('li');
      li.textContent = f;
      ul.appendChild(li);
    });
  }

  try {
    TN.on(SLUG + '-input', 'input', render);
    render();
  } catch (e) { /* never throw on load */ }
})();
