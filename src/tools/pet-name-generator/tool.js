/* Pet Name Generator — cute / food / nature banks with species filter. */
(function () {
  'use strict';
  var SLUG = 'pet-name-generator';

  var BANKS = {
    cute: ['Angel','Baby','Bella','Buddy','Buttons','Bubbles','Boo','Coco','Cuddles','Daisy','Gizmo','Honey','Jelly','Kiki','Lulu','Mimi','Muffin','Noodle','Peanut','Pip','Poppy','Pumpkin','Snuggles','Sunny','Sweetie','Teddy','Tofu','Waffles','Wiggles','Ziggy','Zippy'],
    food: ['Bacon','Biscuit','Brownie','Butter','Caramel','Cheesecake','Chili','Cinnamon','Cookie','Cupcake','Donut','Ginger','Honey','Jellybean','Kiwi','Mango','Maple','Mochi','Muffin','Nacho','Nugget','Olive','Pancake','Pasta','Pepper','Pickle','Pretzel','Pudding','Sprinkles','Taco','Toffee','Waffle'],
    nature: ['Aspen','Birch','Brook','Clover','Coral','Dune','Ember','Fern','Flint','Grove','Hazel','Ivy','Juniper','Kelp','Lark','Maple','Meadow','Moss','Ocean','Pebble','Pine','Rain','River','Sage','Sky','Stone','Storm','Willow','Wren','Zephyr']
  };
  var EMOJI = { any: '🐾', dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰' };

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
      var theme = TN.el(SLUG + '-theme').value;
      var species = TN.el(SLUG + '-species').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var bank = BANKS[theme] || BANKS.cute;
      var emoji = EMOJI[species] || EMOJI.any;
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = emoji + ' ' + pick(bank);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
