/* Sparkles Text Decorator — 10 decorative Unicode frames. */
(function () {
  'use strict';
  var SLUG = 'sparkles-text-decorator';
  var STYLES = [
    { name: 'Sparkle frame', wrap: function (t) { return '⋆｡‧˚ʚ✦ɞ˚‧｡⋆ ' + t + ' ⋆｡‧˚ʚ✦ɞ˚‧｡⋆'; } },
    { name: 'Heart sparkles', wrap: function (t) { return '♡･ﾟ✧ ' + t + ' ✧ﾟ･♡'; } },
    { name: 'Star burst', wrap: function (t) { return '✧･ﾟ: *✧･ﾟ:* ' + t + ' *:･ﾟ✧*:･ﾟ✧'; } },
    { name: 'Flower arrow', wrap: function (t) { return '˚₊· ͟͟͞͞➳❥ ' + t + ' ❥➳ ͟͟͞͞₊˚'; } },
    { name: 'Kawaii face', wrap: function (t) { return '╰(✿´⌣`✿)╯♡ ' + t + ' ♡╰(✿´⌣`✿)╯'; } },
    { name: 'Cheer', wrap: function (t) { return '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ ' + t + ' ✧ﾟ･:*ヽ(◕ヮ◕ヽ)'; } },
    { name: 'Shocked cute', wrap: function (t) { return '°˖✧◝(⁰▿⁰)◜✧˖° ' + t + ' °˖✧◝(⁰▿⁰)◜✧˖°'; } },
    { name: 'Soft dots', wrap: function (t) { return '｡･:*˚:✧｡ ' + t + ' ｡✧:˚*:･｡'; } },
    { name: 'Star divider', wrap: function (t) { return '─── ⋆⋅☆⋅⋆ ───\n' + t + '\n─── ⋆⋅☆⋅⋆ ───'; } },
    { name: 'Sparkle sandwich', wrap: function (t) { return '✧･ﾟ ' + t + ' ﾟ･✧'; } }
  ];
  var selected = 0;

  function currentText() {
    var v = TN.el(SLUG + '-input').value;
    return v ? v : 'your text';
  }

  function preview() {
    TN.el(SLUG + '-output').textContent = STYLES[selected].wrap(currentText());
  }

  try {
    var box = TN.el(SLUG + '-styles');
    STYLES.forEach(function (s, i) {
      var b = document.createElement('button');
      b.className = 'btn' + (i === 0 ? ' btn-primary' : ' btn-outline');
      b.textContent = s.name;
      b.addEventListener('click', function () {
        selected = i;
        var btns = box.querySelectorAll('button');
        for (var j = 0; j < btns.length; j++) {
          btns[j].className = 'btn' + (j === i ? ' btn-primary' : ' btn-outline');
        }
        preview();
      });
      box.appendChild(b);
    });
    TN.on(SLUG + '-input', 'input', preview);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
    preview();
  } catch (e) { /* never throw on load */ }
})();
