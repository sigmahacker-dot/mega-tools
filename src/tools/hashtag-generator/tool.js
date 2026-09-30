/* Hashtag Generator — template-based hashtag ideas */
(function () {
  'use strict';
  var input = TN.el('hashtag-generator-input');
  var list = TN.el('hashtag-generator-list');
  if (!input || !list) return;

  var GENERIC = ['love', 'instagood', 'photooftheday', 'fashion', 'beautiful', 'happy', 'cute', 'tbt', 'like4like', 'followme', 'picoftheday', 'art', 'nature', 'smile', 'style', 'fun', 'instadaily', 'igers', 'nofilter', 'life'];

  function cleanKeyword(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function buildTags(kw) {
    var tags = [];
    function add(t) { if (tags.indexOf(t) === -1) tags.push(t); }
    /* keyword variations */
    add('#' + kw);
    add('#' + kw + 'tips');
    add('#' + kw + 'life');
    add('#' + kw + 'love');
    add('#' + kw + 'daily');
    add('#' + kw + 'oftheday');
    add('#' + kw + 'community');
    add('#' + kw + 'addict');
    add('#my' + kw);
    add('#ilove' + kw);
    add('#insta' + kw);
    add('#' + kw + 'gram');
    add('#ig' + kw);
    /* generic reach tags */
    var shuffled = GENERIC.slice().sort(function () { return Math.random() - 0.5; });
    for (var i = 0; i < shuffled.length && tags.length < 20; i++) add('#' + shuffled[i]);
    return tags.slice(0, 20);
  }

  function render(tags) {
    list.innerHTML = '';
    tags.forEach(function (tag) {
      var span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      span.style.cursor = 'pointer';
      span.title = 'Click to copy';
      span.addEventListener('click', function () {
        TN.copy(tag).then(function (ok) {
          span.textContent = ok ? tag + ' ✓' : tag;
          setTimeout(function () { span.textContent = tag; }, 900);
        });
      });
      list.appendChild(span);
    });
  }

  var lastTags = [];
  function generate() {
    TN.clearErr('hashtag-generator-error');
    var kw = cleanKeyword(input.value);
    if (!kw) { TN.setErr('hashtag-generator-error', 'Type a keyword first, e.g. "travel".'); return; }
    lastTags = buildTags(kw);
    render(lastTags);
  }

  TN.on('hashtag-generator-generate', 'click', generate);
  TN.on('hashtag-generator-input', 'keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); generate(); }
  });
  TN.on('hashtag-generator-copyall', 'click', function () {
    if (!lastTags.length) { TN.setErr('hashtag-generator-error', 'Generate hashtags first.'); return; }
    TN.clearErr('hashtag-generator-error');
    TN.copy(lastTags.join(' ')).then(function (ok) {
      if (!ok) TN.setErr('hashtag-generator-error', 'Copy failed in this browser. Select the tags and press Ctrl/Cmd+C.');
    });
  });
})();
