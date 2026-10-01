/* Joke Generator — 45 clean jokes across 5 categories. */
(function () {
  'use strict';
  var SLUG = 'joke-generator';

  var JOKES = [
    { c: 'animals', s: 'What do you call a fish without eyes?', p: 'A fsh!' },
    { c: 'animals', s: 'Why did the cow go to outer space?', p: 'To see the moooon!' },
    { c: 'animals', s: 'What do you call a bear with no teeth?', p: 'A gummy bear!' },
    { c: 'animals', s: 'Why did the chicken cross the playground?', p: 'To get to the other slide!' },
    { c: 'animals', s: 'What do you call a lazy kangaroo?', p: 'A pouch potato!' },
    { c: 'animals', s: 'Why are frogs so happy?', p: 'They eat whatever bugs them!' },
    { c: 'animals', s: 'What did the ocean say to the beach?', p: 'Nothing, it just waved!' },
    { c: 'animals', s: 'How do you make an octopus laugh?', p: 'With ten-tickles!' },
    { c: 'animals', s: 'What do you call a dog magician?', p: 'A labracadabrador!' },
    { c: 'food', s: 'Why did the cookie go to the doctor?', p: 'Because it was feeling crumby!' },
    { c: 'food', s: 'What do you call cheese that isn\u2019t yours?', p: 'Nacho cheese!' },
    { c: 'food', s: 'Why did the banana go to the doctor?', p: 'It wasn\u2019t peeling well!' },
    { c: 'food', s: 'What room has no doors?', p: 'A mushroom!' },
    { c: 'food', s: 'Why did the tomato blush?', p: 'Because it saw the salad dressing!' },
    { c: 'food', s: 'What do you call a fake noodle?', p: 'An impasta!' },
    { c: 'food', s: 'Why don\u2019t eggs tell jokes?', p: 'They\u2019d crack each other up!' },
    { c: 'food', s: 'How do you fix a broken pizza?', p: 'With tomato paste!' },
    { c: 'food', s: 'What did the grape say when it got stepped on?', p: 'Nothing, it just let out a little wine!' },
    { c: 'school', s: 'Why did the math book look sad?', p: 'It had too many problems!' },
    { c: 'school', s: 'What\u2019s a math teacher\u2019s favorite dessert?', p: 'Pi!' },
    { c: 'school', s: 'Why did the student eat his homework?', p: 'The teacher said it was a piece of cake!' },
    { c: 'school', s: 'Why was the student\u2019s report card wet?', p: 'It was below C level!' },
    { c: 'school', s: 'What did one wall say to the other wall at school?', p: 'I\u2019ll meet you at the corner!' },
    { c: 'school', s: 'Why did the music teacher need a ladder?', p: 'To reach the high notes!' },
    { c: 'school', s: 'What has a face but no head?', p: 'A clock!' },
    { c: 'school', s: 'Why don\u2019t skeletons fight at school?', p: 'They don\u2019t have the guts!' },
    { c: 'school', s: 'What\u2019s the king of the classroom?', p: 'The ruler!' },
    { c: 'science', s: 'Why don\u2019t scientists trust atoms?', p: 'Because they make up everything!' },
    { c: 'science', s: 'What did one DNA say to the other?', p: 'Do these genes make me look fat?' },
    { c: 'science', s: 'Why did the physicist break up with the biologist?', p: 'There was no chemistry!' },
    { c: 'science', s: 'How does the moon cut its hair?', p: 'Eclipse it!' },
    { c: 'science', s: 'Why is the periodic table so stable?', p: 'All its elements are well-grounded!' },
    { c: 'science', s: 'What do you call an educated tube?', p: 'A graduated cylinder!' },
    { c: 'science', s: 'Why did the computer go to the doctor?', p: 'It had a virus!' },
    { c: 'science', s: 'What is a tornado\u2019s favorite game?', p: 'Twister!' },
    { c: 'science', s: 'What did Earth say to the other planets?', p: 'You guys have no life!' },
    { c: 'general', s: 'Why did the scarecrow win an award?', p: 'Because he was outstanding in his field!' },
    { c: 'general', s: 'What do you call a can opener that doesn\u2019t work?', p: 'A can\u2019t opener!' },
    { c: 'general', s: 'Why did the bicycle fall over?', p: 'Because it was two-tired!' },
    { c: 'general', s: 'What do you get when you cross a snowman and a vampire?', p: 'Frostbite!' },
    { c: 'general', s: 'Why don\u2019t skeletons go trick-or-treating?', p: 'They have no body to go with!' },
    { c: 'general', s: 'What did the zero say to the eight?', p: 'Nice belt!' },
    { c: 'general', s: 'Why did the golfer bring two pairs of pants?', p: 'In case he got a hole in one!' },
    { c: 'general', s: 'How do you catch a squirrel?', p: 'Climb a tree and act like a nut!' },
    { c: 'general', s: 'What did the mama broom say to the baby broom?', p: 'It\u2019s time to go to sweep!' }
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (j) {
      var text = j.s + ' ' + j.p;
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var lab = document.createElement('div');
      lab.className = 'muted';
      lab.style.fontSize = '.78rem';
      lab.textContent = j.c.charAt(0).toUpperCase() + j.c.slice(1);
      var val = document.createElement('div');
      val.textContent = text;
      res.appendChild(lab);
      res.appendChild(val);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        TN.copy(text).then(function (ok) {
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
      var pool = cat === 'all' ? JOKES : JOKES.filter(function (j) { return j.c === cat; });
      var seen = {}, out = [], guard = 0;
      var n = Math.min(10, pool.length);
      while (out.length < n && guard < 200) {
        guard++;
        var j = pick(pool);
        var key = j.s;
        if (!seen[key]) { seen[key] = true; out.push(j); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not fetch jokes. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
