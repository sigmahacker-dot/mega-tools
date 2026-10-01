/* Dad Joke Generator — 42 classic groan-worthy one-liners. */
(function () {
  'use strict';
  var SLUG = 'dad-joke-generator';

  var JOKES = [
    "I'm afraid for the calendar. Its days are numbered.",
    "My wife said I should do lunges to stay in shape. That would be a big step forward.",
    "I used to play piano by ear, but now I use my hands.",
    "Singing in the shower is fun until you get soap in your mouth. Then it's a soap opera.",
    "I told my suitcase there would be no vacation this year. Now I'm dealing with emotional baggage.",
    "I don't trust stairs. They're always up to something.",
    "I asked the librarian if the library had books on paranoia. She whispered, \u201cThey're right behind you.\u201d",
    "I used to be a banker, but I lost interest.",
    "I wondered why the baseball was getting bigger. Then it hit me.",
    "I have a fear of speed bumps, but I'm slowly getting over it.",
    "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    "I used to hate facial hair, but then it grew on me.",
    "I wanted to tell you a time-travel joke, but you didn't like it yet.",
    "I named my dog Five Miles so I can say I walk Five Miles every day.",
    "I'm reading a book about anti-gravity. It's impossible to put down.",
    "I tried to catch fog yesterday. Mist.",
    "I don't play soccer because I enjoy the sport. I'm just doing it for kicks.",
    "I told the doctor I broke my arm in two places. He said, \u201cStop going to those places.\u201d",
    "I have a joke about chemistry, but I know I won't get a reaction.",
    "I used to work in a shoe recycling shop. It was sole-destroying.",
    "I wanted to be a professional fisherman, but I couldn't live on my net income.",
    "I have a photographic memory, but I always forget to bring film.",
    "I used to be addicted to soap. I'm clean now.",
    "I asked the gym instructor to teach me the splits. He asked how flexible I am. I said, \u201cI can't make Tuesdays.\u201d",
    "I told my wife she should embrace her mistakes. She gave me a hug.",
    "I asked my father for money. He said money doesn't grow on trees. I asked why the bank is full of branches.",
    "I told my son to stop impersonating a flamingo. He had to put his foot down.",
    "I have a joke about construction, but I'm still working on it.",
    "I told my wife I was going to make a bicycle out of spaghetti. She said, \u201cPasta point of no return.\u201d",
    "I used to think I was indecisive, but now I'm not so sure.",
    "I told my computer I needed a break, and now it won't stop showing me ads for holidays.",
    "I asked the waiter if the restaurant had crab legs. He said, \u201cNo, it just walks like this.\u201d",
    "I bought a ceiling fan the other day. Complete waste of money. He just stands there applauding.",
    "I told my wife I wanted to skydive. She said, \u201cThat's a big step.\u201d I said, \u201cOff a small plane.\u201d",
    "I asked my son what 5 + 5 is. He said 11. I said, \u201cClose enough for government work.\u201d",
    "I used to run a dating service for chickens. It was all about hen-counters.",
    "I told my barber I wanted to look like a movie star. Now I owe him for the popcorn too.",
    "I asked the electrician why my lights flicker. He said, \u201cThey're just excited to see you.\u201d",
    "I planted a joke garden. Now I have pun-kin growing.",
    "I told my kids the wifi password is a dad joke. They still haven't logged in.",
    "I asked my reflection for advice. It just stared back, which honestly was the most honest answer.",
    "I told my dad joke at a comedy club. They asked me to leaf. I was already oak-ay with that."
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t, i) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var lab = document.createElement('div');
      lab.className = 'muted';
      lab.style.fontSize = '.78rem';
      lab.textContent = 'Dad joke ' + (i + 1);
      var val = document.createElement('div');
      val.textContent = t;
      res.appendChild(lab);
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
      var seen = {}, out = [], guard = 0;
      while (out.length < 10 && guard < 200) {
        guard++;
        var j = pick(JOKES);
        if (!seen[j]) { seen[j] = true; out.push(j); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not fetch jokes. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
