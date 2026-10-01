/* Fantasy Name Generator — original syllable-bank names: male, female, place. */
(function () {
  'use strict';
  var SLUG = 'fantasy-name-generator';

  var MALE_PRE = ['Al','Bar','Bram','Cor','Dain','Dor','Eld','Fen','Gar','Had','Jor','Kael','Lor','Mal','Nor','Os','Pell','Quen','Ragn','Sar','Thorn','Ul','Var','Wulf','Xan','Yor','Zev','Aed','Bran','Ced','Dun'];
  var MALE_MID = ['a','ae','ai','an','ar','as','ath','e','ea','en','er','ian','il','in','ir','is','o','oa','on','or','os','u','un','ur'];
  var MALE_SUF = ['bar','den','dor','dus','far','gar','ian','ien','lor','man','mir','mon','nar','rath','ric','ron','son','thor','val','ven','win','ard','eld','helm'];
  var FEM_PRE = ['Ael','Ara','Bel','Cer','Del','Eli','Fael','Gal','Hel','Il','Is','Jyn','Kael','Lyr','Mel','Nym','Oly','Rae','Sel','Syl','Thal','Ula','Vel','Wyn','Xyl','Ys','Zara','Alys','Brin','Elow'];
  var FEM_MID = ['a','ae','ala','ana','aria','e','ea','el','ena','ia','iana','il','ina','is','ly','o','ona','u','una','y'];
  var FEM_SUF = ['a','ah','bel','dra','ela','elle','ia','iana','il','ina','is','la','lia','lyn','ma','na','ria','sa','ssa','thia','vena','wena'];
  var PLACE_PRE = ['Ash','Black','Bright','Cinder','Dark','Dun','East','Ember','Frost','Glen','Gold','Grey','High','Holly','Iron','Kings','Mist','Moss','North','Oak','Ravens','Red','Silver','Stone','Thorn','West','White','Wild','Willow','Winter'];
  var PLACE_SUF = ['borough','bridge','bury','dale','den','ford','garth','ham','haven','holme','mere','mouth','shire','stead','thorpe','ton','vale','wick','wood','fall'];
  var PLACE_ADJ = ['Ancient','Broken','Crimson','Ember','Forgotten','Golden','Hollow','Howling','Ivory','Misty','Silent','Silver','Stormy','Whispering'];
  var PLACE_NOUN = ['Crown','Hollow','Keep','Vale','Reach','Watch','Gate','Falls','Rise','Deep','Mark','Hold'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function makeName(pre, mid, suf, len) {
    if (len === 'short') return pre + suf;
    if (len === 'long') return pre + mid + mid + suf;
    return pre + mid + suf;
  }

  function genOne(style, len) {
    if (style === 'male') return cap(makeName(pick(MALE_PRE), pick(MALE_MID), pick(MALE_SUF), len));
    if (style === 'female') return cap(makeName(pick(FEM_PRE), pick(FEM_MID), pick(FEM_SUF), len));
    if (Math.random() < 0.6) return cap(pick(PLACE_PRE)) + pick(PLACE_SUF);
    return 'The ' + pick(PLACE_ADJ) + ' ' + pick(PLACE_NOUN);
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
      var len = TN.el(SLUG + '-length').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genOne(style, len);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
