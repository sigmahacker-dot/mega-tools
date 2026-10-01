/* First aid reference: searchable cards with step-by-step guidance. */
(function () {
  'use strict';
  var SLUG = 'first-aid-reference';
  function $(id) { return document.getElementById(id); }
  var CARDS = [
    ['CPR (adult)', 'cpr cardiac arrest unconscious compressions', [
      'Call emergency services and send someone for an AED.',
      'Place the heel of your hand on the center of the chest, other hand on top.',
      'Push hard and fast: 5–6 cm deep, 100–120 compressions per minute.',
      'Allow full chest recoil between compressions.',
      'Keep going without stopping until help arrives or an AED is ready.',
      'If trained, give 2 rescue breaths after every 30 compressions.'
    ]],
    ['Choking (adult)', 'choking heimlich airway food stuck', [
      'Ask "Are you choking?" — if they cannot cough, speak, or breathe, act now.',
      'Stand behind, lean them slightly forward.',
      'Give 5 sharp back blows between the shoulder blades with the heel of your hand.',
      'Then 5 abdominal thrusts: fist above the navel, quick inward-upward pulls.',
      'Alternate 5 back blows and 5 thrusts until the object clears or they collapse.',
      'If they collapse, call emergency services and start CPR.'
    ]],
    ['Severe bleeding', 'bleeding blood wound cut hemorrhage tourniquet', [
      'Call emergency services immediately.',
      'Press firmly on the wound with a clean cloth or bandage.',
      'Do not remove the first cloth — add more layers on top.',
      'Keep pressure on continuously; raise the injured limb if possible.',
      'If bleeding is life-threatening and will not stop, apply a tourniquet above the wound.',
      'Keep the person still and warm until help arrives.'
    ]],
    ['Burns', 'burn scald hot fire thermal', [
      'Cool the burn under cool (not ice-cold) running water for at least 20 minutes.',
      'Remove jewelry and loose clothing near the burn, unless stuck to skin.',
      'Cover loosely with cling film or a clean non-fluffy cloth.',
      'Do NOT apply ice, butter, toothpaste, or oils.',
      'Give pain relief if available.',
      'Seek medical help for burns larger than the palm, on face/hands/joints, or in children.'
    ]],
    ['Nosebleed', 'nosebleed nose bleed epistaxis', [
      'Sit upright and lean slightly forward (do not tilt the head back).',
      'Pinch the soft part of the nose firmly shut.',
      'Hold continuous pressure for 15 minutes — do not keep checking.',
      'Spit out any blood; swallowing it causes nausea.',
      'After it stops, avoid blowing the nose or heavy exertion for 24 hours.',
      'Seek care if it lasts over 30 minutes, follows a head injury, or recurs often.'
    ]],
    ['Sprain', 'sprain ankle twist rice swelling', [
      'Stop the activity and rest the injured joint.',
      'Apply ice wrapped in a cloth for 15–20 minutes, a few times a day.',
      'Compress gently with an elastic bandage — not too tight.',
      'Elevate the limb above heart level to reduce swelling.',
      'Avoid heat, alcohol, and massage in the first 48–72 hours.',
      'Seek care if you cannot bear weight, heard a pop, or it looks deformed.'
    ]]
  ];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function render(filter) {
    var box = $(SLUG + '-cards');
    var f = (filter || '').toLowerCase().trim();
    var html = '';
    var shown = 0;
    CARDS.forEach(function (c, i) {
      if (f && (c[0] + ' ' + c[1]).toLowerCase().indexOf(f) === -1) return;
      shown++;
      html += '<details class="result" style="margin-bottom:8px" ' + (shown === 1 && f ? 'open' : '') + '>' +
        '<summary style="cursor:pointer;font-weight:bold">' + esc(c[0]) + '</summary><ol>';
      c[2].forEach(function (s) { html += '<li>' + esc(s) + '</li>'; });
      html += '</ol></details>';
    });
    box.innerHTML = html || '<p class="muted">No matching situations found.</p>';
  }
  try {
    $(SLUG + '-search').addEventListener('input', function () { render($(SLUG + '-search').value); });
    render('');
  } catch (e) { /* never throw on load */ }
})();
