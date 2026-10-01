/* Sci-Fi Name Generator — alien, human, planet, starship styles. */
(function () {
  'use strict';
  var SLUG = 'sci-fi-name-generator';

  var A1 = ['Xy','Zv','Qr','Kth','Vex','Zyx','Qil','Thra','Ul','Ix','Oq','Zr','Ka','Vy','Nyx','Drax','Qu','Zeth','Kry','Vor','Xan','Zol','Pra','Tiv'];
  var A2 = ['a','e','i','o','u','ae','ia','ou','ax','ex','ix','ox','aa','ee','uu'];
  var A3 = ['th','x','z','q','v','k','r','n','d','g','l','m','s','t','ph'];
  var H_FIRST = ['Nova','Orion','Vega','Lyra','Cassius','Juno','Atlas','Rhea','Darius','Selene','Kai','Mira','Ezra','Talia','Ronan','Ada','Corvus','Petra','Soren','Ilya'];
  var H_LAST = ['Starr','Vance','Drax','Novak','Ferro','Quill','Voss','Hale','Mercer','Cross','Dray','Flint','Graves','Holt','Jett','Knox','Lark','Mars','Nash','Pike'];
  var P_ROOT = ['Zeph','Xanth','Corv','Drac','Elys','Forn','Heli','Ion','Kry','Lyr','Myr','Nov','Ophi','Pyr','Quant','Rhy','Stell','Terr','Umbr','Vel','Wyr','Xeno','Yor','Zeta','Cyg'];
  var P_SUF = ['ia','os','ara',' Prime',' Minor',' Major',' Prime','os'];
  var ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  var SHIP_PRE = ['ISS','VSS','UNS','CSV','HMS','RSV','DSS'];
  var SHIP_NAME = ['Odyssey','Venture','Horizon','Aurora','Dauntless','Endeavor','Intrepid','Meridian','Pioneer','Reliant','Vanguard','Zenith','Eclipse','Tempest','Halcyon','Kestrel','Nomad','Paladin','Solace','Talon','Umbra','Wraith','Zephyr','Quasar','Raptor'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function genAlien() {
    var n = pick(A1) + pick(A2) + pick(A3);
    if (Math.random() < 0.5) n += "'" + pick(A1).toLowerCase() + pick(A3);
    else n += pick(A2) + pick(A1).toLowerCase();
    return cap(n);
  }
  function genHuman() { return pick(H_FIRST) + ' ' + pick(H_LAST); }
  function genPlanet() {
    var root = cap(pick(P_ROOT).toLowerCase());
    var suf = pick(P_SUF);
    if (suf.indexOf(' ') === 0) return root + suf;
    if (Math.random() < 0.5) return root + suf + ' ' + pick(ROMAN);
    return root + suf + '-' + (1 + Math.floor(Math.random() * 12));
  }
  function genShip() { return pick(SHIP_PRE) + ' ' + pick(SHIP_NAME); }

  function genOne(style) {
    if (style === 'alien') return genAlien();
    if (style === 'human') return genHuman();
    if (style === 'planet') return genPlanet();
    return genShip();
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
        var n = genOne(style);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
