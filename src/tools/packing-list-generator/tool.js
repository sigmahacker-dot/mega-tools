(function () {
  'use strict';
  var ERR = 'packing-list-generator-error';
  var state = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(id, dflt) { var e = TN.el(id); var v = e ? parseInt(e.value, 10) : NaN; return isNaN(v) ? dflt : v; }
  var TYPE_ITEMS = {
    beach: ['Swimsuit (2)', 'Beach towel', 'Sunscreen SPF 50', 'Sunglasses', 'Flip-flops', 'Beach bag', 'Snorkel set'],
    business: ['Blazer', 'Dress shirts (' + 0 + ')', 'Dress shoes', 'Laptop + charger', 'Business cards', 'Tie / scarf'],
    city: ['Comfortable walking shoes', 'Day backpack', 'City map / offline maps', 'Reusable water bottle'],
    camping: ['Tent', 'Sleeping bag', 'Sleeping pad', 'Headlamp + batteries', 'Camping stove + fuel', 'Cooler', 'Insect repellent', 'Pocket knife'],
    ski: ['Ski jacket', 'Thermal base layers (3)', 'Ski pants', 'Gloves + liners', 'Beanie', 'Ski socks (4)', 'Goggles', 'Lip balm'],
    backpack: ['Backpack 50L+', 'Packing cubes', 'Travel lock', 'Quick-dry towel', 'Laundry soap strips', 'Dry bag'],
    cruise: ['Formal outfit', 'Swimsuit (2)', 'Sunscreen', 'Motion-sickness tablets', 'Lanyard for key card'],
    road: ['Cooler with snacks', 'Paper maps / offline GPS', 'Car charger', 'Blanket + pillow', 'Jumper cables', 'First-aid kit']
  };
  function generate() {
    TN.clearErr(ERR);
    var type = TN.el('pack-type').value;
    var days = Math.min(90, Math.max(1, num('pack-days', 7)));
    var travelers = Math.min(20, Math.max(1, num('pack-travelers', 1)));
    var per = function (n) { return n * travelers; };
    var cats = [];
    if (TN.el('pack-c-docs').checked) cats.push(['Travel documents', ['Passport / ID', 'Visas', 'Flight / train tickets', 'Hotel confirmations', 'Travel insurance', 'Emergency contacts list']]);
    if (TN.el('pack-c-clothes').checked) {
      var shirts = Math.min(days + 1, 14), socks = Math.min(days + 1, 14), under = Math.min(days + 1, 14);
      cats.push(['Clothing', ['T-shirts / tops x' + per(shirts), 'Underwear x' + per(under), 'Socks x' + per(socks),
        'Trousers / jeans x' + per(Math.ceil(days / 3)), 'Sleepwear', 'Light jacket', 'Comfortable shoes', 'Laundry bag']]);
    }
    if (TN.el('pack-c-toilet').checked) cats.push(['Toiletries', ['Toothbrush + toothpaste', 'Deodorant', 'Shampoo / conditioner', 'Razor', 'Medications', 'Contact lenses / glasses']]);
    if (TN.el('pack-c-elect').checked) cats.push(['Electronics', ['Phone + charger', 'Power bank', 'Universal travel adapter', 'Headphones', 'Camera (optional)']]);
    if (TN.el('pack-c-health').checked) cats.push(['Health', ['Prescription meds', 'Pain relievers', 'Bandages', 'Hand sanitizer', 'Sunscreen']]);
    if (TN.el('pack-c-misc').checked) cats.push(['Miscellaneous', ['Snacks', 'Reusable water bottle', 'Book / e-reader', 'Pen + small notebook', 'Umbrella']]);
    var typeItems = (TYPE_ITEMS[type] || []).map(function (it) { return it.replace('(0)', 'x' + per(Math.min(days, 5))); });
    if (typeItems.length) cats.push(['Trip specific', typeItems]);
    if (!cats.length) { TN.setErr(ERR, 'Select at least one category.'); return; }
    state = [];
    cats.forEach(function (c) {
      c[1].forEach(function (item) { state.push({ cat: c[0], item: item, done: false }); });
    });
    render();
  }
  function render() {
    var box = TN.el('pack-list');
    if (!state.length) { box.innerHTML = '<p class="muted">Press Generate list to build your checklist.</p>'; return; }
    var html = '', lastCat = null, done = 0;
    state.forEach(function (s, i) {
      if (s.done) done++;
      if (s.cat !== lastCat) { html += '<h4 style="margin:14px 0 4px">' + esc(s.cat) + '</h4>'; lastCat = s.cat; }
      html += '<div class="checkbox-row"><input type="checkbox" data-i="' + i + '" id="pack-it-' + i + '"' +
        (s.done ? ' checked' : '') + '><label for="pack-it-' + i + '"' +
        (s.done ? ' style="text-decoration:line-through;opacity:.6"' : '') + '>' + esc(s.item) + '</label></div>';
    });
    box.innerHTML = html;
    TN.el('pack-count').textContent = state.length;
    TN.el('pack-packed').textContent = done + ' / ' + state.length;
    TN.qsa('#pack-list input[type=checkbox]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        state[parseInt(cb.getAttribute('data-i'), 10)].done = cb.checked;
        render();
      });
    });
  }
  function download() {
    if (!state.length) { TN.setErr(ERR, 'Generate a list first.'); return; }
    TN.clearErr(ERR);
    var lines = ['PACKING LIST', ''];
    var lastCat = null;
    state.forEach(function (s) {
      if (s.cat !== lastCat) { lines.push('', s.cat.toUpperCase()); lastCat = s.cat; }
      lines.push((s.done ? '[x] ' : '[ ] ') + s.item);
    });
    var b = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = 'packing-list.txt';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  try {
    TN.on('pack-gen', 'click', generate);
    TN.on('pack-dl', 'click', download);
    render();
  } catch (e) { /* never throw on load */ }
})();