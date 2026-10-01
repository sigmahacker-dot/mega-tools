/* Street Name Generator — fictional street names in classic/surname/old-town styles. */
(function () {
  'use strict';
  var SLUG = 'street-name-generator';

  var TREES = ['Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Willow', 'Aspen', 'Juniper', 'Magnolia', 'Chestnut', 'Walnut', 'Spruce', 'Holly', 'Ivy', 'Laurel', 'Poplar', 'Sycamore', 'Acacia', 'Palm', 'Cherry', 'Alder', 'Beech', 'Cypress'];
  var SURNAMES = ['Harper', 'Ellison', 'Blackwood', 'Calloway', 'Delacroix', 'Fairbanks', 'Grimshaw', 'Holloway', 'Kingsley', 'Lockhart', 'Marlowe', 'Osborne', 'Pembroke', 'Sinclair', 'Thackeray', 'Wexford', 'Ashford', 'Beaumont', 'Donovan', 'Sterling', 'Whitfield', 'Ravensworth', 'Nightingale', 'Fairchild'];
  var OLDTOWN = ['Cobbler', 'Tanner', 'Miller', 'Cooper', 'Fletcher', 'Smithy', 'Chandler', 'Mercer', 'Baker', 'Brewer', 'Mason', 'Weaver', 'Thatcher', 'Potter', 'Saddler', 'Glover', 'Cutler', 'Dyer'];
  var SUF = ['Street', 'Avenue', 'Lane', 'Road', 'Drive', 'Boulevard', 'Court', 'Way', 'Place', 'Terrace', 'Circle', 'Parkway'];
  var ADJ = ['Old', 'New', 'Upper', 'Lower', 'Little', 'Grand', 'Hidden', 'Sunny', 'Shady', 'Quiet'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function makeName(style) {
    var s = style === 'mixed' ? pick(['classic', 'surname', 'oldtown']) : style;
    var suffix = pick(SUF);
    if (s === 'classic') {
      var base = pick(TREES);
      return (Math.random() < 0.25 ? pick(ADJ) + ' ' : '') + base + ' ' + suffix;
    }
    if (s === 'surname') return pick(SURNAMES) + ' ' + suffix;
    return pick(OLDTOWN) + ' ' + (suffix === 'Street' || suffix === 'Lane' || suffix === 'Road' ? suffix : pick(['Street', 'Lane', 'Road', 'Alley']));
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
        var style = TN.el(SLUG + '-style').value;
        var seen = {}, out = [], guard = 0;
        while (out.length < 10 && guard < 200) {
          guard++;
          var n = makeName(style);
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
