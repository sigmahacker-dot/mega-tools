(function () {
  'use strict';
  var P = 'upside-down-text-generator-', ERR = P + 'error';
  var MAP = { a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z',
    A:'∀',B:'𐐒',C:'Ɔ',D:'ᗡ',E:'Ǝ',F:'Ⅎ',G:'⅁',H:'H',I:'I',J:'ſ',K:'⋊',L:'˥',M:'W',N:'N',O:'O',P:'Ԁ',Q:'Ό',R:'ᴚ',S:'S',T:'⊥',U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z',
    '0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6',
    '.':'˙',',':'‘','?':'¿','!':'¡',"'":"‚",'"':'„','(' :')',')':'(','[':']',']':'[','{':'}','}':'{','<':'>','>':'<','_':'‾','&':'⅋',';':'؛',':':':','-':'-',' ':' ' };
  function flip(s) {
    var out = '';
    for (var i = s.length - 1; i >= 0; i--) {
      var ch = s[i];
      out += MAP[ch] !== undefined ? MAP[ch] : (MAP[ch.toLowerCase()] !== undefined && ch === ch.toUpperCase() ? MAP[ch.toLowerCase()] : ch);
    }
    return out;
  }
  function update() {
    try {
      TN.clearErr(ERR);
      TN.el(P + 'output').value = flip(TN.el(P + 'input').value || '');
    } catch (e) { TN.setErr(ERR, 'Could not flip the text. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 80));
    TN.on(P + 'copy', 'click', function () {
      var v = TN.el(P + 'output').value;
      if (!v) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
      TN.clearErr(ERR);
      TN.copy(v).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy result'; }, 1200);
      });
    });
    TN.on(P + 'clear', 'click', function () {
      TN.el(P + 'input').value = ''; TN.clearErr(ERR); update(); TN.el(P + 'input').focus();
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
