/* Fiber intake calculator: checkbox foods + custom entries -> total vs target. */
(function () {
  'use strict';
  var SLUG = 'fiber-intake-calculator';
  function $(id) { return document.getElementById(id); }
  var FOODS = [
    ['Oatmeal (1 bowl)', 4],
    ['Whole wheat bread (2 slices)', 3.8],
    ['Brown rice (1 cup cooked)', 3.5],
    ['Lentils (1 cup cooked)', 15.6],
    ['Black beans (1 cup cooked)', 15],
    ['Chickpeas (1 cup)', 12.5],
    ['Apple (1 medium)', 4.4],
    ['Banana (1 medium)', 3.1],
    ['Broccoli (1 cup)', 5.1],
    ['Chia seeds (1 tbsp)', 5.5],
    ['Almonds (28 g handful)', 3.5],
    ['Pear (1 medium)', 5.5]
  ];
  var customs = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function build() {
    var box = $(SLUG + '-foods');
    var html = '';
    FOODS.forEach(function (f, i) {
      html += '<label class="checkbox-row"><input type="checkbox" data-fiber="' + f[1] + '" data-idx="' + i + '"> ' +
        esc(f[0]) + ' <span class="muted">(' + f[1] + ' g)</span></label>';
    });
    box.innerHTML = html;
    box.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.addEventListener('change', update);
    });
  }
  function update() {
    var total = 0;
    document.querySelectorAll('#' + SLUG + '-foods input[type=checkbox]:checked').forEach(function (cb) {
      total += parseFloat(cb.getAttribute('data-fiber'));
    });
    document.querySelectorAll('#' + SLUG + '-foods input[data-custom]:checked').forEach(function (cb) {
      total += parseFloat(cb.getAttribute('data-fiber'));
    });
    var target = parseFloat($(SLUG + '-target').value);
    total = Math.round(total * 10) / 10;
    $(SLUG + '-total').textContent = total + ' g';
    var pct = Math.round((total / target) * 100);
    $(SLUG + '-pct').textContent = pct + '%';
    $(SLUG + '-bar').style.width = Math.min(100, pct) + '%';
    $(SLUG + '-bar').style.background = pct >= 100 ? '#2e7d32' : pct >= 50 ? '#f9a825' : '#c62828';
    $(SLUG + '-msg').textContent = pct >= 100
      ? '🎉 Target reached — great fiber day!'
      : 'You need about ' + Math.max(0, Math.round((target - total) * 10) / 10) + ' g more to hit your target.';
  }
  function addCustom() {
    $(SLUG + '-error').textContent = '';
    var name = $(SLUG + '-cname').value.trim();
    var g = parseFloat($(SLUG + '-cg').value);
    if (!name) { $(SLUG + '-error').textContent = 'Enter a food name.'; return; }
    if (isNaN(g) || g < 0 || g > 100) { $(SLUG + '-error').textContent = 'Enter fiber grams (0–100).'; return; }
    var box = $(SLUG + '-foods');
    var lbl = document.createElement('label');
    lbl.className = 'checkbox-row';
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = true;
    cb.setAttribute('data-fiber', g);
    cb.setAttribute('data-custom', '1');
    cb.addEventListener('change', update);
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(' ' + name + ' '));
    var sp = document.createElement('span');
    sp.className = 'muted'; sp.textContent = '(' + g + ' g)';
    lbl.appendChild(sp);
    box.appendChild(lbl);
    $(SLUG + '-cname').value = '';
    $(SLUG + '-cg').value = '';
    update();
  }
  try {
    build();
    $(SLUG + '-target').addEventListener('change', update);
    $(SLUG + '-add').addEventListener('click', addCustom);
    update();
  } catch (e) { /* never throw on load */ }
})();
