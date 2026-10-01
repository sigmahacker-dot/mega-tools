/* Excuse Generator — category x severity excuse combos. */
(function () {
  'use strict';
  var SLUG = 'excuse-generator';

  var SETUP = {
    work: ["I can't come in today","I'll be late to the meeting","I missed the deadline","I need to leave early","I can't join the call","My report isn't ready","I forgot the presentation","I won't make standup","I'm working from home today","I need the day off"],
    school: ["I didn't do my homework","I'll be late to class","I missed the exam","I forgot my project","I can't come to school today","My essay isn't finished","I lost my textbook","I fell asleep in class","I didn't study","I need an extension"],
    social: ["I can't make it tonight","I have to cancel our plans","I'll be late to the party","I can't come to the wedding","I need to skip dinner","I forgot your birthday","I can't help you move","I'm bailing on the trip","I won't be at game night","I have to leave early"]
  };
  var REASON = {
    mild: ["my alarm didn't go off","traffic was unreal","I have a dentist appointment","my car wouldn't start","I wasn't feeling well","there was a power outage","my phone died","I had a family thing","the bus never came","I overslept by an hour","my dog needed the vet","I had a migraine"],
    bold: ["my neighbor's parrot learned my ringtone and I answered 40 fake calls","a flock of geese occupied my driveway","my smart fridge ordered 200 yogurts and I had to cancel them all","I got stuck in an elevator with a magician","my cat walked across my keyboard and deleted everything","a flash mob blocked my street","I accidentally joined a parade","my GPS took me to the wrong city","I was questioned by security over a sandwich","my houseplants staged a revolt","I locked myself out in my pajamas","a marching band rehearsed outside my window all morning"],
    outrageous: ["I was briefly abducted by aliens who needed help with their taxes","a time traveler warned me not to leave the house until noon","my evil twin locked me in the basement","I discovered a portal in my closet and had to close it","a dragon nested on my car","I was recruited for a secret mission at 6am","my house was quarantined by ghost hunters","I accidentally became mayor of a small town","a wizard cursed my front door shut","I had to negotiate peace between rival squirrel gangs","my reflection stepped out of the mirror and we had words","I was busy defusing a glitter bomb"]
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
      var cat = TN.el(SLUG + '-category').value;
      var sev = TN.el(SLUG + '-severity').value;
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 200) {
        guard++;
        var e = pick(SETUP[cat]) + ' because ' + pick(REASON[sev]) + '.';
        if (!seen[e]) { seen[e] = true; out.push(e); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate excuses. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
