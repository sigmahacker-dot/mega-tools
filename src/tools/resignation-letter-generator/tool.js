/* Resignation Letter Generator — professional letter from role/company/last-day inputs. */
(function () {
  'use strict';
  var SLUG = 'resignation-letter-generator';

  var current = '';

  function fmtDate(iso) {
    if (!iso) return '[last working day]';
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var name = TN.el(SLUG + '-name').value.trim() || '[Your Name]';
        var role = TN.el(SLUG + '-role').value.trim() || '[Your Role]';
        var company = TN.el(SLUG + '-company').value.trim() || '[Company Name]';
        var manager = TN.el(SLUG + '-manager').value.trim() || 'Manager';
        var lastDay = fmtDate(TN.el(SLUG + '-lastday').value);
        var notice = TN.el(SLUG + '-notice').value;
        var reason = TN.el(SLUG + '-reason').value;
        var tone = TN.el(SLUG + '-tone').value;

        var L = [];
        L.push('Dear ' + manager + ',');
        L.push('');
        L.push('Please accept this letter as formal notification of my resignation from the position of ' + role + ' at ' + company + ', effective ' + lastDay + ' (' + notice + ' notice).');
        L.push('');
        if (tone === 'grateful') {
          L.push('Working at ' + company + ' has been one of the most rewarding chapters of my career. I am deeply grateful for the opportunities to learn and grow, and for the support of you and the entire team.');
          L.push('');
          L.push('I have accepted ' + (reason === 'a new opportunity' ? 'a new opportunity' : 'a new direction due to ' + reason) + ', and while I am excited for what lies ahead, I will truly miss working with everyone here.');
        } else if (tone === 'brief') {
          L.push('I am resigning due to ' + reason + '.');
        } else {
          L.push('I have decided to move on due to ' + reason + '. I have valued my time at ' + company + ' and the professional growth I experienced here.');
        }
        L.push('');
        L.push('During my remaining time, I will do everything I can to ensure a smooth handover, including documenting my work and training whoever takes over my responsibilities.');
        L.push('');
        if (tone !== 'brief') {
          L.push('Thank you for your guidance and support. I wish you and ' + company + ' continued success.');
          L.push('');
        }
        L.push('Sincerely,');
        L.push(name);
        current = L.join('\n');
        TN.el(SLUG + '-output').textContent = current;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not write the letter. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your letter first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Write your letter first.'); return; }
      TN.downloadText(current, 'resignation-letter.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
