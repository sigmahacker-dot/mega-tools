/* Cat Name Generator — mischievous, regal, and food name banks. */
(function () {
  'use strict';
  var SLUG = 'cat-name-generator';

  var BANKS = {
    mischievous: ['Bandit','Chaos','Loki','Mischief','Rascal','Trouble','Whiskers','Pickle','Sneaky','Zippy','Dash','Havoc','Jinx','Ninja','Pounce','Scamp','Slinky','Socks','Tig','Ziggy','Binx','Pepper','Gremlin','Mayhem'],
    regal: ['Duchess','Emperor','King','Lord','Prince','Princess','Queen','Sir','Baron','Countess','Duke','Majesty','Noble','Pharaoh','Sultan','Caesar','Cleopatra','Empress','Kaiser','Tsar','Viscount','Baroness','Contessa','Monarch'],
    food: ['Biscuit','Butter','Cheesecake','Cookie','Cupcake','Mochi','Noodle','Peanut','Pickle','Pumpkin','Waffles','Bagel','Donut','Pudding','Sushi','Taco','Beans','Caramel','Cinnamon','Gravy','Meatball','Omelet','Pancake','Tofu']
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

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
      var bank = BANKS[style] || BANKS.mischievous;
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = '\uD83D\uDC31 ' + pick(bank);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
