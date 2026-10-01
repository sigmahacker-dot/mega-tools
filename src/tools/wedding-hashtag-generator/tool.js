/* Wedding Hashtag Generator — portmanteau/pun/date hashtags from couple names. */
(function () {
  'use strict';
  var SLUG = 'wedding-hashtag-generator';

  function clean(s) {
    return s.trim().replace(/[^a-zA-Z]/g, '');
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

  function build(n1, n2, year) {
    var a = cap(n1), b = cap(n2);
    var al = n1.toLowerCase(), bl = n2.toLowerCase();
    var blend1 = cap(al.slice(0, Math.ceil(al.length / 2)) + bl.slice(Math.floor(bl.length / 2)));
    var blend2 = cap(bl.slice(0, Math.ceil(bl.length / 2)) + al.slice(Math.floor(al.length / 2)));
    var tags = [
      '#' + a + 'And' + b,
      '#' + a + 'SaidYesTo' + b,
      '#' + b + 'SaidYesTo' + a,
      '#' + blend1,
      '#' + blend2,
      '#' + a + b + 'EverAfter',
      '#' + a + b + 'TieTheKnot',
      '#' + a + b + 'SayIDo',
      '#' + a + 'FoundHer' + b,
      '#' + b + 'FoundHis' + a,
      '#' + a + 'Plus' + b,
      '#' + a + 'Meets' + b,
      '#' + b + 'Meets' + a,
      '#' + 'HappilyEver' + a + b,
      '#' + a + b + 'Forever',
      '#' + 'ToHaveAndTo' + b,
      '#' + 'MeetThe' + b + 's',
      '#' + a + 'Got' + b + 'd'
    ];
    if (year) {
      tags.push('#' + a + b + year);
      tags.push('#' + a + 'And' + b + year);
      tags.push('#' + blend1 + year);
      tags.push('#' + a + b + 'Est' + year);
    }
    return tags;
  }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cssText = 'cursor:pointer;flex:1;font-weight:600';
      res.textContent = t;
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      function doCopy() {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      }
      btn.addEventListener('click', doCopy);
      res.addEventListener('click', doCopy);
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var n1 = clean(TN.el(SLUG + '-n1').value);
        var n2 = clean(TN.el(SLUG + '-n2').value);
        if (!n1 || !n2) { TN.setErr(SLUG + '-error', 'Type both partner names first.'); return; }
        var d = TN.el(SLUG + '-date').value;
        var year = d ? d.slice(0, 4) : '';
        var tags = build(n1, n2, year);
        /* shuffle and take 12 */
        for (var i = tags.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = tags[i]; tags[i] = tags[j]; tags[j] = tmp;
        }
        render(tags.slice(0, 12));
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate hashtags. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
