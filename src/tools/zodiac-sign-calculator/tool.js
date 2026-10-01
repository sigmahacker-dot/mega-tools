(function () {
  'use strict';
  var P = 'zodiac-sign-calculator-';
  var ERR = P + 'error';
  var SIGNS = [
    { name: 'Capricorn', sm: 12, sd: 22, em: 1, ed: 19, dates: 'Dec 22 – Jan 19', element: 'Earth', traits: 'Ambitious, disciplined and patient. Capricorns play the long game — steady climbers who turn plans into results.' },
    { name: 'Aquarius', sm: 1, sd: 20, em: 2, ed: 18, dates: 'Jan 20 – Feb 18', element: 'Air', traits: 'Independent, inventive and humanitarian. Aquarians think in systems and futures, often a few steps ahead of the crowd.' },
    { name: 'Pisces', sm: 2, sd: 19, em: 3, ed: 20, dates: 'Feb 19 – Mar 20', element: 'Water', traits: 'Empathetic, artistic and intuitive. Pisces feel everything deeply and turn emotion into creativity.' },
    { name: 'Aries', sm: 3, sd: 21, em: 4, ed: 19, dates: 'Mar 21 – Apr 19', element: 'Fire', traits: 'Bold, energetic and competitive. Aries charge first and ask questions later — natural starters.' },
    { name: 'Taurus', sm: 4, sd: 20, em: 5, ed: 20, dates: 'Apr 20 – May 20', element: 'Earth', traits: 'Loyal, grounded and comfort-loving. Taurus builds slowly but surely, and fiercely defends what it loves.' },
    { name: 'Gemini', sm: 5, sd: 21, em: 6, ed: 20, dates: 'May 21 – Jun 20', element: 'Air', traits: 'Curious, quick-witted and social. Geminis collect ideas and people, and talk their way through anything.' },
    { name: 'Cancer', sm: 6, sd: 21, em: 7, ed: 22, dates: 'Jun 21 – Jul 22', element: 'Water', traits: 'Protective, intuitive and home-loving. Cancers nurture their people and remember everything.' },
    { name: 'Leo', sm: 7, sd: 23, em: 8, ed: 22, dates: 'Jul 23 – Aug 22', element: 'Fire', traits: 'Confident, generous and dramatic. Leos light up rooms and lead with warmth and flair.' },
    { name: 'Virgo', sm: 8, sd: 23, em: 9, ed: 22, dates: 'Aug 23 – Sep 22', element: 'Earth', traits: 'Analytical, helpful and precise. Virgos notice what everyone misses and fix it quietly.' },
    { name: 'Libra', sm: 9, sd: 23, em: 10, ed: 22, dates: 'Sep 23 – Oct 22', element: 'Air', traits: 'Charming, fair-minded and diplomatic. Libras seek balance and make peace look effortless.' },
    { name: 'Scorpio', sm: 10, sd: 23, em: 11, ed: 21, dates: 'Oct 23 – Nov 21', element: 'Water', traits: 'Intense, focused and magnetic. Scorpios go all in — loyal to the core, formidable when crossed.' },
    { name: 'Sagittarius', sm: 11, sd: 22, em: 12, ed: 21, dates: 'Nov 22 – Dec 21', element: 'Fire', traits: 'Adventurous, optimistic and freedom-loving. Sagittarians chase horizons, ideas and good stories.' }
  ];
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function signFor(m, d) {
    for (var i = 0; i < SIGNS.length; i++) {
      var s = SIGNS[i];
      if ((m === s.sm && d >= s.sd) || (m === s.em && d <= s.ed) || (m > s.sm && m < s.em)) return s;
    }
    return null;
  }
  function calc() {
    var el = g('dob');
    if (!el) return;
    TN.clearErr(ERR);
    if (!el.value) {
      set('sign', '–'); set('element', '–'); set('dates', '–');
      var t = g('traits');
      if (t) { t.textContent = 'Pick your birthdate to reveal your sign.'; t.className = 'center muted'; }
      return;
    }
    var dt = new Date(el.value + 'T00:00:00');
    if (isNaN(dt.getTime())) { TN.setErr(ERR, 'Please pick a valid date.'); return; }
    var s = signFor(dt.getMonth() + 1, dt.getDate());
    if (!s) { TN.setErr(ERR, 'Could not determine a sign for that date.'); return; }
    set('sign', s.name);
    set('element', s.element);
    set('dates', s.dates);
    var t2 = g('traits');
    if (t2) { t2.textContent = s.traits; t2.className = 'center'; }
  }
  try {
    TN.on(P + 'dob', 'input', calc);
    TN.on(P + 'dob', 'change', calc);
  } catch (e) { /* never throw on load */ }
})();
