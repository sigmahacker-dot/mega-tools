(function () {
  'use strict';
  var P = 'numerology-calculator-';
  var ERR = P + 'error';
  var MEANINGS = {
    1: 'The Leader — independent, pioneering and driven. Ones carve their own path and thrive when they take initiative.',
    2: 'The Diplomat — gentle, cooperative and intuitive. Twos build harmony and make great partners and peacemakers.',
    3: 'The Communicator — expressive, creative and joyful. Threes light up rooms with words, art and humor.',
    4: 'The Builder — practical, loyal and hardworking. Fours create order and lasting foundations.',
    5: 'The Adventurer — freedom-loving, versatile and curious. Fives chase change and learn by doing.',
    6: 'The Nurturer — caring, responsible and warm. Sixes protect home and community.',
    7: 'The Seeker — analytical, introspective and wise. Sevens dig for truth beneath the surface.',
    8: 'The Powerhouse — ambitious, efficient and authoritative. Eights turn vision into material success.',
    9: 'The Humanitarian — compassionate, generous and idealistic. Nines serve the greater good.',
    11: 'Master Number 11 — The Illuminator. Heightened intuition and inspiration; elevens are here to enlighten others.',
    22: 'Master Number 22 — The Master Builder. The most powerful number: turning grand dreams into reality at scale.',
    33: 'Master Number 33 — The Master Teacher. Selfless service, healing and uplifting humanity through love.'
  };
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function letterValue(ch) { return ((ch.charCodeAt(0) - 65) % 9) + 1; }
  function digitSum(n) {
    var s = 0;
    while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
    return s;
  }
  function calc() {
    var el = g('name');
    if (!el) return;
    TN.clearErr(ERR);
    var name = el.value.toUpperCase(), vals = [], i, ch;
    for (i = 0; i < name.length; i++) {
      ch = name.charAt(i);
      if (ch >= 'A' && ch <= 'Z') vals.push({ ch: ch, v: letterValue(ch) });
    }
    if (!vals.length) {
      set('number', '–'); set('total', '–');
      var m0 = g('meaning');
      if (m0) { m0.textContent = 'Type your name to compute your number.'; m0.className = 'center muted'; }
      set('steps', '');
      if (name.trim()) TN.setErr(ERR, 'Please enter at least one letter A–Z.');
      return;
    }
    var total = 0, breakdown = [];
    for (i = 0; i < vals.length; i++) { total += vals[i].v; breakdown.push(vals[i].ch + '=' + vals[i].v); }
    var steps = [total], n = total;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) { n = digitSum(n); steps.push(n); }
    set('number', String(n) + (n === 11 || n === 22 || n === 33 ? ' (master)' : ''));
    set('total', String(total));
    var m1 = g('meaning');
    if (m1) { m1.textContent = MEANINGS[n] || ''; m1.className = 'center'; }
    set('steps', breakdown.join(' + ') + ' = ' + steps.join(' → '));
  }
  try {
    TN.on(P + 'name', 'input', calc);
  } catch (e) { /* never throw on load */ }
})();
