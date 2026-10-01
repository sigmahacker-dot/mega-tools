/* Spell Name Generator — fantasy spell names tagged with school of magic. */
(function () {
  'use strict';
  var SLUG = 'spell-name-generator';

  var SCHOOLS = {
    Evocation: [
      'Fireball of the Ancients', 'Lightning Cascade', 'Frost Nova', 'Searing Ray', 'Thunderclap',
      'Ember Storm', 'Arcane Barrage', 'Solar Flare', 'Ice Lance', 'Chain Lightning',
      'Meteor Swarm', 'Blazing Hands', 'Storm Surge', 'Cinder Blast', 'Radiant Beam'
    ],
    Illusion: [
      'Veil of Shadows', 'Mirror Image', 'Phantasmal Terrain', 'Silent Mirage', 'Dream Weave',
      'Invisibility Cloak', 'Hallucinatory Feast', 'Shimmering Double', 'False Dawn', 'Whisper Maze',
      'Glamour of the Fey', 'Vanishing Act', 'Spectral Parade', 'Mind Fog', 'Cloak of Whispers'
    ],
    Necromancy: [
      'Raise Fallen Warrior', 'Grasp of the Grave', 'Soul Harvest', 'Bone Armor', 'Chill of Death',
      'Whispers of the Dead', 'Plague Cloud', 'Life Drain', 'Crypt Call', 'Wraith Form',
      'Funeral Dirge', 'Corpse Explosion', 'Spirit Shackles', 'Grave Mist', 'Undying Servant'
    ],
    Abjuration: [
      'Shield of Dawn', 'Ward Against Evil', 'Counterspell', 'Sanctuary Circle', 'Stone Skin',
      'Dispel Magic', 'Aegis of Light', 'Barrier of Thorns', 'Null Field', 'Guardian Sigil',
      'Bulwark of Faith', 'Spell Reflection', 'Iron Will', 'Hallowed Ground', 'Arcane Lockdown'
    ],
    Divination: [
      'Eyes of the Oracle', 'Reveal Truth', 'Scry the Distant', 'Whispers of Fate', 'Detect Magic',
      'Read the Stars', 'Commune with Spirits', 'Foresight', 'Locate Object', 'Dream Vision',
      'Unveil Secrets', 'Echoes of the Past', 'Third Eye', 'Prophetic Dream', 'Clairvoyant Gaze'
    ],
    Enchantment: [
      'Charm Person', 'Sleep of Ages', 'Beguiling Word', 'Fear Aura', 'Lover\u2019s Knot',
      'Commanding Voice', 'Dazzling Smile', 'Rage of Battle', 'Siren Song', 'Hypnotic Pattern',
      'Geas of Binding', 'Calm Emotions', 'Hero\u2019s Courage', 'Bane of Doubt', 'Thrall of the Muse'
    ],
    Conjuration: [
      'Summon Elemental', 'Gate to Elsewhere', 'Conjure Feast', 'Call Familiar', 'Teleport Circle',
      'Mist Step', 'Summon Steed', 'Acid Splash', 'Wall of Stone', 'Cloud of Daggers',
      'Faithful Hound', 'Planar Ally', 'Rift Walk', 'Healing Spirit', 'Storm of Blades'
    ],
    Transmutation: [
      'Polymorph', 'Stone to Mud', 'Haste', 'Enlarge Form', 'Water Breathing',
      'Ironwood Skin', 'Feather Fall', 'Darkvision Draught', 'Shapechange', 'Time Slow',
      'Meld into Stone', 'Alter Self', 'Giant Strength', 'Passwall', 'Wind Walk'
    ]
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
      res.style.cssText = 'cursor:pointer;flex:1';
      var b = document.createElement('div');
      b.style.fontWeight = '600';
      b.textContent = t.name;
      var s = document.createElement('div');
      s.className = 'muted';
      s.style.fontSize = '.78rem';
      s.textContent = t.school;
      res.appendChild(b);
      res.appendChild(s);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      var full = t.name + ' (' + t.school + ')';
      function doCopy() {
        TN.copy(full).then(function (ok) {
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
        var sel = TN.el(SLUG + '-school').value;
        var keys = sel === 'all' ? Object.keys(SCHOOLS) : [sel];
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 300) {
          guard++;
          var school = pick(keys);
          var name = pick(SCHOOLS[school]);
          if (!seen[name]) { seen[name] = true; out.push({ name: name, school: school }); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'The conjuring failed. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
