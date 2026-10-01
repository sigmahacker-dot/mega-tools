/* Elf Name Generator — original Sindarin-flavored syllable banks. */
(function () {
  'use strict';
  var SLUG = 'elf-name-generator';

  var PRE = ['Aer','Ael','Am','Bel','Cal','Cel','El','Fael','Gal','Gil','Il','Laer','Loth','Mel','Mir','Nael','Neth','Quel','Rael','Sil','Tael','Tel','Thal','Uel','Vael','Vel','Yael','Zel','Ar','Elen'];
  var MID = ['a','ad','al','an','ar','ath','e','el','en','er','i','ia','il','in','ion','ir','is','o','on','or','u','ul','ur','wen'];
  var SUF_M = ['dil','fin','lor','neth','quel','sil','thil','mir','nor','thir','del','fel','gal','hil','mel','nil','rel','sel'];
  var SUF_F = ['driel','las','riel','vien','wen','iel','del','fel','mel','nil','rel','sel','thil','quel','lor','sil'];
  var EPITHETS = ['of the Silverwood','of the Moonlit Glade','of the Whispering Pines','of the Starlit Vale','of the Emerald Canopy','of the Dawnwater','of the Twilight Boughs','of the Crystal Falls','of the Ancient Thicket','of the Sunlit Clearing','of the Misty Hollows','of the Evergreen Watch'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function genName(style) {
    var suf = style === 'female' ? pick(SUF_F) : pick(SUF_M);
    var n = Math.random() < 0.65
      ? pick(PRE) + pick(MID) + suf
      : pick(PRE) + suf;
    n = cap(n);
    if (style === 'epithet') n += ' ' + pick(EPITHETS);
    return n;
  }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var val = document.createElement('div');
      val.textContent = t;
      res.appendChild(val);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          if (!ok) TN.setErr(SLUG + '-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      });
      res.addEventListener('click', function () { btn.click(); });
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      var style = TN.el(SLUG + '-style').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genName(style);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
