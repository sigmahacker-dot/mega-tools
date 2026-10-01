/* Apology Generator — structured apology: acknowledge, responsibility, amends, promise. */
(function () {
  'use strict';
  var SLUG = 'apology-generator';

  var OPEN = {
    sincere: ['I owe you a real apology.', 'I have been thinking about this, and I need to say sorry properly.', 'You deserve a proper apology from me.'],
    light: ['Okay, I messed up — time for the official apology.', 'Cue the sad music: I owe you a sorry.', 'I come bearing the sincerest of sorries (and snacks, if that helps).'],
    formal: ['Please accept my sincere apologies.', 'I am writing to offer my unreserved apology.', 'I wish to express my deepest regrets.']
  };
  var SITUATION = {
    late: 'being late to {w} and keeping you waiting',
    hurt: 'what I said about {w} — my words were careless and hurtful',
    forgot: 'forgetting {w}, which I know mattered to you',
    broke: 'breaking {w} — I know it was important to you',
    cancelled: 'cancelling {w} at the last minute',
    work: 'my mistake with {w} and the extra work it caused you'
  };
  var RESPONSIBILITY = {
    sincere: ['There is no excuse — that was on me, and I take full responsibility.', 'I will not hide behind excuses. I was wrong, plain and simple.'],
    light: ['No excuses, no "but the traffic" — this one is 100% on me.', 'I could blame the universe, but honestly? My bad. Entirely my bad.'],
    formal: ['I accept full responsibility for my actions and their consequences.', 'There is no justification for my conduct, and I do not offer one.']
  };
  var AMENDS = {
    sincere: ['I would like to make it up to you — tell me what would help, and I will do it.', 'Please let me make this right. You tell me how.'],
    light: ['To make amends, I officially owe you one — redeemable for coffee, favors, or eternal gratitude.', 'I propose reparations in the form of your favorite treat, on me.'],
    formal: ['I am committed to making appropriate amends and welcome your guidance on how best to do so.', 'Please allow me the opportunity to make this right.']
  };
  var PROMISE = {
    sincere: ['I will do better. You have my word — and I intend to keep it.', 'This will not happen again. I am going to make sure of that.'],
    light: ['I solemnly swear to be less of a mess next time. (Baby steps.)', 'Lesson learned, I promise. My track record starts improving today.'],
    formal: ['I assure you that I will take every measure to ensure this does not recur.', 'You have my assurance that this will not happen again.']
  };
  var CLOSE = {
    sincere: ['Thank you for hearing me out. It means a lot.', 'I hope you can forgive me.'],
    light: ['Forgive me? I will even do the dishes.', 'Friends again? I will bring snacks next time.'],
    formal: ['Thank you for your understanding.', 'With sincere regards,']
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var current = '';
  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var name = TN.el(SLUG + '-name').value.trim() || 'friend';
        var from = TN.el(SLUG + '-from').value.trim();
        var type = TN.el(SLUG + '-type').value;
        var tone = TN.el(SLUG + '-tone').value;
        var what = TN.el(SLUG + '-what').value.trim() || 'what happened';
        var sit = SITUATION[type].replace('{w}', what);
        var parts = [
          'Dear ' + name + ',',
          '',
          pick(OPEN[tone]) + ' I am truly sorry for ' + sit + '.',
          '',
          pick(RESPONSIBILITY[tone]),
          '',
          pick(AMENDS[tone]),
          '',
          pick(PROMISE[tone]),
          '',
          pick(CLOSE[tone])
        ];
        if (from) parts.push(from);
        current = parts.join('\n');
        TN.el(SLUG + '-output').textContent = current;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not write the apology. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your apology first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your apology first.'); return; }
      TN.downloadText(current, 'apology.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
