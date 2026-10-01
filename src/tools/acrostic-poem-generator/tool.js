/* Acrostic Poem Generator — one poetic line per letter from line banks. */
(function () {
  'use strict';
  var SLUG = 'acrostic-poem-generator';
  var LINES = {
    A: ['Always reaching for the morning sun', 'A whisper carried on the evening breeze', 'Awake to wonders yet unseen'],
    B: ['Beneath the stars, the world feels wide', 'Brave enough to chase the falling light', 'Between the pages, dreams reside'],
    C: ['Carried softly on a silver stream', 'Catching colors in the autumn air', 'Calm as moonlight on the sea'],
    D: ['Dancing lightly through the golden day', 'Dreams take flight on paper wings', 'Deep in forests, secrets keep'],
    E: ['Every sunrise writes a brand-new song', 'Endless oceans hum a lullaby', 'Even shadows learn to glow'],
    F: ['Floating gently like a feathered cloud', 'Fireflies stitch the dark with gold', 'Follow rivers to the open sky'],
    G: ['Gently falling like the autumn rain', 'Glowing embers tell of distant lands', 'Graceful as the morning dove'],
    H: ['Holding hope within an open hand', 'Hearts remember what the mind forgets', 'Hushed the world beneath the snow'],
    I: ['In the quiet, small things bloom', 'I follow starlight home again', 'Infinite skies in a drop of dew'],
    J: ['Journey on where wild winds go', 'Joy arrives on tiptoe, soft and bright', 'Just beyond the hill, the dawn awaits'],
    K: ['Kindness grows in every generous heart', 'Keep your lantern lit for wanderers', 'Kites of color paint the springtime sky'],
    L: ['Laughter ripples through the summer grass', 'Light spills softly through the leaves', 'Listen — the night is full of songs'],
    M: ['Moonlight silver on the sleepy lake', 'Morning opens like a flower', 'Memories drift on quiet streams'],
    N: ['Night unfolds its velvet, starry wings', 'Never doubt the quiet, growing things', 'New horizons call the brave'],
    O: ['Over valleys, eagles ride the wind', 'Onward, ever onward, journeys lead', 'Only kindness truly lasts'],
    P: ['Petals falling in the springtime rain', 'Peace settles like the evening mist', 'Promises bloom where hope is sown'],
    Q: ['Quiet moments hold the deepest truths', 'Quicksilver rivers race to the sea', 'Question stars, and dream anew'],
    R: ['Rivers carry stories to the sea', 'Rise, and greet the newborn day', 'Rainbow arcs across the clearing sky'],
    S: ['Softly falls the silver rain', 'Stars are lanterns in the night', 'Sing, and let the whole world hear'],
    T: ['Time drifts gently like a fallen leaf', 'Through the meadow, wild winds roam', 'Thunder rolls beyond the hills'],
    U: ['Underneath the ancient, watchful trees', 'Up where silver clouds are sailing', 'Unfold your wings and try the sky'],
    V: ['Velvet night wraps the world in blue', 'Voices echo through the canyon deep', 'Vivid sunsets paint the western sky'],
    W: ['Wildflowers nod along the winding road', 'Waves keep rhythm with the moon', 'Wander far, but carry home inside'],
    X: ['X marks the spot where dreams begin', 'Xylophones of rain on windowpanes', 'Xenial hearts make strangers friends'],
    Y: ['Yesterday is just a fading song', 'Yearning hearts still find their way', 'Yonder lies the land of morning'],
    Z: ['Zephyrs dance across the golden field', 'Zest for life in every sunrise', 'Zigzag lightning splits the sky']
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!input) { TN.setErr(SLUG + '-error', 'Please type a word (letters only).'); return; }
    var lines = input.split('').map(function (ch) {
      return ch + ' — ' + pick(LINES[ch]);
    });
    TN.el(SLUG + '-output').textContent = lines.join('\n');
  }

  try {
    TN.on(SLUG + '-run', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
